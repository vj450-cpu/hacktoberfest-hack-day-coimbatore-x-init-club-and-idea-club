# CosmicWatch Scientific Methodology & Disclaimer

## 1. Scientific Mission Statement
Radio observatories (e.g., Green Bank Telescope, Parkes, MeerKAT) ingest terabytes of observational data per hour. In technosignature search (SETI) and transient radio astronomy, human astronomers cannot manually inspect every spectrogram. 

**CosmicWatch serves as an automated triage and candidate-prioritization assistant.**
It surfaces anomalous spectral features and ranks them based on physical and observational criteria so astronomers can deploy follow-up observing time effectively.

---

## 2. Strict Scientific Disclaimer & Guardrails

> **WHAT COSMICWATCH DOES:**
> Identifies non-Gaussian spectral events, coherent carriers, Doppler-drifting frequencies, and statistical anomalies relative to nominal receiver noise.

> **WHAT COSMICWATCH DOES NOT DO:**
> - CosmicWatch is **NOT** an "alien detector".
> - The system **never** claims to detect extraterrestrial life or alien civilizations.
> - The system **never** fabricates celestial coordinates, SNR values, or scientific discoveries.

Every candidate analysis strictly distinguishes between:
1. **OBSERVED DATA**: Physical frequency, time stamps, telescope source files.
2. **SYNTHETIC DATA**: Controlled artificial signals injected for unit testing and model benchmarking (clearly marked with `is_synthetic: true`).
3. **MODEL PREDICTIONS**: Statistical outputs from neural classifiers and Isolation Forest estimators.
4. **HEURISTIC SCORING**: Prototype prioritization weights and penalty factors configured by observatory operators.
5. **SCIENTIFIC CONCLUSIONS**: Only telescope follow-up by human astronomers can establish the true physical origin of a candidate.

---

## 3. The ON/OFF Spatial Verification Technique
A cornerstone of radio SETI is target cadencing (e.g. ABACAD pointings):
- **ON-source (Target A)**: Point the primary antenna feed directly at the stellar target (e.g., Ross 128 or Proxima Centauri).
- **OFF-source (Target B)**: Point the antenna slightly away into nearby blank sky or a reference calibrator.

### Interpretation Matrix:
| Target (ON) | Calibrator (OFF) | Interpretation | Priority |
|---|---|---|---|
| Signal Present | Signal Absent | Consistent with directional sky localization; requires follow-up observation to rule out transient RFI. Does NOT prove extraterrestrial origin. | **HIGH PRIORITY FOR REVIEW** |
| Signal Present | Signal Present | Non-directional; consistent with local terrestrial RFI (cell towers, GPS, satellites entering antenna sidelobes). | **POSSIBLE RFI (Low Priority)** |
| Signal Absent | Signal Absent | Nominal thermal receiver noise baseline. | **LIKELY NORMAL** |

---

## 4. Signal Morphologies Evaluated
- **Drifting Narrowband**: Narrow spectral carrier exhibiting linear Doppler drift ($df/dt \ne 0$) resulting from relative orbital and rotational acceleration between the emitter and Earth.
- **Stationary Narrowband**: Un-drifting carrier. Often RFI unless originating in a topocentric or geostationary frame.
- **Intermittent**: Pulsed transmission with a duty cycle across integrations.
- **Broadband Burst**: Fast dispersion or wide-channel burst similar to Fast Radio Bursts (FRBs) or high-voltage sparks.
- **Thermal Receiver Noise**: Nominal Gaussian background with receiver bandpass baseline ripple.

---

## 5. Prototype Heuristics & Configurable Penalties
- **RFI Penalty Factor (40%)**: The candidate engine applies a configurable $40\%$ penalty ($0.40 \times \text{RFI Likelihood}$) to candidate priority scores. This is a **prototype triage heuristic** to suppress known multi-beam interference in demonstration pipelines, not a physically derived or universal astronomical constant. Different observing frequencies (L-band, S-band, C-band) require customized empirical calibration based on local observatory RFI environments.
- **Weights Configuration**: Weights for signal confidence (25%), anomaly score (25%), persistence (15%), narrowband likelihood (15%), and ON/OFF consistency (20%) are fully externalized in `ml/config/scoring_weights.yaml` for transparent customization.
