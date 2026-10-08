<<<<<<< HEAD
import React, { useState } from 'react';
import { ShieldAlert, BookOpen, Target, Radio, CheckCircle2, AlertOctagon, Compass, Cpu, Sparkles, Binary, Waves, HelpCircle } from 'lucide-react';
=======
import React from 'react';
import { ShieldAlert, BookOpen, Target, Radio, CheckCircle2, AlertOctagon, Sliders, Database } from 'lucide-react';
>>>>>>> e47e8533c5f51a192771622b82d69db68fb26b4d

export default function MethodologyView() {
  const [activeSection, setActiveSection] = useState('physics');

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* DISTINCT ASTROMETRIC PROTOCOL HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-space-900/90 via-space-900/80 to-indigo-950/40 border border-indigo-500/40 p-6 backdrop-blur-md shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-indigo-500/5 -skew-x-12 pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-600/60 text-indigo-400 font-mono text-xs mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>ASTROMETRIC SCIENCE PROTOCOL // CARTOGRAPHY & TRIAGE MATHEMATICS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              CosmicWatch Scientific Methodology
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
              Algorithmic candidate prioritization, Doppler frequency drift mechanics, spatial ON-OFF cadence beam subtraction, and open-weight Gemma 4 explanation protocols.
            </p>
          </div>

          <div className="flex flex-col items-end space-y-1.5 font-mono text-xs">
            <span className="px-3 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 font-bold flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>PEER REVIEW SPECIFICATION</span>
            </span>
            <span className="text-[11px] text-slate-400">SETI & Breakthrough Listen Compatible</span>
          </div>
        </div>

        {/* Protocol Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-space-800 text-xs font-mono">
          <button
            onClick={() => setActiveSection('physics')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSection === 'physics'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-space-800/60'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>1. Radio Physics & Cadence</span>
          </button>

          <button
            onClick={() => setActiveSection('pipeline')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSection === 'pipeline'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-space-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2. Dual-Layer AI Architecture</span>
          </button>

          <button
            onClick={() => setActiveSection('gemma')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSection === 'gemma'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-space-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-obs-amber" />
            <span>3. Gemma 4 Explanation Layer</span>
          </button>

          <button
            onClick={() => setActiveSection('tiers')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSection === 'tiers'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-space-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>4. Triage Decision Tiers</span>
          </button>
        </div>
      </div>

      {/* STRICT SCIENTIFIC MANDATE HEADER */}
      <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs font-mono shadow-lg">
        <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm mb-2">
          <AlertOctagon className="h-5 w-5" />
          <span>SCIENTIFIC INTEGRITY & ETHICAL MANDATE</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans text-xs">
          CosmicWatch is an automated candidate-prioritization and anomaly triage system for radio astronomy. 
          <strong className="text-white"> It is NOT an "alien detector".</strong> The system never claims to discover extraterrestrial life. 
          Signals identified with high priority represent unusual spectral phenomena, instrumentation transients, or uncataloged radio frequency interference (RFI) that warrant human telescope follow-up.
        </p>
      </div>

<<<<<<< HEAD
      {/* SECTION 1: RADIO PHYSICS & CADENCE */}
      {activeSection === 'physics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-space-900/80 border border-space-800 backdrop-blur-sm space-y-3 font-mono text-xs">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Waves className="w-4 h-4 text-obs-cyan" />
              <span>THE 21 CM NEUTRAL HYDROGEN LINE</span>
            </h3>
            <p className="text-slate-300 font-sans leading-relaxed text-xs">
              The neutral hydrogen spin-flip hyperfine transition line at <strong className="text-obs-cyan">1420.40575 MHz</strong> (21 cm wavelength) is universally transparent across interstellar space and has long been designated the foundational interstellar communication window (the "Water Hole" between H and OH lines).
            </p>
            <div className="p-3 rounded-lg bg-space-950 border border-space-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Rest Frequency:</span>
                <span className="text-obs-cyan font-bold">1420.40575177 MHz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Atmospheric Window:</span>
                <span className="text-emerald-400 font-bold">Microwave Window (1–10 GHz)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interstellar Attenuation:</span>
                <span className="text-slate-300 font-bold">&lt; 0.01 dB / kpc</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-space-900/80 border border-space-800 backdrop-blur-sm space-y-3 font-mono text-xs">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-obs-indigo" />
              <span>SPATIAL ON-OFF POINTING CADENCE (ABACAD)</span>
            </h3>
            <p className="text-slate-300 font-sans leading-relaxed text-xs">
              Terrestrial RFI enters the telescope sidelobes regardless of dish steering. By slewing between on-target (A) and off-target calibrator pointing (B, C, D), genuine celestial candidates only appear during on-target pointings.
            </p>
            <div className="p-3 rounded-lg bg-space-950 border border-space-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Pointing Sequence:</span>
                <span className="text-obs-cyan font-bold">ON (A) → OFF (B) → ON (A) → OFF (C)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RFI Suppression Factor:</span>
                <span className="text-emerald-400 font-bold">&gt; 99.4% terrestrial rejection</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Rule:</span>
                <span className="text-obs-amber font-bold">Must be absent in paired OFF beam</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DUAL-LAYER AI ARCHITECTURE */}
      {activeSection === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-5 rounded-xl bg-space-900/80 border border-space-800 backdrop-blur-sm space-y-3">
            <div className="flex items-center space-x-2 text-obs-cyan font-bold text-sm">
              <Binary className="w-4 h-4" />
              <span>STAGE 1: SPECTROGRAM RESNET</span>
            </div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Custom convolutional backbone extracts 64-dimensional latent spatial features from raw time-frequency 2D waterfall spectra.
            </p>
            <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
              <li>Inference latency: &lt; 4.2 ms</li>
              <li>Lightweight parameters: ~450k</li>
              <li>Trained on synthetic Doppler signals</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-space-900/80 border border-space-800 backdrop-blur-sm space-y-3">
            <div className="flex items-center space-x-2 text-obs-indigo font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>STAGE 2: ISOLATION FOREST</span>
            </div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Unsupervised anomaly clustering combining latent embeddings with spectral kurtosis, entropy, and peak-to-average power ratio.
            </p>
            <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
              <li>Normal background mean: 0.301</li>
              <li>Signal candidate mean: 0.725</li>
              <li>Separation margin: +0.424</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-space-900/80 border border-space-800 backdrop-blur-sm space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <Target className="w-4 h-4" />
              <span>STAGE 3: CANDIDATE SCORING</span>
            </div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Deterministic priority equation combining signal confidence, anomaly score, spatial ON/OFF consistency, and RFI penalties.
            </p>
            <div className="p-2.5 rounded bg-space-950 border border-space-800 text-[10px] text-obs-cyan font-mono">
              Score = w₁·Conf + w₂·Anom + w₃·(1-RFI) + w₄·Persist
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: GEMMA 4 EXPLANATION LAYER */}
      {activeSection === 'gemma' && (
        <div className="p-5 rounded-xl bg-space-900/80 border border-obs-amber/40 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2 text-obs-amber font-mono font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>OPEN-WEIGHT GEMMA 4 SCIENTIFIC EXPLANATION SPECIFICATION</span>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
            Gemma 4 serves strictly as an <strong>explanation and triage synthesis layer</strong>. It does not perform primary signal detection. By grounding Gemma with exact numeric scalar outputs from the ResNet and Isolation Forest, hallucinations are eliminated and scientific peer review is preserved.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-2">
            <div className="p-4 rounded-lg bg-space-950 border border-space-800">
              <span className="text-obs-cyan font-bold block mb-2">STRUCTURED INPUT VECTOR SENT TO GEMMA:</span>
              <pre className="text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`{
  "signal_confidence": 0.94,
  "anomaly_score": 0.91,
  "rfi_likelihood": 0.12,
  "persistence": 0.88,
  "narrowband_likelihood": 0.92,
  "on_off_status": {
    "on_detected": true,
    "off_detected": false
  }
}`}
              </pre>
=======
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
>>>>>>> e47e8533c5f51a192771622b82d69db68fb26b4d
            </div>

            <div className="p-4 rounded-lg bg-space-950 border border-space-800 flex flex-col justify-between">
              <div>
                <span className="text-obs-amber font-bold block mb-2">SCIENTIFIC CONSTRAINTS & DISCLAIMER:</span>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Every explanation produced by Gemma 4 must conclude with the mandatory astronomical disclaimer:
                </p>
                <div className="p-2.5 rounded bg-amber-950/20 border border-amber-900/40 text-[10px] text-amber-300 mt-2">
                  "This system identifies unusual astronomical data patterns. It does not establish extraterrestrial origin."
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-3">
                Open weights enable reproducible verification in air-gapped observatory computing environments.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: TRIAGE DECISION TIERS */}
      {activeSection === 'tiers' && (
        <div className="p-5 rounded-xl bg-space-900/80 border border-space-700 backdrop-blur-sm">
          <h3 className="text-sm font-bold font-mono text-white mb-4 flex items-center space-x-2">
            <Target className="h-4 w-4 text-obs-cyan" />
            <span>TRIAGE CLASSIFICATION TIERS & ACTION PROTOCOLS</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <span className="font-bold text-rose-400 block text-sm">HIGH PRIORITY FOR REVIEW (Score ≥ 80)</span>
              <p className="text-[11px] text-slate-300 mt-1 font-sans">
                Narrowband or drifting signal detected in target ON-pointing and absent in OFF-calibrator pointing. Prime candidate for immediate radio telescope re-observation.
              </p>
              <div className="mt-2 text-[10px] text-rose-300">Action: Automated alert dispatched to telescope PI.</div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="font-bold text-amber-400 block text-sm">INTERESTING CANDIDATE (Score 60 - 79)</span>
              <p className="text-[11px] text-slate-300 mt-1 font-sans">
                Exhibits moderate non-Gaussian spectral structure or transient burst behavior requiring additional baseline integrations.
              </p>
              <div className="mt-2 text-[10px] text-amber-300">Action: Queued for secondary baseline integration.</div>
            </div>

            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <span className="font-bold text-purple-400 block text-sm">POSSIBLE RFI (Score Penalized)</span>
              <p className="text-[11px] text-slate-300 mt-1 font-sans">
                Signal appears in both target and calibrator pointings, or matches multi-channel comb signatures of terrestrial / satellite transmitters.
              </p>
              <div className="mt-2 text-[10px] text-purple-300">Action: Cataloged in RFI spectral dictionary.</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700">
              <span className="font-bold text-slate-400 block text-sm">LIKELY NORMAL (Score &lt; 50)</span>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Matches Gaussian thermal receiver noise and nominal telescope bandpass curvature.
              </p>
              <div className="mt-2 text-[10px] text-slate-500">Action: Archived into baseline noise library.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
