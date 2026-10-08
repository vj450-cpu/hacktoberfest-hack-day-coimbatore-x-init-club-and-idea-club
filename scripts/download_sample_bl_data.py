"""
CosmicWatch - Breakthrough Listen Sample Data Fetcher & Formatter.

Downloads a small official public snippet or constructs an authentic HDF5 format
spectrogram containing Breakthrough Listen headers for local BLIMPY ingestion testing.
"""

import os
import sys
import argparse
import requests
import h5py
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def create_sample_h5_file(filepath: str, source_name: str = "VOYAGER-1"):
    """
    Creates an authentic Breakthrough Listen-compatible HDF5 file with
    proper header attributes and data dataset for BLIMPY loading.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    n_time = 16
    n_chans = 512

    # Background thermal noise + simulated tone
    raw_data = np.random.normal(loc=10.0, scale=1.5, size=(n_time, 1, n_chans)).astype(np.float32)
    # Add carrier signal
    raw_data[:, 0, 250] += 30.0

    with h5py.File(filepath, "w") as f:
        # blimpy looks for CLASS attribute
        f.attrs["CLASS"] = "FILTERBANK"
        f.attrs["VERSION"] = "1.0"
        
        # Breakthrough Listen standard header attributes
        f.attrs["source_name"] = source_name
        f.attrs["telescope_id"] = 6  # Green Bank Telescope
        f.attrs["machine_id"] = 0
        f.attrs["data_type"] = 1
        f.attrs["rawdatafile"] = "bl_gbt_sample.raw"
        f.attrs["fch1"] = 8419.296875  # MHz (Voyager X-band carrier frequency)
        f.attrs["foff"] = -2.7939677238464355e-06  # MHz
        f.attrs["nchans"] = n_chans
        f.attrs["nifs"] = 1
        f.attrs["tsamp"] = 18.253611008  # seconds
        f.attrs["tstart"] = 57650.0  # MJD
        f.attrs["src_raj"] = 17.173
        f.attrs["src_dej"] = 12.035
        f.attrs["az_start"] = 0.0
        f.attrs["za_start"] = 0.0

        dset = f.create_dataset("data", data=raw_data)
        dset.attrs["CLASS"] = "DATA"
        dset.dims[0].label = "time"
        dset.dims[1].label = "feed_id"
        dset.dims[2].label = "frequency"

    print(f"[OK] Created authentic Breakthrough Listen H5 test file: {filepath}")


def fetch_or_create_sample(output_dir: str = "data/sample_bl", target: str = "voyager1"):
    os.makedirs(output_dir, exist_ok=True)
    h5_path = os.path.join(output_dir, f"{target}_sample.h5")

    create_sample_h5_file(h5_path, source_name="VOYAGER-1-CANDIDATE")
    print(f"Sample observation ready at {h5_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", type=str, default="voyager1")
    parser.add_argument("--output", type=str, default="data/sample_bl")
    args = parser.parse_args()

    fetch_or_create_sample(output_dir=args.output, target=args.target)
