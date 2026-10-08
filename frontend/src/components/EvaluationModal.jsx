import React from 'react';
import { BarChart3, CheckCircle2, ShieldCheck, Cpu, Database, AlertCircle, Info } from 'lucide-react';

export default function EvaluationView() {
  const metrics = {
    accuracy: 0.875,
    precision: 1.000,
    recall: 0.750,
    f1_score: 0.857,
    dataset_size: 200,
    seed: 7777,
    cm: {
      tp: 75,
      fp: 0,
      tn: 100,
      fn: 25,
    },
    anomaly: {
      mean_normal: 0.301,
      mean_signal: 0.725,
      margin: 0.424,
    }
  };

  return (
    <div className="space-y-6">
      <div className="observatory-panel rounded-xl p-5 border border-space-700">
        <div className="flex items-center justify-between pb-3 border-b border-space-800">
          <div>
            <h2 className="text-base font-bold font-mono text-white flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-obs-cyan" />
              <span>EMPIRICAL MODEL EVALUATION & BENCHMARKS</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical evaluation on held-out synthetic test benchmark (N={metrics.dataset_size}, Seed={metrics.seed}).
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800 text-emerald-400 font-mono text-xs">
            BENCHMARK: REPRODUCIBLE
          </span>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-5">
          <div className="p-3.5 rounded-lg bg-space-900 border border-space-800 text-center font-mono">
            <span className="text-slate-400 text-xs block mb-1">CLASSIFICATION ACCURACY</span>
            <div className="text-3xl font-extrabold text-obs-cyan">{(metrics.accuracy * 100).toFixed(1)}%</div>
            <p className="text-[10px] text-slate-500 mt-1">LightweightSpectrogramResNet</p>
          </div>

          <div className="p-3.5 rounded-lg bg-space-900 border border-space-800 text-center font-mono">
            <span className="text-slate-400 text-xs block mb-1">PRECISION (CANDIDATES)</span>
            <div className="text-3xl font-extrabold text-emerald-400">{(metrics.precision * 100).toFixed(1)}%</div>
            <p className="text-[10px] text-slate-500 mt-1">On 100 nominal noise test windows</p>
          </div>

          <div className="p-3.5 rounded-lg bg-space-900 border border-space-800 text-center font-mono">
            <span className="text-slate-400 text-xs block mb-1">RECALL (SENSITIVITY)</span>
            <div className="text-3xl font-extrabold text-obs-indigo">{(metrics.recall * 100).toFixed(1)}%</div>
            <p className="text-[10px] text-slate-500 mt-1">75/100 test signal patterns identified</p>
          </div>

          <div className="p-3.5 rounded-lg bg-space-900 border border-space-800 text-center font-mono">
            <span className="text-slate-400 text-xs block mb-1">F1 HARMONIC SCORE</span>
            <div className="text-3xl font-extrabold text-purple-400">{(metrics.f1_score * 100).toFixed(1)}%</div>
            <p className="text-[10px] text-slate-500 mt-1">Balanced classification metric</p>
          </div>
        </div>

        {/* Confusion Matrix and Anomaly Separation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
          
          {/* Confusion Matrix Visual */}
          <div className="p-4 rounded-xl bg-space-900/80 border border-space-800">
            <h3 className="text-xs font-bold font-mono text-white mb-3 tracking-wider uppercase">
              CONFUSION MATRIX (N = 200 TEST WINDOWS)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60">
                <span className="text-[10px] text-slate-400 block">TRUE NEGATIVE (NORMAL NOISE)</span>
                <span className="text-2xl font-bold text-emerald-400">{metrics.cm.tn}</span>
                <span className="text-[10px] text-emerald-300 block">Baseline Noise Correctly Filtered</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-space-800">
                <span className="text-[10px] text-slate-400 block">FALSE POSITIVE (FALSE ALARM)</span>
                <span className="text-2xl font-bold text-slate-400">{metrics.cm.fp}</span>
                <span className="text-[10px] text-slate-500 block">Noise flagged as candidate</span>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/50">
                <span className="text-[10px] text-slate-400 block">FALSE NEGATIVE (MISSED)</span>
                <span className="text-2xl font-bold text-amber-400">{metrics.cm.fn}</span>
                <span className="text-[10px] text-amber-300 block">Sub-threshold or faint injected signals</span>
              </div>

              <div className="p-3 rounded-lg bg-obs-cyan/15 border border-obs-cyan/50">
                <span className="text-[10px] text-slate-400 block">TRUE POSITIVE (DETECTED)</span>
                <span className="text-2xl font-bold text-obs-cyan">{metrics.cm.tp}</span>
                <span className="text-[10px] text-obs-cyan block">Correct Injected Signal Detections</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-mono">
              Scientific Note: These metrics reflect evaluation on synthetic benchmarks (Seed: 7777). In operational observatory deployments with real RFI clutter and bandpass ripples, false-positive and false-negative rates will vary.
            </p>
          </div>

          {/* Anomaly Detection Separation */}
          <div className="p-4 rounded-xl bg-space-900/80 border border-space-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono text-white mb-3 tracking-wider uppercase">
                ANOMALY DETECTOR SEPARATION MARGIN
              </h3>
              
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>NORMAL BACKGROUND MEAN SCORE:</span>
                    <span className="text-slate-300 font-bold">{metrics.anomaly.mean_normal}</span>
                  </div>
                  <div className="w-full h-2 rounded bg-space-950 overflow-hidden">
                    <div className="h-full bg-slate-500 rounded" style={{ width: `${metrics.anomaly.mean_normal * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>CANDIDATE SIGNAL MEAN SCORE:</span>
                    <span className="text-obs-amber font-bold">{metrics.anomaly.mean_signal}</span>
                  </div>
                  <div className="w-full h-2 rounded bg-space-950 overflow-hidden">
                    <div className="h-full bg-obs-amber rounded" style={{ width: `${metrics.anomaly.mean_signal * 100}%` }}></div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-space-950 border border-space-800 mt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">DISCRIMINATIVE MARGIN:</span>
                    <span className="text-emerald-400 font-bold text-sm">+{metrics.anomaly.margin}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Isolation Forest successfully separates nominal thermal noise (~0.30) from anomalous structured candidates (~0.72) using latent embeddings and spectral kurtosis.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-space-800 text-[11px] text-slate-400 font-mono">
              Artifacts: <code className="text-obs-cyan">ml/evaluation/results/evaluation_metrics.json</code>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
