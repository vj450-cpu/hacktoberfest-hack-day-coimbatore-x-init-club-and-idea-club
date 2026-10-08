# CosmicWatch Data Guide

This directory manages astronomical observation data and synthetic validation datasets for CosmicWatch.

> **CRITICAL SCIENTIFIC & ETHICAL DISCLAIMER**
> CosmicWatch is an anomaly detection and candidate prioritization system for radio astronomy. It is **NOT** an "alien detector". Detected signals and anomalies represent unusual spectral structures, radio frequency interference (RFI), or instrumentation artifacts warranting human telescope review. Synthetic signals generated for unit testing and model training are clearly identified and do **not** represent extraterrestrial transmissions.

---

## 1. Directory Structure

```
data/
├── README.md                # This documentation file
├── sample_bl/               # Real Breakthrough Listen sample snippets (.fil, .h5, .npy)
└── synthetic/               # Reproducibly generated synthetic spectrogram test windows
```

> **Note**: Large astronomical archive files (.fil, .h5) exceeding 50 MB should **never** be committed to Git. Small pre-sliced validation windows (~256x256 numpy arrays or preview images) are provided for offline hackathon demos.

---

## 2. Obtaining Breakthrough Listen Public Data

Breakthrough Listen makes petabytes of radio telescope data from Green Bank Telescope (GBT), Parkes Observatory, and the MeerKAT array publicly available.

### Quick Sample Download (Recommended for Hackathons)
Breakthrough Listen hosts a collection of tutorial and sample data files on their public AWS S3 bucket and open archive:

1. **Official Open Archive:**
   - Web portal: [https://breakthroughinitiatives.org/opendatasearch](https://breakthroughinitiatives.org/opendatasearch)
   - Public S3 Bucket: `s3://breakthrough-listen/`

2. **Automated Sample Downloader:**
   You can run our automated fetch script to download a small official sample slice:
   ```bash
   python scripts/download_sample_bl_data.py --target voyager1
   ```
   This downloads a slice of the famous Voyager 1 observation (`Voyager1.single_fine.filterbank` or target sample) from Green Bank Telescope.

3. **Manual S3 Access (AWS CLI):**
   ```bash
   # List available GBT public targets
   aws s3 ls s3://breakthrough-listen/ --no-sign-request
   ```

---

## 3. Synthetic Benchmark Dataset

For reproducible testing, benchmarking, and offline demonstrations, CosmicWatch includes a deterministic synthetic signal generator in `ml/data/synthetic_generator.py`.

### Supported Signal Injection Profiles:
1. `NORMAL_NOISE`: Background Gaussian thermal receiver noise + system bandpass baseline.
2. `NARROWBAND`: Drift-rate stable narrow carrier signal (< 5 Hz channel equivalent).
3. `DRIFTING_NARROWBAND`: Linear Doppler drift across frequency channels over time ($df/dt \ne 0$).
4. `INTERMITTENT`: Pulsed/periodic transmission intermittent across time integrations.
5. `BROADBAND_BURST`: Fast transient broadband pulse spanning multiple frequency bins.
6. `TERRESTRIAL_RFI`: Multi-channel stationary continuous interference signature.

To generate a local synthetic benchmark set:
```bash
python scripts/generate_demo_dataset.py --samples 50 --seed 42
```
All synthetic samples are marked with `is_synthetic: true` in metadata headers.
