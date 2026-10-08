"""Unit tests for FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "COSMICWATCH" in data.get("version", "1.0.0") or data["version"] == "1.0.0"


def test_get_candidates():
    res = client.get("/api/candidates")
    assert res.status_code == 200
    candidates = res.json()
    assert isinstance(candidates, list)
    assert len(candidates) > 0
    # First candidate should have high score
    assert "candidate_id" in candidates[0]
    assert "candidate_score" in candidates[0]


def test_get_statistics():
    res = client.get("/api/statistics")
    assert res.status_code == 200
    stats = res.json()
    assert "observations_analyzed" in stats
    assert stats["observations_analyzed"] > 0
    assert "high_priority_candidates" in stats


def test_analyze_endpoint():
    payload = {
        "sample_type": "DRIFTING_NARROWBAND",
        "target_name": "Kepler-452b",
        "telescope": "Green Bank Telescope",
        "snr_db": 16.0
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "candidate_id" in data
    assert "candidate_score" in data
    assert "explanation" in data
    assert "recommendation" in data
    assert "extraterrestrial" in data["disclaimer"].lower()


def test_explain_endpoint():
    res = client.get("/api/candidates")
    cid = res.json()[0]["candidate_id"]

    res_exp = client.post(f"/api/explain/{cid}", json={})
    assert res_exp.status_code == 200
    data = res_exp.json()
    assert data["candidate_id"] == cid
    assert "explanation" in data
    assert len(data["explanation"]) > 20
