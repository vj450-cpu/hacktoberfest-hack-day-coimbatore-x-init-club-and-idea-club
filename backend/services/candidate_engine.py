"""
CosmicWatch - Candidate Prioritization Engine.

Combines signal confidence, anomaly score, persistence, narrowband likelihood,
RFI interference likelihood, and ON/OFF cross-observation consistency into
a unified 0-100 CosmicWatch Candidate Score.

All weights and thresholds are externally configured in YAML.
"""

import os
from typing import Dict, Any, Optional
import yaml


DEFAULT_CONFIG = {
    "weights": {
        "signal_confidence": 0.25,
        "anomaly_score": 0.25,
        "persistence": 0.15,
        "narrowband_likelihood": 0.15,
        "on_off_consistency": 0.20,
    },
    "penalties": {
        "rfi_penalty_factor": 0.40,
    },
    "thresholds": {
        "high_priority": 80,
        "interesting": 60,
        "possible_rfi": 40,
        "likely_normal": 0,
    },
    "verification_labels": {
        "high_priority": "HIGH PRIORITY FOR REVIEW",
        "interesting": "INTERESTING CANDIDATE",
        "possible_rfi": "POSSIBLE RFI",
        "likely_normal": "LIKELY NORMAL",
    },
    "disclaimer": "This system identifies unusual astronomical data patterns. It does not establish extraterrestrial origin."
}


class CandidateEngine:
    """
    Computes candidate scores and prioritizes astronomical signals for human review.
    """

    def __init__(self, config_path: Optional[str] = None):
        self.config = DEFAULT_CONFIG.copy()
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    loaded = yaml.safe_load(f)
                    if loaded:
                        self.config.update(loaded)
            except Exception as e:
                print(f"Warning: Could not read scoring config from {config_path}: {e}")

        self.weights = self.config.get("weights", DEFAULT_CONFIG["weights"])
        self.penalties = self.config.get("penalties", DEFAULT_CONFIG["penalties"])
        self.thresholds = self.config.get("thresholds", DEFAULT_CONFIG["thresholds"])
        self.labels = self.config.get("verification_labels", DEFAULT_CONFIG["verification_labels"])

    def evaluate_candidate(
        self,
        signal_confidence: float,
        anomaly_score: float,
        persistence: float,
        narrowband_likelihood: float,
        rfi_likelihood: float = 0.0,
        on_source_detected: bool = True,
        off_source_detected: bool = False,
        frequency_drift_detected: bool = False,
    ) -> Dict[str, Any]:
        """
        Calculates the CosmicWatch candidate score and verification status.

        Args:
            signal_confidence: [0.0, 1.0] from CNN vision classifier
            anomaly_score: [0.0, 1.0] from Isolation Forest / feature detector
            persistence: [0.0, 1.0] continuity across time integration
            narrowband_likelihood: [0.0, 1.0] concentration in few frequency channels
            rfi_likelihood: [0.0, 1.0] estimated probability of local terrestrial interference
            on_source_detected: True if signal present in ON-target observation
            off_source_detected: True if signal present in OFF-target pointing
            frequency_drift_detected: True if Doppler drift observed (often indicating non-terrestrial frame)

        Returns:
            Dict containing scores, verification status, and investigation recommendations.
        """
        # 1. Calculate ON/OFF consistency score
        # Ideal candidate: detected ON-source, NOT detected OFF-source (consistency = 1.0)
        # Terrestrial RFI: detected both ON-source and OFF-source (consistency = 0.0)
        # Undetected anywhere: 0.0
        if on_source_detected and not off_source_detected:
            on_off_consistency = 1.0
        elif on_source_detected and off_source_detected:
            on_off_consistency = 0.15
            # Automatically inflate RFI likelihood if detected off-source
            rfi_likelihood = max(rfi_likelihood, 0.85)
        elif not on_source_detected and not off_source_detected:
            on_off_consistency = 0.0
        else:
            on_off_consistency = 0.0

        # Doppler drift bonus/modifier (terrestrial stationary transmitters rarely drift in topocentric frame)
        drift_bonus = 0.05 if frequency_drift_detected and rfi_likelihood < 0.5 else 0.0

        # 2. Weighted component sum
        w_sig = self.weights.get("signal_confidence", 0.25)
        w_anom = self.weights.get("anomaly_score", 0.25)
        w_pers = self.weights.get("persistence", 0.15)
        w_narr = self.weights.get("narrowband_likelihood", 0.15)
        w_onoff = self.weights.get("on_off_consistency", 0.20)

        raw_base = (
            (signal_confidence * w_sig) +
            (anomaly_score * w_anom) +
            (persistence * w_pers) +
            (narrowband_likelihood * w_narr) +
            (on_off_consistency * w_onoff) +
            drift_bonus
        )

        # 3. Apply RFI penalty
        rfi_penalty = self.penalties.get("rfi_penalty_factor", 0.40) * rfi_likelihood
        penalized_score = raw_base * (1.0 - rfi_penalty)

        # 4. Scale to integer 0–100
        candidate_score = int(round(max(0.0, min(100.0, penalized_score * 100.0))))

        # 5. Determine verification status
        if rfi_likelihood >= 0.70 or (on_source_detected and off_source_detected):
            status = self.labels["possible_rfi"]
            recommendation = "Candidate matches known RFI profile or appears in off-source observation. Likely local interference."
        elif candidate_score >= self.thresholds["high_priority"]:
            status = self.labels["high_priority"]
            recommendation = "HIGH PRIORITY FOR HUMAN REVIEW: Candidate requires follow-up observation on primary radio telescope."
        elif candidate_score >= self.thresholds["interesting"]:
            status = self.labels["interesting"]
            recommendation = "Candidate exhibits notable spectral features. Candidate requires further observation."
        else:
            status = self.labels["likely_normal"]
            recommendation = "Consistent with thermal receiver background or baseline noise. Low priority."

        return {
            "candidate_score": candidate_score,
            "status": status,
            "recommendation": recommendation,
            "components": {
                "signal_confidence": round(signal_confidence, 4),
                "anomaly_score": round(anomaly_score, 4),
                "persistence": round(persistence, 4),
                "narrowband_likelihood": round(narrowband_likelihood, 4),
                "rfi_likelihood": round(rfi_likelihood, 4),
                "on_off_consistency": round(on_off_consistency, 4),
                "frequency_drift_detected": frequency_drift_detected,
                "on_source_detected": on_source_detected,
                "off_source_detected": off_source_detected,
            },
            "weights_used": self.weights,
            "disclaimer": self.config.get("disclaimer", DEFAULT_CONFIG["disclaimer"])
        }
