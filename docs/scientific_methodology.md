# CosmicWatch Scientific Methodology & Disclaimer

## 1. Scientific Mission Statement
Radio observatories (e.g., Green Bank Telescope, Parkes, MeerKAT) ingest terabytes of observational data per hour. In technosignature search (SETI) and transient radio astronomy, human astronomers cannot manually inspect every spectrogram. 

**CosmicWatch serves as an automated triage and candidate-prioritization assistant.**
It surfaces anomalous spectral features and ranks them based on physical and observational criteria so astronomers can deploy follow-up observing time effectively.

---

## 2. Strict Scientific Disclaimer & Guardrails

> **WHAT COSMICWATCH DOES:**
> Identifies non-Gaussian spectral events, coherent carriers, Doppler-drifting frequencies, and anomalies relative to nominal receiver noise.

> **WHAT COSMICWATCH DOES NOT DO:**
> - CosmicWatch is **NOT** an "alien detector".
> - The system **never** claims to detect extraterrestrial life or alien civilizations.
> - The system **never** fabricates celestial coordinates, SNR values, or scientific discoveries.

Every candidate analysis strictly distinguishes between:
1. **OBSERVED DATA**: Physical frequency, time stamps, telescope source files.
2. **MODEL OUTPUT**: Classifier confidence, anomaly score, spectral entropy.
3. **INFERENCE**: Likelihood of terrestrial RFI vs astrophysical/technosignature candidate.
4. **RECOMMENDATION**: Priority level for human follow-up observation on radio telescopes.

---

## 3. The ON/OFF Spatial Verification Technique
A cornerstone of radio SETI is target cadencing (e.g. ABACAD pointings):
- **ON-source (Target A)**: Point the primary antenna feed directly at the stellar target (e.g., Ross 128 or Proxima Centauri).
- **OFF-source (Target B)**: Point the antenna slightly away into nearby blank sky or a reference calibrator.

### Interpretation Matrix:
| Target (ON) | Calibrator (OFF) | Interpretation | Priority |
|---|---|---|---|
| Signal Detected | Signal Absent | Candidate localized to target coordinate frame | **HIGH PRIORITY FOR REVIEW** |
| Signal Detected | Signal Detected | Local terrestrial RFI (cell towers, GPS, satellites) | **POSSIBLE RFI (Low Priority)** |
| Signal Absent | Signal Absent | Nominal thermal receiver noise | **LIKELY NORMAL** |

---

## 4. Signal Morphologies Evaluated
- **Drifting Narrowband**: Narrow spectral carrier exhibiting linear Doppler drift ($df/dt \ne 0$) resulting from relative orbital and rotational acceleration between the emitter and Earth.
- **Stationary Narrowband**: Un-drifting carrier. Often RFI unless originating in a topocentric or geostationary frame.
- **Intermittent**: Pulsed transmission with a duty cycle across integrations.
- **Broadband Burst**: Fast dispersion or wide-channel burst similar to Fast Radio Bursts (FRBs) or high-voltage sparks.
- **Thermal Receiver Noise**: Nominal Gaussian background with receiver bandpass baseline ripple.
