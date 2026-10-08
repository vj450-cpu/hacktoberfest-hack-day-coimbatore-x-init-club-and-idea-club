"""
CosmicWatch - End-to-End Pipeline Service.

Connects:
  Data / Waterfall -> Signal Classifier -> Anomaly Detector
  -> Candidate Prioritization Engine -> LLM Explanation -> Catalog
"""

import os
import uuid
from typing import Dict, Any, List, Optional
import numpy as np

from ml.preprocessing.waterfall import WaterfallWindow, preprocess_waterfall
from ml.data.synthetic_generator import SyntheticSignalGenerator
from ml.data.load_breakthrough import BreakthroughListenLoader
from ml.inference.classifier import SignalDetector
from ml.anomaly_detection.anomaly_detector import AnomalyDetector
from backend.services.candidate_engine import CandidateEngine
from backend.services.llm_service import LLMExplanationService


class PipelineService:
    """
    Central orchestration service for astronomical candidate analysis.
    """

    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or os.path.join(
            os.path.dirname(__file__), "..", "..", "ml", "config", "scoring_weights.yaml"
        )
        self.signal_detector = SignalDetector()
        self.anomaly_detector = AnomalyDetector()
        self.candidate_engine = CandidateEngine(config_path=self.config_path)
        self.llm_service = LLMExplanationService()
        self.synthetic_gen = SyntheticSignalGenerator(seed=42)

        # In-memory candidate catalog (populated with demo scenarios on startup)
        self._catalog: Dict[str, Dict[str, Any]] = {}
        self._initialize_demo_catalog()

    def _initialize_demo_catalog(self):
        """Pre-populates catalog with diverse astronomical scenarios for hackathon demo."""
        scenarios = [
            ("CW-00427", "DRIFTING_NARROWBAND", 16.0, "Ross 128 (Target A)", False, True, "Green Bank Telescope"),
            ("CW-00891", "NARROWBAND", 11.5, "Proxima Centauri", False, False, "Parkes Observatory"),
            ("CW-00173", "TERRESTRIAL_RFI", 18.0, "Calibrator Pointing", True, False, "Green Bank Telescope"),
            ("CW-00902", "BROADBAND_BURST", 14.0, "FRB Field 121102", False, False, "MeerKAT Array"),
            ("CW-00054", "NORMAL_NOISE", 0.0, "Deep Sky Reference", False, False, "Green Bank Telescope"),
        ]

        for cid, stype, snr, target, is_rfi, drift, telescope in scenarios:
            w = self.synthetic_gen.generate_sample(
                signal_type=stype,
                snr_db=snr,
                observation_id=cid,
                target_name=target,
                telescope=telescope
            )
            # For ON/OFF comparison:
            on_window, off_window = self.synthetic_gen.generate_on_off_pair(
                signal_type=stype,
                is_rfi=is_rfi
            )
            analysis = self.analyze_window(
                window=w,
                candidate_id=cid,
                on_window=on_window,
                off_window=off_window,
                is_rfi=is_rfi,
                frequency_drift=drift
            )
            self._catalog[cid] = analysis

    def analyze_window(
        self,
        window: WaterfallWindow,
        candidate_id: Optional[str] = None,
        on_window: Optional[WaterfallWindow] = None,
        off_window: Optional[WaterfallWindow] = None,
        is_rfi: Optional[bool] = None,
        frequency_drift: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """
        Executes the full CosmicWatch pipeline:
        Spectrogram -> Signal Detection -> Anomaly Detection -> Scoring -> Explanation
        """
        cid = candidate_id or f"CW-{uuid.uuid4().hex[:5].upper()}"

        # 1. Signal Detection Model (CNN)
        sig_result = self.signal_detector.predict(window)
        sig_conf = sig_result["signal_confidence"]
        embedding = sig_result["embedding"]

        # 2. Anomaly Detection Layer
        anom_result = self.anomaly_detector.score(window, latent_embedding=embedding)
        anom_score = anom_result["anomaly_score"]
        astro_metrics = anom_result["astronomical_metrics"]

        # 3. ON/OFF Analysis
        if on_window is not None and off_window is not None:
            # Check detection in both
            on_pred = self.signal_detector.predict(on_window)
            off_pred = self.signal_detector.predict(off_window)
            on_detected = bool(on_pred["signal_confidence"] > 0.45)
            off_detected = bool(off_pred["signal_confidence"] > 0.45)
        else:
            on_detected = True
            off_detected = bool(is_rfi) if is_rfi is not None else False

        # RFI likelihood estimation
        if is_rfi:
            rfi_likelihood = 0.88
        elif off_detected:
            rfi_likelihood = 0.85
        elif window.injected_type == "TERRESTRIAL_RFI":
            rfi_likelihood = 0.92
        else:
            rfi_likelihood = float(round(max(0.05, 0.25 * (1.0 - astro_metrics["narrowband_likelihood"])), 4))

        has_drift = frequency_drift if frequency_drift is not None else (window.injected_type == "DRIFTING_NARROWBAND")

        # 4. Candidate Scoring Engine
        scoring = self.candidate_engine.evaluate_candidate(
            signal_confidence=sig_conf,
            anomaly_score=anom_score,
            persistence=astro_metrics["persistence"],
            narrowband_likelihood=astro_metrics["narrowband_likelihood"],
            rfi_likelihood=rfi_likelihood,
            on_source_detected=on_detected,
            off_source_detected=off_detected,
            frequency_drift_detected=has_drift,
        )

        # 5. LLM Explanation (Gemma / Qwen integration)
        explanation_payload = {
            "candidate_id": cid,
            "candidate_score": scoring["candidate_score"],
            "signal_confidence": sig_conf,
            "anomaly_score": anom_score,
            "persistence": astro_metrics["persistence"],
            "rfi_likelihood": rfi_likelihood,
            "on_source_detected": on_detected,
            "off_source_detected": off_detected,
            "frequency_drift": has_drift,
        }
        explanation_result = self.llm_service.explain(explanation_payload)

        # 6. Heatmap Payload for Frontend
        heatmap_data = window.to_json_heatmap()

        result = {
            "candidate_id": cid,
            "candidate_score": scoring["candidate_score"],
            "signal_confidence": sig_conf,
            "anomaly_score": anom_score,
            "rfi_likelihood": rfi_likelihood,
            "persistence": astro_metrics["persistence"],
            "narrowband_likelihood": astro_metrics["narrowband_likelihood"],
            "classification": sig_result["classification"],
            "status": scoring["status"],
            "recommendation": scoring["recommendation"],
            "explanation": explanation_result["explanation"],
            "model_used": explanation_result["model_used"],
            "is_synthetic": window.is_synthetic,
            "signal_type": window.injected_type or "OBSERVED",
            "observation_id": window.observation_id,
            "target_name": window.target_name,
            "telescope": window.telescope,
            "freq_range_mhz": [round(window.freq_start_mhz, 4), round(window.freq_end_mhz, 4)],
            "heatmap": heatmap_data,
            "on_off_status": {
                "on_detected": on_detected,
                "off_detected": off_detected,
                "on_off_consistency": scoring["components"]["on_off_consistency"]
            },
            "disclaimer": scoring["disclaimer"]
        }

        self._catalog[cid] = result
        return result

    def get_candidate(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        return self._catalog.get(candidate_id)

    def list_candidates(self) -> List[Dict[str, Any]]:
        """Returns candidate summaries for table view."""
        summaries = []
        for c in self._catalog.values():
            summaries.append({
                "candidate_id": c["candidate_id"],
                "candidate_score": c["candidate_score"],
                "signal_confidence": c["signal_confidence"],
                "anomaly_score": c["anomaly_score"],
                "rfi_likelihood": c["rfi_likelihood"],
                "status": c["status"],
                "classification": c["classification"],
                "target_name": c["target_name"],
                "telescope": c["telescope"],
                "is_synthetic": c["is_synthetic"],
                "signal_type": c["signal_type"]
            })
        # Sort descending by candidate score
        summaries.sort(key=lambda x: x["candidate_score"], reverse=True)
        return summaries

    def get_statistics(self) -> Dict[str, Any]:
        """Calculates dashboard summary metrics."""
        total = len(self._catalog)
        if total == 0:
            return {
                "observations_analyzed": 0,
                "normal_observations": 0,
                "known_normal_signals": 0,
                "anomalies": 0,
                "high_priority_candidates": 0,
                "possible_rfi": 0
            }

        high_pri = sum(1 for c in self._catalog.values() if c["candidate_score"] >= 80)
        anomalies = sum(1 for c in self._catalog.values() if c["anomaly_score"] >= 0.70)
        possible_rfi = sum(1 for c in self._catalog.values() if "RFI" in c["status"] or c["rfi_likelihood"] >= 0.70)
        normal = sum(1 for c in self._catalog.values() if c["candidate_score"] < 40 and not ("RFI" in c["status"]))
        known = total - normal - high_pri - possible_rfi

        return {
            "observations_analyzed": total,
            "normal_observations": normal,
            "known_normal_signals": max(0, known),
            "anomalies": anomalies,
            "high_priority_candidates": high_pri,
            "possible_rfi": possible_rfi
        }
