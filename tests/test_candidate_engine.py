"""Unit tests for CosmicWatch candidate prioritization engine."""
import pytest
from backend.services.candidate_engine import CandidateEngine


@pytest.fixture
def engine():
    return CandidateEngine()


def test_high_priority_candidate(engine):
    """A clear drifting narrowband signal present only on-source should get high priority."""
    result = engine.evaluate_candidate(
        signal_confidence=0.95,
        anomaly_score=0.92,
        persistence=0.90,
        narrowband_likelihood=0.88,
        rfi_likelihood=0.10,
        on_source_detected=True,
        off_source_detected=False,
        frequency_drift_detected=True,
    )

    assert result["candidate_score"] >= 75
    assert result["status"] == "HIGH PRIORITY FOR REVIEW"
    assert "HUMAN REVIEW" in result["recommendation"]
    assert "extraterrestrial" in result["disclaimer"].lower()


def test_rfi_candidate_demoted(engine):
    """Signals appearing both ON and OFF source must be classified as RFI and demoted."""
    result = engine.evaluate_candidate(
        signal_confidence=0.95,
        anomaly_score=0.80,
        persistence=0.90,
        narrowband_likelihood=0.85,
        rfi_likelihood=0.90,
        on_source_detected=True,
        off_source_detected=True,  # detected off-source -> RFI!
        frequency_drift_detected=False,
    )

    assert result["status"] == "POSSIBLE RFI"
    assert result["candidate_score"] < 60
    assert "interference" in result["recommendation"].lower() or "rfi" in result["recommendation"].lower()


def test_normal_noise_low_score(engine):
    """Background noise should receive low priority."""
    result = engine.evaluate_candidate(
        signal_confidence=0.10,
        anomaly_score=0.12,
        persistence=0.05,
        narrowband_likelihood=0.15,
        rfi_likelihood=0.05,
        on_source_detected=False,
        off_source_detected=False,
        frequency_drift_detected=False,
    )

    assert result["candidate_score"] < 40
    assert result["status"] == "LIKELY NORMAL"
