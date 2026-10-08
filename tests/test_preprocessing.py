"""Unit tests for CosmicWatch data preprocessing and normalization."""
import numpy as np
import pytest
from ml.preprocessing.normalize import (
    db_scale_norm,
    min_max_norm,
    robust_percentile_norm,
    preprocess_waterfall,
)
from ml.preprocessing.waterfall import slice_waterfall, WaterfallWindow


def test_min_max_norm():
    arr = np.array([[10.0, 20.0], [30.0, 40.0]])
    norm = min_max_norm(arr)
    assert norm.min() == pytest.approx(0.0)
    assert norm.max() == pytest.approx(1.0)
    assert norm.shape == arr.shape


def test_robust_percentile_norm():
    # Array with an extreme RFI spike
    arr = np.ones((16, 64), dtype=np.float32)
    arr[5, 10] = 10000.0  # huge spike
    norm = robust_percentile_norm(arr)
    # The non-spike values should not be completely zeroed out
    assert norm.min() >= 0.0
    assert norm.max() <= 1.0


def test_preprocess_waterfall():
    raw = np.random.uniform(1.0, 50.0, size=(16, 128)).astype(np.float32)
    processed = preprocess_waterfall(raw)
    assert processed.shape == (16, 128)
    assert 0.0 <= processed.min() <= processed.max() <= 1.0


def test_slice_waterfall():
    full_data = np.random.uniform(0.1, 10.0, size=(32, 512)).astype(np.float32)
    window = slice_waterfall(
        full_data=full_data,
        freq_start_idx=100,
        freq_width=128,
        time_start_idx=0,
        time_width=16,
        observation_id="TEST-OBS-01",
        target_name="TEST-STAR"
    )
    assert isinstance(window, WaterfallWindow)
    assert window.data.shape == (16, 128)
    assert window.observation_id == "TEST-OBS-01"
    assert window.target_name == "TEST-STAR"
