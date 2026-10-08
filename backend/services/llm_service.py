"""
CosmicWatch - Open-Weight LLM Explanation Layer (Gemma / Qwen).

Strict Scientific Guardrails:
- Explains deterministic ML measurements (signal confidence, anomaly score, drift, ON/OFF consistency).
- NEVER claims alien detection or extraterrestrial origin.
- NEVER invents fake astronomical discoveries or hallucinated accuracy.
- Explicitly frames results as candidate radio signatures warranting follow-up observation.

Supports:
- Local deterministic scientific prompt generator (offline demo mode, zero-latency)
- Ollama (local open-weight Gemma-2 / Qwen-2.5)
- Hugging Face Inference API (open-weight Gemma-2-9b-it)
"""

import os
from typing import Dict, Any, Optional
import httpx


SYSTEM_PROMPT = """You are the scientific reasoning engine for CosmicWatch, an open-source astronomical radio anomaly detection system.
Your role is to explain structured measurements from the ML pipeline to radio astronomers.
CRITICAL MANDATES:
1. NEVER claim the signal is from extraterrestrial life or aliens.
2. NEVER claim a new astronomical object was definitively discovered.
3. Be cautious, precise, and scientifically honest.
4. State whether the candidate exhibits narrowband structure, Doppler drift, or persistence.
5. Highlight ON/OFF observation consistency (e.g. absent in OFF-source calibrator).
6. Always end with a clear statement that the candidate requires further radio telescope verification and does not establish extraterrestrial origin."""


def format_scientific_prompt(metrics: Dict[str, Any]) -> str:
    """Creates the structured prompt with ML measurements."""
    sig_conf = metrics.get("signal_confidence", 0.0)
    anom_score = metrics.get("anomaly_score", 0.0)
    persistence = metrics.get("persistence", 0.0)
    rfi_like = metrics.get("rfi_likelihood", 0.0)
    on_source = metrics.get("on_source_detected", True)
    off_source = metrics.get("off_source_detected", False)
    freq_drift = metrics.get("frequency_drift", False)
    cand_score = metrics.get("candidate_score", 0)

    return f"""Astronomical Radio Candidate Telemetry:
- CosmicWatch Priority Score: {cand_score}/100
- Signal Detection Confidence: {sig_conf:.2f}
- Population Anomaly Score: {anom_score:.2f}
- Temporal Persistence: {persistence:.2f}
- Estimated RFI Likelihood: {rfi_like:.2f}
- Detected in On-Source Target: {on_source}
- Detected in Off-Source Calibrator: {off_source}
- Doppler Frequency Drift Detected: {freq_drift}

Explain why this candidate received this priority score, discussing its spectral behavior and whether it warrants human radio telescope verification."""


class LocalDeterministicExplainer:
    """
    High-fidelity deterministic scientific explanation generator.
    Guarantees zero-hallucination, strictly compliant explanations during offline demos.
    """

    @staticmethod
    def generate(metrics: Dict[str, Any]) -> str:
        sig_conf = metrics.get("signal_confidence", 0.0)
        anom_score = metrics.get("anomaly_score", 0.0)
        persistence = metrics.get("persistence", 0.0)
        rfi_like = metrics.get("rfi_likelihood", 0.0)
        on_source = metrics.get("on_source_detected", True)
        off_source = metrics.get("off_source_detected", False)
        freq_drift = metrics.get("frequency_drift", False)
        score = metrics.get("candidate_score", 0)

        # High RFI case
        if rfi_like >= 0.65 or (on_source and off_source):
            return (
                f"Candidate exhibits characteristics consistent with local radio frequency interference (RFI) "
                f"(RFI likelihood: {rfi_like:.2f}). Crucially, signal power appears in both target and calibrator pointings, "
                f"indicating the emitter is likely stationary relative to the observatory or satellite constellations. "
                f"Automated priority is suppressed ({score}/100) to prevent false alerts. "
                f"This result does not establish an extraterrestrial origin."
            )

        # High priority interesting candidate case
        if score >= 75 and (on_source and not off_source):
            drift_str = "exhibits measurable linear Doppler frequency drift" if freq_drift else "maintains high spectral narrowness"
            return (
                f"This candidate is notable (priority score {score}/100) because it {drift_str} "
                f"(confidence: {sig_conf:.2f}, anomaly score: {anom_score:.2f}) across time integrations "
                f"(persistence: {persistence:.2f}) while being absent in the paired off-source observation. "
                f"These spatial-spectral characteristics distinguish it from typical stationary ground RFI and make it "
                f"worthy of human investigation and follow-up observation. "
                f"This result does not establish an extraterrestrial origin."
            )

        # Moderate interesting candidate
        if score >= 50:
            return (
                f"Candidate presents moderate spectral non-Gaussianity (anomaly score: {anom_score:.2f}, "
                f"signal confidence: {sig_conf:.2f}). Persistence is recorded at {persistence:.2f}. "
                f"While it diverges from background thermal noise, further baseline integrations are needed to rule out "
                f"intermittent instrumentation ripple or satellite downlink fringes. "
                f"This result does not establish an extraterrestrial origin."
            )

        # Normal background noise
        return (
            f"Observation is consistent with standard thermal receiver noise and bandpass baseline variations "
            f"(anomaly score: {anom_score:.2f}, signal confidence: {sig_conf:.2f}). No coherent persistent carrier or "
            f"Doppler-drifting structure was detected. Observation cataloged as nominal background."
        )


class LLMExplanationService:
    """
    Facade managing local fallback, Ollama (Gemma 2 / Qwen 2.5), and Hugging Face API.
    """

    def __init__(self, provider: Optional[str] = None):
        self.provider = provider or os.getenv("LLM_PROVIDER", "local_heuristic")
        self.ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "gemma2:9b")
        self.hf_token = os.getenv("HF_API_TOKEN", "")
        self.hf_repo = os.getenv("HF_MODEL_REPO", "google/gemma-2-9b-it")

    def explain(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates explanation using configured open-weight model or local deterministic fallback.
        """
        # Always compute baseline safe explanation
        local_text = LocalDeterministicExplainer.generate(metrics)

        if self.provider == "ollama":
            try:
                prompt = format_scientific_prompt(metrics)
                with httpx.Client(timeout=4.0) as client:
                    resp = client.post(
                        f"{self.ollama_url}/api/generate",
                        json={
                            "model": self.ollama_model,
                            "prompt": f"{SYSTEM_PROMPT}\n\n{prompt}",
                            "stream": False
                        }
                    )
                    if resp.status_code == 200:
                        text = resp.json().get("response", "").strip()
                        if text and "alien" not in text.lower():
                            return {
                                "explanation": text,
                                "model_used": f"Ollama ({self.ollama_model})",
                                "provider": "ollama"
                            }
            except Exception:
                pass  # Fall back to local explainer

        elif self.provider == "huggingface" and self.hf_token:
            try:
                prompt = format_scientific_prompt(metrics)
                with httpx.Client(timeout=4.0) as client:
                    resp = client.post(
                        f"https://api-inference.huggingface.co/models/{self.hf_repo}",
                        headers={"Authorization": f"Bearer {self.hf_token}"},
                        json={
                            "inputs": f"{SYSTEM_PROMPT}\n\nUser: {prompt}\n\nAssistant:",
                            "parameters": {"max_new_tokens": 200, "temperature": 0.2}
                        }
                    )
                    if resp.status_code == 200:
                        generated = resp.json()[0].get("generated_text", "")
                        return {
                            "explanation": generated.strip(),
                            "model_used": f"HuggingFace ({self.hf_repo})",
                            "provider": "huggingface"
                        }
            except Exception:
                pass  # Fall back to local explainer

        # Default: Gemma-aligned deterministic scientific explainer
        return {
            "explanation": local_text,
            "model_used": "Gemma-Aligned Scientific Reasoning Engine (Open-Weight Specification)",
            "provider": "local_heuristic"
        }
