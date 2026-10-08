"""
CosmicWatch - FastAPI API Route Handlers.
"""

import io
from typing import List, Optional
import numpy as np
from PIL import Image
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends

from backend.models.schemas import (
    HealthResponse,
    CandidateSummary,
    StatisticsResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    ExplainRequest,
    ExplainResponse,
)
from backend.services.pipeline_service import PipelineService
from ml.preprocessing.waterfall import WaterfallWindow, preprocess_waterfall

router = APIRouter()

# Global pipeline instance (singleton for the application)
_pipeline: Optional[PipelineService] = None


def get_pipeline() -> PipelineService:
    global _pipeline
    if _pipeline is None:
        _pipeline = PipelineService()
    return _pipeline


@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse()


@router.get("/api/candidates", response_model=List[CandidateSummary])
def get_candidates(pipeline: PipelineService = Depends(get_pipeline)):
    return pipeline.list_candidates()


@router.get("/api/candidates/{candidate_id}", response_model=AnalyzeResponse)
def get_candidate(candidate_id: str, pipeline: PipelineService = Depends(get_pipeline)):
    cand = pipeline.get_candidate(candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found in catalog.")
    return cand


@router.get("/api/statistics", response_model=StatisticsResponse)
def get_statistics(pipeline: PipelineService = Depends(get_pipeline)):
    return pipeline.get_statistics()


@router.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_sample(
    request: AnalyzeRequest,
    pipeline: PipelineService = Depends(get_pipeline)
):
    """
    Analyzes a sample by identifier/profile (e.g. DRIFTING_NARROWBAND, NARROWBAND,
    INTERMITTENT, BROADBAND_BURST, TERRESTRIAL_RFI, NORMAL_NOISE).
    """
    stype = request.sample_type or "DRIFTING_NARROWBAND"
    is_rfi = (stype == "TERRESTRIAL_RFI")
    has_drift = (stype == "DRIFTING_NARROWBAND")

    # Generate synthetic target sample
    window = pipeline.synthetic_gen.generate_sample(
        signal_type=stype,
        snr_db=request.snr_db or 14.0,
        target_name=request.target_name or "TARGET-A",
        telescope=request.telescope or "Green Bank Telescope"
    )

    # Generate paired ON/OFF observations
    on_win, off_win = pipeline.synthetic_gen.generate_on_off_pair(
        signal_type=stype,
        is_rfi=is_rfi
    )

    result = pipeline.analyze_window(
        window=window,
        on_window=on_win,
        off_window=off_win,
        is_rfi=is_rfi,
        frequency_drift=has_drift
    )
    return result


@router.post("/api/analyze/upload", response_model=AnalyzeResponse)
async def analyze_uploaded_file(
    file: UploadFile = File(...),
    target_name: str = Form("UPLOADED-TARGET"),
    telescope: str = Form("Observatory Upload"),
    pipeline: PipelineService = Depends(get_pipeline)
):
    """
    Accepts an uploaded image or 2D array representation of a radio spectrogram.
    """
    contents = await file.read()
    try:
        # Attempt image load
        image = Image.open(io.BytesIO(contents)).convert("L")  # grayscale
        raw_arr = np.array(image, dtype=np.float32)
    except Exception:
        try:
            # Attempt numpy binary (.npy)
            raw_arr = np.load(io.BytesIO(contents)).astype(np.float32)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Provide a PNG/JPEG spectrogram image or .npy array: {e}"
            )

    norm_data = preprocess_waterfall(raw_arr)

    window = WaterfallWindow(
        data=norm_data,
        source_file=file.filename or "uploaded_waterfall",
        observation_id=f"CW-UPL-{np.random.randint(1000, 9999)}",
        target_name=target_name,
        telescope=telescope,
        freq_start_mhz=1420.0,
        freq_end_mhz=1420.0 + (norm_data.shape[1] * 2.79e-3),
        time_start_mjd=59000.0,
        time_end_mjd=59000.0 + (norm_data.shape[0] * 18.25 / 86400.0),
        time_steps=norm_data.shape[0],
        freq_channels=norm_data.shape[1],
        is_synthetic=False,
    )

    return pipeline.analyze_window(window=window)


@router.post("/api/explain/{candidate_id}", response_model=ExplainResponse)
def explain_candidate(
    candidate_id: str,
    override: Optional[ExplainRequest] = None,
    pipeline: PipelineService = Depends(get_pipeline)
):
    """
    Generates open-weight LLM scientific explanation for a specific candidate.
    """
    cand = pipeline.get_candidate(candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found.")

    payload = {
        "candidate_id": candidate_id,
        "candidate_score": cand["candidate_score"],
        "signal_confidence": cand["signal_confidence"],
        "anomaly_score": cand["anomaly_score"],
        "persistence": cand["persistence"],
        "rfi_likelihood": cand["rfi_likelihood"],
        "on_source_detected": cand.get("on_off_status", {}).get("on_detected", True),
        "off_source_detected": cand.get("on_off_status", {}).get("off_detected", False),
        "frequency_drift": cand.get("signal_type") == "DRIFTING_NARROWBAND",
    }

    if override:
        for k, v in override.model_dump(exclude_unset=True).items():
            if v is not None:
                payload[k] = v

    explanation_res = pipeline.llm_service.explain(payload)

    return {
        "candidate_id": candidate_id,
        "explanation": explanation_res["explanation"],
        "model_used": explanation_res["model_used"],
        "provider": explanation_res["provider"],
        "recommendation": cand["recommendation"],
        "disclaimer": cand["disclaimer"]
    }
