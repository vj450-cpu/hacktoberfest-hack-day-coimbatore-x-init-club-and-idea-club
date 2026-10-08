"""
CosmicWatch - Generate Local Demo Dataset.
Creates small .npy spectrogram windows and JSON metadata for offline testing.
"""

import os
import sys
import argparse
import json
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.data.synthetic_generator import SyntheticSignalGenerator


def generate_dataset(output_dir: str = "data/synthetic", n_samples: int = 20, seed: int = 42):
    os.makedirs(output_dir, exist_ok=True)
    gen = SyntheticSignalGenerator(seed=seed)
    types = SyntheticSignalGenerator.SIGNAL_TYPES

    manifest = []
    print(f"Generating {n_samples} benchmark spectrogram files in {output_dir}...")

    for i in range(n_samples):
        stype = types[i % len(types)]
        snr = 0.0 if stype == "NORMAL_NOISE" else round(float(np.random.uniform(9.0, 22.0)), 1)
        cid = f"CW-DEMO-{i+1:03d}"
        
        window = gen.generate_sample(
            signal_type=stype,
            snr_db=snr,
            observation_id=cid,
            target_name=f"BENCHMARK-{stype[:6]}",
            seed=seed + i
        )

        npy_path = os.path.join(output_dir, f"{cid}.npy")
        np.save(npy_path, window.data)

        meta = window.to_dict()
        meta["file"] = f"{cid}.npy"
        manifest.append(meta)

    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"[OK] Generated {n_samples} files. Manifest saved to {manifest_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--samples", type=int, default=20)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", type=str, default="data/synthetic")
    args = parser.parse_args()

    generate_dataset(output_dir=args.output, n_samples=args.samples, seed=args.seed)
