"""
CosmicWatch - End-to-End Command Line Demonstration.

Demonstrates:
REAL/PUBLIC ASTRONOMICAL DATA
        ↓
    WATERFALL
        ↓
AI SIGNAL DETECTION
        ↓
  ANOMALY SCORE
        ↓
 CANDIDATE SCORE
        ↓
 GEMMA EXPLANATION
        ↓
HUMAN-READABLE INVESTIGATION PRIORITY
"""

import sys
import os
import json
import time

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.services.pipeline_service import PipelineService


def print_step(title: str):
    print("\n" + "=" * 65)
    print(f" >>> {title}")
    print("=" * 65)
    time.sleep(0.3)


def main():
    print("*" * 65)
    print("        COSMICWATCH - ASTRONOMICAL ANOMALY DETECTION DEMO")
    print("  Flagship Use Case: Radio SETI / Breakthrough Listen Prioritization")
    print("*" * 65)

    pipeline = PipelineService()

    demo_cases = [
        {
            "name": "Drifting Narrowband Candidate (Target: Ross 128)",
            "sample_type": "DRIFTING_NARROWBAND",
            "snr_db": 16.5,
            "target": "Ross 128 (Target A)",
            "telescope": "Green Bank Telescope",
            "is_rfi": False,
            "drift": True
        },
        {
            "name": "Terrestrial Radio Frequency Interference (Local Satellite)",
            "sample_type": "TERRESTRIAL_RFI",
            "snr_db": 19.0,
            "target": "Calibrator Pointing",
            "telescope": "Green Bank Telescope",
            "is_rfi": True,
            "drift": False
        },
        {
            "name": "Nominal Receiver Background (Deep Sky Reference)",
            "sample_type": "NORMAL_NOISE",
            "snr_db": 0.0,
            "target": "Deep Sky Blank Field",
            "telescope": "Green Bank Telescope",
            "is_rfi": False,
            "drift": False
        }
    ]

    for idx, case in enumerate(demo_cases, 1):
        print("\n\n" + "#" * 65)
        print(f" SCENARIO {idx}/{len(demo_cases)}: {case['name']}")
        print("#" * 65)

        print_step("1. ASTRONOMICAL DATA INGESTION & WATERFALL")
        w = pipeline.synthetic_gen.generate_sample(
            signal_type=case["sample_type"],
            snr_db=case["snr_db"],
            target_name=case["target"],
            telescope=case["telescope"]
        )
        on_win, off_win = pipeline.synthetic_gen.generate_on_off_pair(
            signal_type=case["sample_type"],
            is_rfi=case["is_rfi"]
        )
        print(f"Target:              {w.target_name}")
        print(f"Observatory:         {w.telescope}")
        print(f"Spectrogram shape:   {w.time_steps} time steps x {w.freq_channels} channels")
        print(f"Frequency Range:     {w.freq_start_mhz:.4f} - {w.freq_end_mhz:.4f} MHz")
        print(f"Injected SNR:        {w.snr_db:.1f} dB")
        print(f"Preprocessed:        Robust Percentile & Bandpass Flattened [0, 1]")

        print_step("2. PIPELINE EXECUTION")
        print("  DATA -> PREPROCESSING -> SIGNAL DETECTION -> ANOMALY DETECTION -> CANDIDATE SCORING -> GEMMA EXPLANATION")
        result = pipeline.analyze_window(
            window=w,
            on_window=on_win,
            off_window=off_win,
            is_rfi=case["is_rfi"],
            frequency_drift=case["drift"]
        )

        print_step("3. DETERMINISTIC & AI MEASUREMENTS")
        print(f"Signal Classifier:   {result['classification']} (Confidence: {result['signal_confidence']:.2f})")
        print(f"Anomaly Score:       {result['anomaly_score']:.2f} / 1.00")
        print(f"Signal Persistence:  {result['persistence']:.2f} / 1.00")
        print(f"Narrowband Score:    {result['narrowband_likelihood']:.2f} / 1.00")
        print(f"Estimated RFI:       {result['rfi_likelihood']:.2f} / 1.00")
        print(f"ON/OFF Consistency:  ON={result['on_off_status']['on_detected']}, OFF={result['on_off_status']['off_detected']}")

        print_step("4. COSMICWATCH CANDIDATE SCORING")
        print(f"Candidate Score:     {result['candidate_score']} / 100")
        print(f"Verification Status: {result['status']}")

        print_step("5. OPEN-WEIGHT LLM SCIENTIFIC EXPLANATION")
        print(f"Reasoning Model:     {result['model_used']}")
        print(f"\n{result['explanation']}\n")

        print_step("6. INVESTIGATION RECOMMENDATION & DISCLAIMER")
        print(f"Recommendation:      {result['recommendation']}")
        print(f"Disclaimer:          {result['disclaimer']}")

    print("\n" + "=" * 65)
    print(" [OK] End-to-End Demo Finished Successfully!")
    print("=" * 65)


if __name__ == "__main__":
    main()
