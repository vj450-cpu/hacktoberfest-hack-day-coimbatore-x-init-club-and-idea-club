"""
CosmicWatch - Signal Classifier Training Pipeline.

Trains the LightweightSpectrogramResNet model to distinguish between
nominal receiver background noise (NORMAL) and candidate astronomical radio signals (SIGNAL_CANDIDATE).

Also fits and saves the Isolation Forest anomaly detector on nominal background embeddings.
"""

import os
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

from ml.inference.classifier import LightweightSpectrogramResNet
from ml.anomaly_detection.anomaly_detector import (
    IsolationForestAnomalyDetector,
    AstronomicalFeatureExtractor,
)
from ml.data.synthetic_generator import SyntheticSignalGenerator


class SpectrogramDataset(Dataset):
    """PyTorch dataset for spectrogram windows."""

    def __init__(self, samples):
        self.samples = samples

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        data, label = self.samples[idx]
        tensor = torch.from_numpy(data).float().unsqueeze(0)  # Shape: (1, T, F)
        return tensor, torch.tensor(label, dtype=torch.long)


def generate_training_data(n_samples: int = 400, seed: int = 42):
    """
    Generates balanced training data:
    - 50% NORMAL_NOISE (label 0)
    - 50% SIGNAL_CANDIDATE (label 1: drifting narrowband, narrowband, intermittent, broadband)
    """
    gen = SyntheticSignalGenerator(seed=seed)
    samples = []
    
    n_normal = n_samples // 2
    n_signal = n_samples - n_normal

    print(f"Generating {n_normal} background samples (Class 0: NORMAL)...")
    for i in range(n_normal):
        w = gen.generate_sample(signal_type="NORMAL_NOISE", seed=seed + i)
        samples.append((w.data, 0))

    signal_types = ["DRIFTING_NARROWBAND", "NARROWBAND", "INTERMITTENT", "BROADBAND_BURST"]
    print(f"Generating {n_signal} signal samples (Class 1: SIGNAL_CANDIDATE)...")
    for i in range(n_signal):
        stype = signal_types[i % len(signal_types)]
        snr = random.uniform(8.0, 22.0)
        w = gen.generate_sample(signal_type=stype, snr_db=snr, seed=seed + 1000 + i)
        samples.append((w.data, 1))

    random.seed(seed)
    random.shuffle(samples)
    return samples


def train_model(
    epochs: int = 8,
    batch_size: int = 32,
    lr: float = 0.001,
    output_dir: str = "ml/models_saved",
    seed: int = 42
):
    """Executes the training routine and saves checkpoints."""
    torch.manual_seed(seed)
    np.random.seed(seed)
    os.makedirs(output_dir, exist_ok=True)

    print("=== Phase 3: CosmicWatch Classifier Training ===")
    dataset_samples = generate_training_data(n_samples=400, seed=seed)
    
    # 80/20 train/val split
    split_idx = int(0.8 * len(dataset_samples))
    train_data = dataset_samples[:split_idx]
    val_data = dataset_samples[split_idx:]

    train_loader = DataLoader(SpectrogramDataset(train_data), batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(SpectrogramDataset(val_data), batch_size=batch_size, shuffle=False)

    device = torch.device("cpu")
    model = LightweightSpectrogramResNet(in_channels=1, embedding_dim=64).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        correct = 0
        total = 0

        for inputs, targets in train_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            optimizer.zero_grad()
            logits, _ = model(inputs)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * inputs.size(0)
            preds = torch.argmax(logits, dim=1)
            correct += (preds == targets).sum().item()
            total += targets.size(0)

        train_acc = correct / total
        train_loss = total_loss / total

        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for inputs, targets in val_loader:
                inputs, targets = inputs.to(device), targets.to(device)
                logits, _ = model(inputs)
                preds = torch.argmax(logits, dim=1)
                val_correct += (preds == targets).sum().item()
                val_total += targets.size(0)

        val_acc = val_correct / val_total
        print(f"Epoch {epoch:2d}/{epochs:2d} | Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.1f}% | Val Acc: {val_acc*100:.1f}%")

    # Save model weights
    model_path = os.path.join(output_dir, "signal_classifier.pt")
    torch.save(model.state_dict(), model_path)
    print(f"[OK] Model weights saved to: {model_path}")

    # Fit Isolation Forest on NORMAL embeddings for Anomaly Detection
    print("\n=== Phase 4: Fitting Isolation Forest Anomaly Detector on Normal Background ===")
    model.eval()
    normal_embeddings = []
    gen = SyntheticSignalGenerator(seed=999)
    for i in range(100):
        w = gen.generate_sample(signal_type="NORMAL_NOISE", seed=999 + i)
        t = torch.from_numpy(w.data).float().unsqueeze(0).unsqueeze(0)
        with torch.no_grad():
            emb = model.extract_features(t).numpy()[0]
        full_vec = AstronomicalFeatureExtractor.to_feature_vector(w, emb)
        normal_embeddings.append(full_vec)

    iso_detector = IsolationForestAnomalyDetector(contamination=0.05, random_state=42)
    iso_detector.fit(np.array(normal_embeddings))
    anom_path = os.path.join(output_dir, "anomaly_detector.joblib")
    iso_detector.save(anom_path)
    print(f"[OK] Anomaly detector saved to: {anom_path}")


if __name__ == "__main__":
    train_model(epochs=6)
