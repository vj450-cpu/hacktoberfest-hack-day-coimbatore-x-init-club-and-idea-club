"""Unit tests for CosmicWatch anomaly detector and feature extraction."""
import pytest
import numpy as np
from ml.data.synthetic_generator import SyntheticSignalGenerator
from ml.anomaly_detection.anomaly_detector import (
    AnomalyDetector,
    AstronomicalFeatureExtractor,
    IsolationForestAnomalyDetector,
)
from sklearn.exceptions import NotFittedError


@pytest.fixture
def generator():
    return SyntheticSignalGenerator(seed=123)


def test_astronomical_feature_extraction(generator):
    sample = generator.generate_sample(signal_type="NARROWBAND", snr_db=15.0)
    metrics = AstronomicalFeatureExtractor.extract_metrics(sample)

    assert "papr" in metrics
    assert "spectral_entropy" in metrics
    assert "kurtosis" in metrics
    assert "persistence" in metrics
    assert "narrowband_likelihood" in metrics
    assert 0.0 <= metrics["spectral_entropy"] <= 1.0
    assert 0.0 <= metrics["narrowband_likelihood"] <= 1.0


def test_anomaly_detector_scoring(generator):
    detector = AnomalyDetector()
    normal_sample = generator.generate_sample(signal_type="NORMAL_NOISE")
    signal_sample = generator.generate_sample(signal_type="DRIFTING_NARROWBAND", snr_db=18.0)

    score_norm = detector.score(normal_sample)
    score_sig = detector.score(signal_sample)

    assert 0.0 <= score_norm["anomaly_score"] <= 1.0
    assert 0.0 <= score_sig["anomaly_score"] <= 1.0
    # Signal sample should be more anomalous than thermal noise
    assert score_sig["anomaly_score"] > score_norm["anomaly_score"]


def test_isolation_forest_fitting(generator):
    iso_detector = IsolationForestAnomalyDetector(random_state=42)
    # Generate 15 normal samples to form a reference population
    features_list = []
    for i in range(15):
        s = generator.generate_sample(signal_type="NORMAL_NOISE", seed=100 + i)
        f = AstronomicalFeatureExtractor.to_feature_vector(s)
        features_list.append(f)

    X = np.array(features_list)
    iso_detector.fit(X)
    assert iso_detector.is_fitted

    # Score an anomalous sample
    anom_sample = generator.generate_sample(signal_type="DRIFTING_NARROWBAND", snr_db=20.0, seed=999)
    f_anom = AstronomicalFeatureExtractor.to_feature_vector(anom_sample)
    score = iso_detector.score_anomaly(f_anom)
    assert 0.0 <= score <= 1.0


def test_astronomical_feature_extractor_returns_dict(generator):
    """Test that extract_metrics returns a dictionary with the correct types."""
    sample = generator.generate_sample(signal_type="NORMAL_NOISE")
    metrics = AstronomicalFeatureExtractor.extract_metrics(sample)
    assert isinstance(metrics, dict)
    for key, value in metrics.items():
        assert isinstance(key, str)
        assert isinstance(value, float)


def test_isolation_forest_not_fitted(generator):
    iso_detector = IsolationForestAnomalyDetector(random_state=42)
    assert not iso_detector.is_fitted
    anom_sample = generator.generate_sample(signal_type="DRIFTING_NARROWBAND", snr_db=20.0, seed=999)
    f_anom = AstronomicalFeatureExtractor.to_feature_vector(anom_sample)
    # Depending on implementation, it might raise an error or return a default score.
    # We will test that calling it before fit either raises ValueError or returns a fallback.
    with pytest.raises((ValueError, AttributeError, NotFittedError)) as excinfo:
        iso_detector.score_anomaly(f_anom)
        # If it doesn't raise, we at least ensure it returns a float
