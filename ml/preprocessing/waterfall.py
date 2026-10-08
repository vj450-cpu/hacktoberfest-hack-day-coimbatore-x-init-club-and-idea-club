"""
CosmicWatch - Waterfall Spectrogram Processing Module.

Handles time/frequency window slicing, metadata tracking, and visual encoding
for astronomical radio observations (Breakthrough Listen style).
"""

from dataclasses import dataclass, field, asdict
from typing import Dict, Any, Optional, Tuple, List
import numpy as np
from PIL import Image

from ml.preprocessing.normalize import preprocess_waterfall, robust_percentile_norm


@dataclass
class WaterfallWindow:
    """Represents a sliced time-frequency observation window."""
    data: np.ndarray  # Shape: (n_time, n_freq), float32 normalized [0, 1]
    source_file: str
    observation_id: str
    target_name: str
    telescope: str
    freq_start_mhz: float
    freq_end_mhz: float
    time_start_mjd: float
    time_end_mjd: float
    time_steps: int
    freq_channels: int
    is_synthetic: bool = False
    injected_type: Optional[str] = None
    snr_db: Optional[float] = None
    extra_metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert metadata to dictionary (excluding raw large data matrix)."""
        d = asdict(self)
        d.pop("data", None)
        return d

    def to_json_heatmap(self, max_time: int = 64, max_freq: int = 256) -> Dict[str, Any]:
        """
        Downsample data matrix if necessary to send to frontend Plotly/Canvas heatmap.
        """
        matrix = self.data
        t_len, f_len = matrix.shape

        if t_len > max_time or f_len > max_freq:
            t_step = max(1, t_len // max_time)
            f_step = max(1, f_len // max_freq)
            sampled = matrix[::t_step, ::f_step]
        else:
            sampled = matrix

        # Generate freq and time tick arrays
        freqs = np.linspace(self.freq_start_mhz, self.freq_end_mhz, sampled.shape[1]).tolist()
        times = np.linspace(0, (self.time_end_mjd - self.time_start_mjd) * 86400.0, sampled.shape[0]).tolist()

        return {
            "z": sampled.tolist(),
            "x_freq_mhz": [round(f, 6) for f in freqs],
            "y_time_sec": [round(t, 2) for t in times],
            "metadata": self.to_dict()
        }

    def to_rgb_image(self, colormap: str = "viridis") -> Image.Image:
        """
        Encodes the 2D waterfall matrix into an RGB PIL Image for CNN backbones.
        """
        try:
            import matplotlib.cm as cm
            cmap = cm.get_cmap(colormap)
            colored = cmap(self.data)  # returns RGBA in [0, 1]
            rgb = (colored[:, :, :3] * 255.0).astype(np.uint8)
            return Image.fromarray(rgb)
        except Exception:
            # Fallback grayscale to 3-channel RGB without matplotlib
            u8 = (np.clip(self.data, 0.0, 1.0) * 255.0).astype(np.uint8)
            stacked = np.stack([u8, u8, u8], axis=-1)
            return Image.fromarray(stacked)


def slice_waterfall(
    full_data: np.ndarray,
    freq_start_idx: int,
    freq_width: int,
    time_start_idx: int = 0,
    time_width: Optional[int] = None,
    freq_start_mhz: float = 1420.0,
    freq_resolution_hz: float = 2.79,
    time_resolution_sec: float = 18.25,
    source_file: str = "unknown",
    observation_id: str = "CW-OBS-001",
    target_name: str = "TARGET",
    telescope: str = "GBT",
    is_synthetic: bool = False,
    injected_type: Optional[str] = None
) -> WaterfallWindow:
    """
    Slices a sub-window of size (time_width, freq_width) out of a full observation array.
    """
    total_time, total_freq = full_data.shape
    if time_width is None:
        time_width = total_time
        
    t_end = min(total_time, time_start_idx + time_width)
    f_end = min(total_freq, freq_start_idx + freq_width)
    
    sub_slice = full_data[time_start_idx:t_end, freq_start_idx:f_end]
    normalized_data = preprocess_waterfall(sub_slice)
    
    f_res_mhz = freq_resolution_hz / 1e6
    f0 = freq_start_mhz + (freq_start_idx * f_res_mhz)
    f1 = f0 + (sub_slice.shape[1] * f_res_mhz)
    
    t0_mjd = 59000.0 + (time_start_idx * time_resolution_sec / 86400.0)
    t1_mjd = t0_mjd + (sub_slice.shape[0] * time_resolution_sec / 86400.0)
    
    return WaterfallWindow(
        data=normalized_data,
        source_file=source_file,
        observation_id=observation_id,
        target_name=target_name,
        telescope=telescope,
        freq_start_mhz=f0,
        freq_end_mhz=f1,
        time_start_mjd=t0_mjd,
        time_end_mjd=t1_mjd,
        time_steps=sub_slice.shape[0],
        freq_channels=sub_slice.shape[1],
        is_synthetic=is_synthetic,
        injected_type=injected_type
    )
