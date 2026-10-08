import React from 'react';
import { ShieldAlert, BookOpen, Target, Radio, CheckCircle2, AlertOctagon, Sliders, Database } from 'lucide-react';

export default function MethodologyView() {
  return (
    <div className="space-y-6">
      {/* Strict Scientific Mandate Header */}
      <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs font-mono">
        <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm mb-2">
          <AlertOctagon className="h-5 w-5" />
          <span>SCIENTIFIC INTEGRITY & ETHICAL MANDATE</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans text-xs">
          CosmicWatch is an automated candidate-prioritization and anomaly triage system for radio astronomy. 
          <strong> It is NOT an "alien detector".</strong> The system never claims to discover extraterrestrial life. 
          Signals identified with high priority represent unusual spectral phenomena, instrumentation transients, or uncataloged radio frequency interference (RFI) that warrant human telescope follow-up.
        </p>
      </div>

      {/* Distinction Matrix */}
      <div className="p-4 rounded-xl bg-space-900 border border-space-800 text-xs font-mono">
        <div className="flex items-center space-x-2 text-obs-cyan font-bold mb-3">
          <Database className="h-4 w-4" />
          <span>SCIENTIFIC TAXONOMY & CLASSIFICATION PRINCIPLES</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
          <div className="p-2.5 rounded-lg bg-space-950 border border-space-850">
            <span className="text-obs-cyan font-bold block mb-1">1. REAL OBSERVATIONS</span>
            <p className="text-slate-400">Authentic Breakthrough Listen radio data (.fil/.h5) from Green Bank Telescope, Parkes, and MeerKAT.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-space-950 border border-space-850">
            <span className="text-amber-400 font-bold block mb-1">2. SYNTHETIC BENCHMARKS</span>
            <p className="text-slate-400">Controlled artificial signal injections used for reproducible unit testing and model evaluation (clearly marked as synthetic).</p>
          </div>
          <div className="p-2.5 rounded-lg bg-space-950 border border-space-850">
            <span className="text-obs-indigo font-bold block mb-1">3. MODEL PREDICTIONS</span>
            <p className="text-slate-400">Probabilistic neural classifications and Isolation Forest statistical density scores.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-space-950 border border-space-850">
            <span className="text-purple-400 font-bold block mb-1">4. PROTOTYPE HEURISTICS</span>
            <p className="text-slate-400">Configurable triage multipliers (e.g. 40% RFI penalty factor) designed for prototype triage demonstration, not physical constants.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* The 4-Tier Verification Hierarchy */}
        <div className="observatory-panel rounded-xl p-5 border border-space-700">
          <h3 className="text-sm font-bold font-mono text-white mb-3 flex items-center space-x-2">
            <Radio className="h-4 w-4 text-obs-cyan" />
            <span>TRIAGE CLASSIFICATION TIERS</span>
          </h3>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <span className="font-bold text-rose-400 block">HIGH PRIORITY FOR REVIEW (Score ≥ 80)</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Narrowband or drifting signal detected in target ON-pointing and absent in OFF-calibrator pointing. Candidate requires further observation; does not establish extraterrestrial origin.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="font-bold text-amber-400 block">INTERESTING CANDIDATE (Score 60 - 79)</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Exhibits moderate non-Gaussian spectral structure or transient burst behavior requiring additional baseline integrations.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <span className="font-bold text-purple-400 block">POSSIBLE RFI (Score Penalized)</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Signal appears in both target and calibrator pointings, or matches multi-channel comb signatures of terrestrial / satellite transmitters.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700">
              <span className="font-bold text-slate-400 block">LIKELY NORMAL</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Matches Gaussian thermal receiver noise and nominal telescope bandpass curvature.
              </p>
            </div>
          </div>
        </div>

        {/* Data Architecture & Open Weight AI */}
        <div className="observatory-panel rounded-xl p-5 border border-space-700 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono text-white mb-3 flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-obs-indigo" />
              <span>DATA SOURCES & OPEN-WEIGHT AI</span>
            </h3>
            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div>
                <span className="text-obs-cyan font-bold block">1. BREAKTHROUGH LISTEN ARCHIVE:</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ingests Green Bank Telescope (GBT), Parkes, and MeerKAT filterbank (.fil) and HDF5 (.h5) public observations using BLIMPY.
                </p>
              </div>

              <div>
                <span className="text-obs-cyan font-bold block">2. LIGHTWEIGHT SPECTROGRAM RESNET:</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pre-trained CNN backbone extracting 64-dim latent spatial representations directly from 2D waterfall spectra.
                </p>
              </div>

              <div>
                <span className="text-obs-cyan font-bold block">3. DUAL-LAYER ANOMALY DETECTOR:</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Combines latent embeddings with spectral kurtosis, entropy, and PAPR to compute normalized Isolation Forest anomaly scores.
                </p>
              </div>

              <div>
                <span className="text-obs-cyan font-bold block">4. OPEN-WEIGHT GEMMA EXPLAINER:</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Translates structured telemetry into cautious, scientifically grounded natural language explanations.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-space-800 text-[11px] text-slate-500 font-mono">
            Repository: MIT Open Source | SETI / Breakthrough Listen Community Compatible
          </div>
        </div>
      </div>
    </div>
  );
}
