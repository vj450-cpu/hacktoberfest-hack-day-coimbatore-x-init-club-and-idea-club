# CosmicWatch System Architecture

```
                                  +---------------------------------------+
                                  | Breakthrough Listen Data / Raw Audio  |
                                  |    (.fil / .h5 / Synthetic Injector)   |
                                  +---------------------------------------+
                                                     |
                                                     v
                                  +---------------------------------------+
                                  |    Time-Frequency Preprocessing       |
                                  |   - Robust Percentile Clipping [0,1]  |
                                  |   - Channel Baseline Median Flatten   |
                                  |   - Dynamic Decibel (dB) Scaling      |
                                  +---------------------------------------+
                                                     |
                                                     v
                                  +---------------------------------------+
                                  |  Dual-Path Machine Learning Pipeline   |
                                  +---------------------------------------+
                                     /                                 \
                                    /                                   \
                                   v                                     v
       +------------------------------------+   +------------------------------------+
       |  Path A: Signal Detection Model    |   |  Path B: Anomaly Detection Engine  |
       |  LightweightSpectrogramResNet (CNN)|   |  Isolation Forest + Astro Features |
       |  Outputs:                          |   |  - Spectral Kurtosis & Entropy     |
       |  - Class: NORMAL vs CANDIDATE      |   |  - PAPR & Persistence Ratio        |
       |  - Signal Confidence (0.00-1.00)   |   |  Outputs:                          |
       |  - 64-Dim Latent Embeddings        |   |  - Anomaly Score (0.00-1.00)       |
       +------------------------------------+   +------------------------------------+
                                    \                                   /
                                     \                                 /
                                      v                               v
                                  +---------------------------------------+
                                  |      Spatial Verification Layer       |
                                  |   ON / OFF Source Cross-Pointing      |
                                  |   - Appears in ON, Absent in OFF:     |
                                  |     Candidate Warrants Human Review   |
                                  |   - Appears in Both ON & OFF:         |
                                  |     Identified as Terrestrial RFI     |
                                  +---------------------------------------+
                                                     |
                                                     v
                                  +---------------------------------------+
                                  |    CosmicWatch Candidate Engine       |
                                  |  Configurable Weighted Scoring (0-100)|
                                  |  Weights in ml/config/scoring.yaml    |
                                  +---------------------------------------+
                                                     |
                                                     v
                                  +---------------------------------------+
                                  | Open-Weight LLM Explainer (Gemma/Qwen)|
                                  | Strict Scientific Guardrails:         |
                                  | - Explains physical spectral traits   |
                                  | - Never claims "Alien" discovery      |
                                  | - Frames follow-up telescope review   |
                                  +---------------------------------------+
                                                     |
                                                     v
                                  +---------------------------------------+
                                  | FastAPI Backend + Mission Control UI  |
                                  | React + Tailwind Observatory Dash     |
                                  +---------------------------------------+
```

---

## Component Breakdown

### 1. Data Ingestion & Preprocessing
- **BLIMPY Integration**: Directly parses Breakthrough Listen `.fil` and `.h5` files, extracting specific frequency sub-bands and time integrations.
- **Robust Normalization**: Astronomical radio signals frequently feature large dynamic range swings and interference spikes. We apply median baseline subtraction across channels followed by robust percentile normalization ($p_{low}=1\%$, $p_{high}=99\%$) to retain visibility of faint carriers.

### 2. Signal Detection Model
- **Lightweight Spectrogram ResNet**: A residual convolutional neural network with 2 residual stages, batch normalization, and adaptive average pooling.
- Runs in $<5$ ms per slice on standard CPU hardware.
- Outputs both classification probability and a 64-dimensional feature vector.

### 3. Anomaly Detection Layer
- **Multi-modal Feature Vector**: Merges CNN latent embeddings with domain-specific astronomical statistics (Spectral Kurtosis, Spectral Entropy, Peak-to-Average Power Ratio, Channel Persistence).
- **Isolation Forest**: Fits on a baseline reference population of nominal receiver thermal noise. Computes a bounded anomaly score ($0.0 \le S_{anom} \le 1.0$) indicating deviation from nominal space.

### 4. Candidate Prioritization Engine
- Computes a unified 0–100 priority score using documented weights:
  - Signal Confidence: 25%
  - Anomaly Score: 25%
  - Persistence: 15%
  - Narrowband Likelihood: 15%
  - ON/OFF Consistency: 20%
- Applies RFI penalty factor ($0.40 \times \text{RFI Likelihood}$).

### 5. Open-Weight LLM Explanation Layer
- Consumes structured numerical telemetry rather than raw image bytes to eliminate visual hallucinations.
- Supports Gemma-2 and Qwen-2.5 via local Ollama or Hugging Face API, with zero-latency deterministic local fallback for offline hackathon demos.
