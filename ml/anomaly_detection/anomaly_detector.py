"""
CosmicWatch - Anomaly Detection Module.

Calculates: "How unusual is this observation compared with the normal population?"
Pipeline:
  Feature Extraction (Latent Embedding + Spectral Statistics)
  -> Isolation Forest / Density Estimator
  -> Normalized Anomaly Score in [0.0, 1.0]

Modular architecture allows swapping out IsolationForest for an Autoencoder or One-Class SVM.
"""

from abc import ABC, abstractmethod
import os
from typing import Dict, Any, Optional, List
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

from ml.preprocessing.waterfall import WaterfallWindow


class BaseAnomalyDetector(ABC):
    """Abstract interface for astronomical anomaly detectors."""

    @abstractmethod
    def fit(self, features: np.ndarray) -> None:
        """Fit detector on a reference population of normal observations."""
        pass

    @abstractmethod
    def score_anomaly(self, feature_vector: np.ndarray) -> float:
        """Compute normalized anomaly score in [0.0, 1.0]."""
        pass


class IsolationForestAnomalyDetector(BaseAnomalyDetector):
    """
    Isolation Forest anomaly detector operating on combined latent embeddings
    and radio frequency statistics (spectral entropy, kurtosis, channel variance).
    """

    def __init__(self, contamination: float = 0.05, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=self.random_state,
            n_jobs=-1
        )
        self.is_fitted = False
        self._score_min = -0.5
        self._score_max = 0.5

    def fit(self, features: np.ndarray) -> None:
        """Fits on training feature matrix (N, D)."""
        self.model.fit(features)
        self.is_fitted = True
        # Calibrate min/max decision function scores
        raw_scores = self.model.decision_function(features)
        self._score_min = float(np.min(raw_scores))
        self._score_max = float(np.max(raw_scores))

    def score_anomaly(self, feature_vector: np.ndarray) -> float:
        """
        Outputs normalized anomaly score in [0.0, 1.0].
        In scikit-learn IsolationForest:
        Lower decision_function values = more abnormal / anomalous.
        We invert this so 1.0 = highly anomalous, 0.0 = completely normal.
        """
        if not self.is_fitted:
            # Return baseline prior if not fitted
            return 0.50

        if feature_vector.ndim == 1:
            vec = feature_vector.reshape(1, -1)
        else:
            vec = feature_vector

        raw = float(self.model.decision_function(vec)[0])
        # Invert: raw < 0 is an anomaly, raw > 0 is inlier
        # Map raw decision function to [0, 1] range:
        # Standard IF decision_function typically ranges between -0.3 and +0.3
        score = 1.0 - (raw + 0.3) / 0.6
        return float(np.clip(score, 0.0, 1.0))

    def save(self, filepath: str) -> None:
        """Persists fitted model."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath: str) -> "IsolationForestAnomalyDetector":
        """Loads fitted model."""
        return joblib.load(filepath)


class AstronomicalFeatureExtractor:
    """
    Extracts physically motivated radio-astronomy features:
    - Spectral kurtosis: detects non-Gaussianity across channels
    - Spectral entropy: detects narrow spectral clustering
    - Peak-to-average power ratio (PAPR)
    - Channel drift coherence
    - Temporal persistence
    """

    @staticmethod
    def extract_metrics(window: WaterfallWindow) -> Dict[str, float]:
        data = window.data.astype(np.float32)
        time_steps, freq_channels = data.shape

        # Channel mean power profile
        mean_spectrum = np.mean(data, axis=0)
        std_spectrum = np.std(data, axis=0)

        # 1. Peak-to-average power ratio (PAPR)
        mean_pwr = float(np.mean(mean_spectrum)) + 1e-9
        max_pwr = float(np.max(mean_spectrum))
        papr = max_pwr / mean_pwr

        # 2. Spectral Entropy (lower entropy = concentrated in few channels / narrowband)
        norm_spec = mean_spectrum / (np.sum(mean_spectrum) + 1e-9)
        norm_spec = norm_spec[norm_spec > 1e-9]
        entropy = -float(np.sum(norm_spec * np.log2(norm_spec)))
        max_entropy = np.log2(freq_channels)
        norm_entropy = entropy / (max_entropy + 1e-9)

        # 3. Spectral Kurtosis (excess kurtosis indicates non-Gaussian signals)
        diff = mean_spectrum - np.mean(mean_spectrum)
        m4 = np.mean(diff ** 4)
        m2 = np.mean(diff ** 2) + 1e-9
        kurtosis = float(m4 / (m2 ** 2) - 3.0)

        # 4. Persistence across time integrations
        # Fraction of time steps where the dominant channel exceeds 2.5 sigma above median
        peak_chan = int(np.argmax(mean_spectrum))
        chan_time_series = data[:, peak_chan]
        thresh = np.median(chan_time_series) + 2.0 * (np.std(chan_time_series) + 1e-9)
        persistence = float(np.mean(chan_time_series > thresh))

        # 5. Narrowband Likelihood: inverse of spectral spread
        top_5_channels_ratio = float(np.sum(np.sort(mean_spectrum)[-5:]) / (np.sum(mean_spectrum) + 1e-9))

        return {
            "papr": round(papr, 4),
            "spectral_entropy": round(norm_entropy, 4),
            "kurtosis": round(kurtosis, 4),
            "persistence": round(min(1.0, persistence * 1.5), 4),
            "narrowband_likelihood": round(min(1.0, top_5_channels_ratio * 4.0), 4),
        }

    @classmethod
    def to_feature_vector(cls, window: WaterfallWindow, latent_embedding: Optional[np.ndarray] = None) -> np.ndarray:
        metrics = cls.extract_metrics(window)
        stat_features = np.array([
            metrics["papr"] / 10.0,
            metrics["spectral_entropy"],
            np.clip(metrics["kurtosis"] / 20.0, -1.0, 5.0),
            metrics["persistence"],
            metrics["narrowband_likelihood"],
        ], dtype=np.float32)

        if latent_embedding is not None and len(latent_embedding) > 0:
            return np.concatenate([latent_embedding, stat_features])
        return stat_features


class AnomalyDetector:
    """
    Facade uniting Latent Vision Embeddings, Astronomical Feature Extraction,
    and Isolation Forest into a single high-level anomaly scoring service.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.detector = IsolationForestAnomalyDetector()
        self.model_path = model_path
        if model_path and os.path.exists(model_path):
            try:
                self.detector = IsolationForestAnomalyDetector.load(model_path)
            except Exception as e:
                print(f"Warning: Failed to load anomaly detector from {model_path}: {e}")

    def score(self, window: WaterfallWindow, latent_embedding: Optional[np.ndarray] = None) -> Dict[str, Any]:
        metrics = AstronomicalFeatureExtractor.extract_metrics(window)
        vec = AstronomicalFeatureExtractor.to_feature_vector(window, latent_embedding)

        if self.detector.is_fitted:
            score = self.detector.score_anomaly(vec)
        else:
            # Calibrated deterministic fallback when offline or pre-training:
            # Combines non-Gaussian kurtosis, high PAPR, and low entropy into an anomaly measure
            raw_anomaly = (
                0.35 * metrics["narrowband_likelihood"] +
                0.30 * min(1.0, max(0.0, metrics["kurtosis"] / 15.0)) +
                0.20 * min(1.0, metrics["papr"] / 6.0) +
                0.15 * (1.0 - metrics["spectral_entropy"])
            )
            score = float(np.clip(raw_anomaly, 0.05, 0.98))

        return {
            "anomaly_score": round(score, 4),
            "astronomical_metrics": metrics,
            "is_fitted": self.detector.is_fitted
        }
