"""
CosmicWatch - Breakthrough Listen Data Ingestion Pipeline.

Supports:
- Filterbank (.fil) format via blimpy.Waterfall
- HDF5 (.h5) Breakthrough Listen format via blimpy.Waterfall
- Robust h5py direct ingestion fallback
"""

import os
from typing import Optional, Dict, Any, Tuple
import numpy as np
import h5py
from ml.preprocessing.waterfall import WaterfallWindow
from ml.preprocessing.normalize import preprocess_waterfall


class BreakthroughListenLoader:
    """
    Ingests public Breakthrough Listen observations using the BLIMPY library.
    Extracts high-resolution frequency/time sub-bands into analysis windows.
    """

    def __init__(self, file_path: Optional[str] = None):
        self.file_path = file_path
        self._waterfall_obj = None
        self._is_h5py_fallback = False
        self._h5_data = None
        self._h5_attrs = {}

    def load_file(self, file_path: str):
        """Loads a .fil or .h5 file using blimpy with h5py fallback."""
        self.file_path = file_path
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Breakthrough Listen file not found: {file_path}")

        try:
            from blimpy import Waterfall
            # max_load=0.75 loads files into memory if small enough
            self._waterfall_obj = Waterfall(file_path, max_load=0.75)
            self._is_h5py_fallback = False
        except Exception as e:
            # Fallback to direct h5py loading if blimpy attributes are non-standard
            if file_path.endswith((".h5", ".hdf5")):
                with h5py.File(file_path, "r") as f:
                    if "data" in f:
                        self._h5_data = np.array(f["data"])
                    else:
                        key = list(f.keys())[0]
                        self._h5_data = np.array(f[key])
                    self._h5_attrs = {k: f.attrs[k] for k in f.attrs.keys()}
                self._is_h5py_fallback = True
            else:
                raise e

    def get_header_metadata(self) -> Dict[str, Any]:
        """Extracts observational metadata from the file header."""
        if self._waterfall_obj is None and not self._is_h5py_fallback:
            if self.file_path:
                self.load_file(self.file_path)
            else:
                raise ValueError("No file loaded.")

        if self._is_h5py_fallback:
            attrs = self._h5_attrs
            return {
                "source_name": str(attrs.get("source_name", "UNKNOWN_TARGET")),
                "telescope_id": str(attrs.get("telescope_id", "Green Bank Telescope")),
                "fch1_mhz": float(attrs.get("fch1", 1420.0)),
                "foff_mhz": float(attrs.get("foff", -2.79e-6)),
                "nchans": int(attrs.get("nchans", 512)),
                "nifs": int(attrs.get("nifs", 1)),
                "tsamp_sec": float(attrs.get("tsamp", 18.25)),
                "tstart_mjd": float(attrs.get("tstart", 59000.0)),
                "file_size_bytes": os.path.getsize(self.file_path) if self.file_path and os.path.exists(self.file_path) else 0,
            }

        hdr = self._waterfall_obj.header
        return {
            "source_name": str(hdr.get("source_name", "UNKNOWN_TARGET")),
            "telescope_id": str(hdr.get("telescope_id", "GBT")),
            "fch1_mhz": float(hdr.get("fch1", 0.0)),
            "foff_mhz": float(hdr.get("foff", 0.0)),
            "nchans": int(hdr.get("nchans", 0)),
            "nifs": int(hdr.get("nifs", 1)),
            "tsamp_sec": float(hdr.get("tsamp", 1.0)),
            "tstart_mjd": float(hdr.get("tstart", 59000.0)),
            "file_size_bytes": os.path.getsize(self.file_path) if self.file_path and os.path.exists(self.file_path) else 0,
        }

    def extract_window(
        self,
        f_start_mhz: Optional[float] = None,
        f_stop_mhz: Optional[float] = None,
        t_start_idx: int = 0,
        t_stop_idx: Optional[int] = None,
        target_shape: Optional[Tuple[int, int]] = (16, 256),
    ) -> WaterfallWindow:
        """
        Extracts a frequency and time slice from the Breakthrough Listen observation.
        """
        if self._waterfall_obj is None and not self._is_h5py_fallback:
            if self.file_path:
                self.load_file(self.file_path)
            else:
                raise ValueError("No file loaded.")

        hdr = self.get_header_metadata()

        if self._is_h5py_fallback:
            data_chunk = self._h5_data
            if data_chunk.ndim == 3:
                data_chunk = data_chunk[:, 0, :]
            freqs = np.linspace(hdr["fch1_mhz"], hdr["fch1_mhz"] + (data_chunk.shape[1] * hdr["foff_mhz"]), data_chunk.shape[1])
        else:
            data_chunk, freqs = self._waterfall_obj.grab_data(
                f_start=f_start_mhz,
                f_stop=f_stop_mhz,
                t_start=t_start_idx,
                t_stop=t_stop_idx
            )
            if data_chunk.ndim == 3:
                data_chunk = data_chunk[:, 0, :]

        if target_shape is not None:
            t_tgt, f_tgt = target_shape
            curr_t, curr_f = data_chunk.shape
            if curr_t > t_tgt:
                data_chunk = data_chunk[:t_tgt, :]
            if curr_f > f_tgt:
                mid = curr_f // 2
                half = f_tgt // 2
                data_chunk = data_chunk[:, mid - half : mid + half]
                freqs = freqs[mid - half : mid + half]

        norm_matrix = preprocess_waterfall(data_chunk)

        return WaterfallWindow(
            data=norm_matrix,
            source_file=os.path.basename(self.file_path or "sample.fil"),
            observation_id=f"BL-{hdr.get('source_name', 'SRC')[:8]}",
            target_name=hdr.get("source_name", "UNKNOWN"),
            telescope=str(hdr.get("telescope_id", "GBT")),
            freq_start_mhz=float(np.min(freqs)),
            freq_end_mhz=float(np.max(freqs)),
            time_start_mjd=hdr.get("tstart_mjd", 59000.0),
            time_end_mjd=hdr.get("tstart_mjd", 59000.0) + (norm_matrix.shape[0] * hdr.get("tsamp_sec", 1.0) / 86400.0),
            time_steps=norm_matrix.shape[0],
            freq_channels=norm_matrix.shape[1],
            is_synthetic=False,
            extra_metadata=hdr
        )
