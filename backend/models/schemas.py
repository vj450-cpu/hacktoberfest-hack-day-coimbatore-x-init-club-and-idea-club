"""
CosmicWatch - Pydantic Schemas for API Requests & Responses.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    mode: str = "astronomical_observatory"
    ai_backbone: str = "PyTorch LightweightSpectrogramResNet"
    anomaly_engine: str = "IsolationForest"
    llm_explainer: str = "Gemma-Aligned Scientific Reasoning"


class CandidateSummary(BaseModel):
    candidate_id: str
    candidate_score: int
    signal_confidence: float
    anomaly_score: float
    rfi_likelihood: float
    status: str
    classification: str
    target_name: str
    telescope: str
    is_synthetic: bool
    signal_type: str


class StatisticsResponse(BaseModel):
    observations_analyzed: int
    normal_observations: int
    known_normal_signals: int
    anomalies: int
    high_priority_candidates: int
    possible_rfi: int


class AnalyzeRequest(BaseModel):
    sample_type: Optional[str] = Field(
        default="DRIFTING_NARROWBAND",
        description="Synthetic sample type (DRIFTING_NARROWBAND, NARROWBAND, INTERMITTENT, BROADBAND_BURST, TERRESTRIAL_RFI, NORMAL_NOISE) or 'real_bl'"
    )
    target_name: Optional[str] = "TARGET-OBS-01"
    telescope: Optional[str] = "Green Bank Telescope"
    snr_db: Optional[float] = 14.0


class AnalyzeResponse(BaseModel):
    candidate_id: str
    signal_confidence: float
    anomaly_score: float
    candidate_score: int
    rfi_likelihood: float
    persistence: float
    narrowband_likelihood: float
    classification: str
    status: str
    explanation: str
    recommendation: str
    model_used: str
    is_synthetic: bool
    signal_type: str
    target_name: str
    telescope: str
    freq_range_mhz: List[float]
    heatmap: Optional[Dict[str, Any]] = None
    on_off_status: Optional[Dict[str, Any]] = None
    disclaimer: str


class ExplainRequest(BaseModel):
    signal_confidence: Optional[float] = None
    anomaly_score: Optional[float] = None
    persistence: Optional[float] = None
    rfi_likelihood: Optional[float] = None
    on_source_detected: Optional[bool] = None
    off_source_detected: Optional[bool] = None
    frequency_drift: Optional[bool] = None


class ExplainResponse(BaseModel):
    candidate_id: str
    explanation: str
    model_used: str
    provider: str
    recommendation: str
    disclaimer: str
