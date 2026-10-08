"""
CosmicWatch - Model Evaluation & Benchmarking Module.

Evaluates the trained signal detection model and anomaly detector on an independent test dataset.
Computes real, un-fabricated metrics:
- Accuracy
- Precision
- Recall
- F1-Score
- Confusion Matrix
- Anomaly separation statistics

Saves JSON metrics and publication-ready plots to ml/evaluation/results/.
"""

import os
import json
import numpy as np
import torch
import matplotlib
matplotlib.use("Agg")  # Headless backend for server/script rendering
import matplotlib.pyplot as plt

from ml.inference.classifier import SignalDetector
from ml.anomaly_detection.anomaly_detector import AnomalyDetector, AstronomicalFeatureExtractor
from ml.data.synthetic_generator import SyntheticSignalGenerator


def run_evaluation(
    model_weights_path: str = "ml/models_saved/signal_classifier.pt",
    anomaly_detector_path: str = "ml/models_saved/anomaly_detector.joblib",
    results_dir: str = "ml/evaluation/results",
    n_test_samples: int = 200,
    seed: int = 7777
):
    """
    Executes real empirical evaluation on held-out test data.
    Ensures 100% deterministic reproducibility using explicit seed.
    """
    os.makedirs(results_dir, exist_ok=True)
    rng = np.random.default_rng(seed)
    gen = SyntheticSignalGenerator(seed=seed)

    print("=== CosmicWatch Scientific Evaluation ===")
    print(f"Generating {n_test_samples} held-out test observations (Seed: {seed})...")

    # Half normal, half signals
    n_half = n_test_samples // 2
    test_data = []

    # Ground truth: 0 = NORMAL, 1 = SIGNAL_CANDIDATE
    for i in range(n_half):
        w = gen.generate_sample(signal_type="NORMAL_NOISE", seed=seed + i)
        test_data.append((w, 0, "NORMAL_NOISE"))

    signal_types = ["DRIFTING_NARROWBAND", "NARROWBAND", "INTERMITTENT", "BROADBAND_BURST"]
    for i in range(n_half):
        stype = signal_types[i % len(signal_types)]
        snr = float(rng.uniform(9.0, 22.0))
        w = gen.generate_sample(signal_type=stype, snr_db=snr, seed=seed + 5000 + i)
        test_data.append((w, 1, stype))

    # Initialize detectors
    signal_detector = SignalDetector(model_weights_path=model_weights_path)
    anomaly_detector = AnomalyDetector(model_path=anomaly_detector_path)

    y_true = []
    y_pred = []
    y_scores = []
    anomaly_scores_normal = []
    anomaly_scores_signal = []

    for window, true_label, stype in test_data:
        pred_res = signal_detector.predict(window)
        conf = pred_res["signal_confidence"]
        pred_label = 1 if conf >= 0.50 else 0

        # Anomaly scoring
        anom_res = anomaly_detector.score(window, latent_embedding=pred_res["embedding"])
        anom_val = anom_res["anomaly_score"]

        y_true.append(true_label)
        y_pred.append(pred_label)
        y_scores.append(conf)

        if true_label == 0:
            anomaly_scores_normal.append(anom_val)
        else:
            anomaly_scores_signal.append(anom_val)

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Compute actual confusion matrix metrics
    tp = int(np.sum((y_true == 1) & (y_pred == 1)))
    fp = int(np.sum((y_true == 0) & (y_pred == 1)))
    tn = int(np.sum((y_true == 0) & (y_pred == 0)))
    fn = int(np.sum((y_true == 1) & (y_pred == 0)))

    accuracy = float((tp + tn) / len(y_true))
    precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    f1_score = float(2 * (precision * recall) / (precision + recall)) if (precision + recall) > 0 else 0.0

    mean_anom_norm = float(np.mean(anomaly_scores_normal))
    mean_anom_sig = float(np.mean(anomaly_scores_signal))

    results = {
        "evaluation_dataset_size": len(y_true),
        "random_seed": seed,
        "is_model_trained": signal_detector.is_trained,
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1_score, 4),
        "confusion_matrix": {
            "true_positive": tp,
            "false_positive": fp,
            "true_negative": tn,
            "false_negative": fn
        },
        "anomaly_detection": {
            "mean_score_normal": round(mean_anom_norm, 4),
            "mean_score_signal": round(mean_anom_sig, 4),
            "separation_margin": round(mean_anom_sig - mean_anom_norm, 4)
        }
    }

    # Save JSON metrics
    json_path = os.path.join(results_dir, "evaluation_metrics.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"[OK] Evaluation metrics saved to: {json_path}")

    # Generate plots
    # 1. Confusion Matrix Plot
    fig, ax = plt.subplots(figsize=(5, 4), dpi=150)
    cm_matrix = np.array([[tn, fp], [fn, tp]])
    im = ax.imshow(cm_matrix, cmap="Blues", interpolation="nearest")
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(["Pred: NORMAL", "Pred: CANDIDATE"])
    ax.set_yticklabels(["True: NORMAL", "True: CANDIDATE"])
    for i in range(2):
        for j in range(2):
            val = cm_matrix[i, j]
            color = "white" if val > cm_matrix.max() / 2 else "black"
            ax.text(j, i, str(val), ha="center", va="center", color=color, fontweight="bold", fontsize=14)
    ax.set_title(f"CosmicWatch Confusion Matrix (N={len(y_true)})")
    plt.tight_layout()
    cm_plot_path = os.path.join(results_dir, "confusion_matrix.png")
    fig.savefig(cm_plot_path)
    plt.close(fig)

    # 2. Performance Metrics Bar Chart
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    names = ["Accuracy", "Precision", "Recall", "F1 Score"]
    values = [accuracy, precision, recall, f1_score]
    colors = ["#38bdf8", "#818cf8", "#34d399", "#f472b6"]
    bars = ax.bar(names, values, color=colors, width=0.55)
    ax.set_ylim(0.0, 1.05)
    ax.set_ylabel("Score")
    ax.set_title("CosmicWatch Model Evaluation Metrics")
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, h + 0.02, f"{h:.3f}", ha="center", va="bottom", fontweight="bold")
    plt.tight_layout()
    metrics_plot_path = os.path.join(results_dir, "metrics_summary.png")
    fig.savefig(metrics_plot_path)
    plt.close(fig)

    # 3. Anomaly Score Distribution Plot
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    ax.hist(anomaly_scores_normal, bins=15, alpha=0.6, label="Normal Background", color="#94a3b8")
    ax.hist(anomaly_scores_signal, bins=15, alpha=0.7, label="Signal Candidates", color="#f59e0b")
    ax.set_xlabel("Normalized Anomaly Score [0 - 1]")
    ax.set_ylabel("Count")
    ax.set_title("Anomaly Score Distribution (Normal vs Candidates)")
    ax.legend()
    plt.tight_layout()
    anom_plot_path = os.path.join(results_dir, "anomaly_score_distribution.png")
    fig.savefig(anom_plot_path)
    plt.close(fig)

    print(f"[OK] Plots saved: {cm_plot_path}, {metrics_plot_path}, {anom_plot_path}")
    print(f"Summary: Accuracy={accuracy:.4f}, Precision={precision:.4f}, Recall={recall:.4f}, F1={f1_score:.4f}")
    return results


if __name__ == "__main__":
    run_evaluation()
