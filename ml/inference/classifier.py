"""
CosmicWatch - Signal Detection Model Inference.

Classifies spectrogram/waterfall windows into NORMAL vs SIGNAL_CANDIDATE.
Extracts latent feature representations used for downstream anomaly detection.
Lightweight architecture optimized for CPU and hackathon hardware.
"""

import os
from typing import Dict, Any, Tuple, Optional
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

from ml.preprocessing.waterfall import WaterfallWindow


class LightweightSpectrogramResNet(nn.Module):
    """
    Lightweight Residual Convolutional Network designed for radio spectrograms.
    Accepts 1-channel or 3-channel (n_time, n_freq) inputs.
    Outputs:
      1. Binary logit: NORMAL (0) vs SIGNAL_CANDIDATE (1)
      2. 64-dimensional feature embedding for downstream anomaly detector.
    """

    def __init__(self, in_channels: int = 1, embedding_dim: int = 64):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, 16, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(16)
        
        # Residual Block 1
        self.block1_conv1 = nn.Conv2d(16, 32, kernel_size=3, stride=2, padding=1)
        self.block1_bn1 = nn.BatchNorm2d(32)
        self.block1_conv2 = nn.Conv2d(32, 32, kernel_size=3, padding=1)
        self.block1_bn2 = nn.BatchNorm2d(32)
        self.shortcut1 = nn.Conv2d(16, 32, kernel_size=1, stride=2)

        # Residual Block 2
        self.block2_conv1 = nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1)
        self.block2_bn1 = nn.BatchNorm2d(64)
        self.block2_conv2 = nn.Conv2d(64, 64, kernel_size=3, padding=1)
        self.block2_bn2 = nn.BatchNorm2d(64)
        self.shortcut2 = nn.Conv2d(32, 64, kernel_size=1, stride=2)

        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc_embed = nn.Linear(64, embedding_dim)
        self.fc_classifier = nn.Linear(embedding_dim, 2)

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass up to feature embedding vector."""
        out = F.relu(self.bn1(self.conv1(x)))

        # Block 1
        res = self.shortcut1(out)
        out = F.relu(self.block1_bn1(self.block1_conv1(out)))
        out = self.block1_bn2(self.block1_conv2(out))
        out = F.relu(out + res)

        # Block 2
        res = self.shortcut2(out)
        out = F.relu(self.block2_bn1(self.block2_conv1(out)))
        out = self.block2_bn2(self.block2_conv2(out))
        out = F.relu(out + res)

        # Pool & Embed
        pooled = self.global_pool(out)
        flat = torch.flatten(pooled, 1)
        embed = F.relu(self.fc_embed(flat))
        return embed

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        embed = self.extract_features(x)
        logits = self.fc_classifier(embed)
        return logits, embed


class SignalDetector:
    """
    High-level inference engine for candidate signal classification.
    """

    def __init__(self, model_weights_path: Optional[str] = None, device: str = "cpu"):
        self.device = torch.device(device)
        self.model = LightweightSpectrogramResNet().to(self.device)
        self.is_trained = False

        if model_weights_path and os.path.exists(model_weights_path):
            try:
                state_dict = torch.load(model_weights_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.is_trained = True
            except Exception as e:
                print(f"Warning: Failed to load weights from {model_weights_path}: {e}")

        self.model.eval()

    def predict(self, window: WaterfallWindow) -> Dict[str, Any]:
        """
        Runs signal detection inference on a WaterfallWindow.
        Returns:
            signal_confidence: float in [0.0, 1.0]
            classification: "SIGNAL_CANDIDATE" or "NORMAL"
            embedding: 1D np.ndarray (length 64)
            features: Dict of measurable radio metrics
        """
        # Prepare 1x1xTxF tensor
        mat = window.data.astype(np.float32)
        tensor = torch.from_numpy(mat).unsqueeze(0).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits, embed = self.model(tensor)
            probs = F.softmax(logits, dim=1).cpu().numpy()[0]
            embedding = embed.cpu().numpy()[0]

        signal_confidence = float(probs[1])

        # If model hasn't been trained yet or is baseline initialization, calibrate with deterministic spectral measures
        if not self.is_trained:
            # Deterministic signal prominence measurement:
            # Peak to median ratio across channels + channel variance
            chan_max = np.max(mat, axis=0)
            chan_median = np.median(mat)
            prominence = float(np.max(chan_max) - chan_median)
            # Peak sharpness
            time_variance = float(np.var(np.sum(mat, axis=1)))
            heuristic_conf = float(np.clip((prominence * 1.8) + (np.std(mat) * 2.0), 0.05, 0.98))
            signal_confidence = round(float(0.4 * signal_confidence + 0.6 * heuristic_conf), 4)

        classification = "SIGNAL_CANDIDATE" if signal_confidence >= 0.50 else "NORMAL"

        return {
            "signal_confidence": float(round(signal_confidence, 4)),
            "classification": classification,
            "raw_probabilities": {"NORMAL": float(round(probs[0], 4)), "SIGNAL_CANDIDATE": float(round(probs[1], 4))},
            "embedding": embedding,
            "is_model_trained": self.is_trained
        }
