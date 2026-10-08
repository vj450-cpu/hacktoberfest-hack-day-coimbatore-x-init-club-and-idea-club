"""
CosmicWatch - Normalization Module for Astronomical Radio Spectrograms.

Astronomical radio data (such as Breakthrough Listen filterbank files)
often contains high dynamic ranges with strong cosmic sources or terrestrial RFI spikes.
This module provides robust normalization routines:
- robust_percentile_norm: clips extreme outliers (e.g. 1st to 99.5th percentile) and normalizes to [0, 1]
- z_score_norm: standardizes mean=0, std=1 per time integration or entire block
- db_scale_norm: decibel (logarithmic) scale power transform
- min_max_norm: standard linear scaling to [0, 1]
"""

from typing import Optional, Tuple
import numpy as np


def db_scale_norm(data: np.ndarray, eps: float = 1e-9) -> np.ndarray:
    """
    Applies logarithmic (dB) scale power transformation: 10 * log10(data + eps).
    Useful for wide-dynamic-range power spectrograms.
    """
    clipped = np.maximum(data, eps)
    db = 10.0 * np.log10(clipped)
    return db


def min_max_norm(data: np.ndarray, eps: float = 1e-9) -> np.ndarray:
    """
    Linearly scales array to [0.0, 1.0].
    """
    min_val = np.min(data)
    max_val = np.max(data)
    diff = max_val - min_val
    if diff < eps:
        return np.zeros_like(data, dtype=np.float32)
    return ((data - min_val) / (diff + eps)).astype(np.float32)


def robust_percentile_norm(
    data: np.ndarray,
    p_low: float = 1.0,
    p_high: float = 99.5,
    eps: float = 1e-9,
) -> np.ndarray:
    """
    Robust percentile normalization that prevents extreme RFI spikes from
    crushing the visibility of faint astronomical / narrowband signals.
    
    1. Computes low and high percentiles (default 1% and 99.5%).
    2. Clips data to [v_low, v_high].
    3. Rescales clipped data to [0.0, 1.0].
    """
    v_low = float(np.percentile(data, p_low))
    v_high = float(np.percentile(data, p_high))
    
    if v_high - v_low < eps:
        return np.zeros_like(data, dtype=np.float32)
    
    clipped = np.clip(data, v_low, v_high)
    normalized = (clipped - v_low) / (v_high - v_low + eps)
    return normalized.astype(np.float32)


def z_score_norm(data: np.ndarray, axis: Optional[int] = None, eps: float = 1e-9) -> np.ndarray:
    """
    Performs standard Z-score normalization (mean=0, std=1).
    If axis is 0, normalizes each frequency channel across time.
    If axis is 1, normalizes each time slice across frequency (baseline flattening).
    """
    mean = np.mean(data, axis=axis, keepdims=True)
    std = np.std(data, axis=axis, keepdims=True)
    return ((data - mean) / (std + eps)).astype(np.float32)


def preprocess_waterfall(
    data: np.ndarray,
    apply_db: bool = True,
    flatten_baseline: bool = True,
    robust_clip: bool = True,
) -> np.ndarray:
    """
    Standard end-to-end preprocessing pipeline for a 2D waterfall matrix (time x frequency).
    
    Args:
        data: Raw 2D float array (n_time, n_freq)
        apply_db: Whether to convert power to decibel scale
        flatten_baseline: Whether to subtract baseline variation across frequency channels
        robust_clip: Whether to apply robust percentile normalization to [0, 1]
    
    Returns:
        Cleaned, normalized float32 array in [0, 1] range.
    """
    arr = data.astype(np.float32)
    
    if apply_db:
        arr = db_scale_norm(arr)
        
    if flatten_baseline:
        # Subtract median background across time per frequency bin to remove stationary instrumentation curve
        median_channel = np.median(arr, axis=0, keepdims=True)
        arr = arr - median_channel
        
    if robust_clip:
        arr = robust_percentile_norm(arr, p_low=1.0, p_high=99.0)
    else:
        arr = min_max_norm(arr)
        
    return arr
