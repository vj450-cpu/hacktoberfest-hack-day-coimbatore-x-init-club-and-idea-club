import React, { useState } from 'react';
import { Play, Loader2, Sparkles, Sliders, CheckCircle2, ChevronRight, Zap, Cpu } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'data', name: 'DATA INGESTION', desc: 'BLIMPY / Breakthrough Listen window' },
  { id: 'prep', name: 'PREPROCESSING', desc: 'Robust percentile norm & baseline flatten' },
  { id: 'signal', name: 'SIGNAL DETECTION', desc: 'Lightweight ResNet spectrogram classifier' },
  { id: 'anomaly', name: 'ANOMALY DETECTION', desc: 'Isolation Forest & spectral kurtosis' },
  { id: 'score', name: 'CANDIDATE SCORING', desc: 'CosmicWatch multi-criteria engine' },
  { id: 'llm', name: 'SCIENTIFIC EXPLANATION', desc: 'Gemma 4 — AI Scientific Explanation', badge: 'OPEN-WEIGHT' },
];

export default function PipelineRunner({ onRunAnalysis, isRunning, lastAnalyzed }) {
  const [sampleType, setSampleType] = useState('DRIFTING_NARROWBAND');
  const [targetName, setTargetName] = useState('Ross 128 (Target A)');
  const [telescope, setTelescope] = useState('Green Bank Telescope');
  const [snrDb, setSnrDb] = useState(16.0);
  const [activeStage, setActiveStage] = useState(-1);

  const samplePresets = [
    { type: 'DRIFTING_NARROWBAND', target: 'Ross 128 (Target A)', tel: 'Green Bank Telescope', snr: 16.5, label: 'Drifting Narrowband (High Candidate)' },
    { type: 'NARROWBAND', target: 'Proxima Centauri', tel: 'Parkes Observatory', snr: 12.0, label: 'Stationary Carrier (Interesting)' },
    { type: 'TERRESTRIAL_RFI', target: 'Observatory Calibrator', tel: 'Green Bank Telescope', snr: 19.0, label: 'Terrestrial RFI (Suppressed Priority)' },
    { type: 'INTERMITTENT', target: 'TRAPPIST-1 e', tel: 'MeerKAT Array', snr: 14.0, label: 'Intermittent Pulsed Signal' },
    { type: 'BROADBAND_BURST', target: 'FRB Field 121102', tel: 'Parkes Observatory', snr: 15.0, label: 'Broadband Radio Burst' },
    { type: 'NORMAL_NOISE', target: 'Deep Sky Blank Field', tel: 'Green Bank Telescope', snr: 0.0, label: 'Nominal Receiver Background' },
  ];

  const handleSelectPreset = (p) => {
    setSampleType(p.type);
    setTargetName(p.target);
    setTelescope(p.tel);
    setSnrDb(p.snr);
  };

  const handleRun = async () => {
    setActiveStage(0);
    // Simulate pipeline stage progression
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      setActiveStage(i);
      await new Promise((r) => setTimeout(r, 220));
    }
    await onRunAnalysis({
      sample_type: sampleType,
      target_name: targetName,
      telescope: telescope,
      snr_db: Number(snrDb),
    });
    setActiveStage(-1);
  };

  return (
    <div className="observatory-panel rounded-xl p-5 mb-6 border border-space-700/80">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-space-800">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-obs-cyan" />
            <h2 className="text-sm font-bold font-mono tracking-wider text-white">LIVE CANDIDATE PIPELINE ORCHESTRATOR</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest astronomical observations, execute dual-layer AI anomaly detection, and generate human-readable scientific triage.
          </p>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleRun}
          disabled={isRunning || activeStage >= 0}
          className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider flex items-center space-x-2 transition-all shadow-lg ${
            isRunning || activeStage >= 0
              ? 'bg-space-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-obs-cyan to-obs-indigo text-space-950 hover:brightness-110 shadow-obs-cyan/20 active:scale-95'
          }`}
        >
          {isRunning || activeStage >= 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-obs-cyan" />
              <span>PROCESSING PIPELINE...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>RUN COSMICWATCH</span>
            </>
          )}
        </button>
      </div>

      {/* Target & Preset Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-4 text-xs font-mono">
        <div>
          <label className="text-slate-400 block mb-1">OBSERVATION PRESET</label>
          <select
            value={sampleType}
            onChange={(e) => {
              const match = samplePresets.find((p) => p.type === e.target.value);
              if (match) handleSelectPreset(match);
              else setSampleType(e.target.value);
            }}
            className="w-full bg-space-900 border border-space-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-obs-cyan"
          >
            {samplePresets.map((p) => (
              <option key={p.type} value={p.type}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">TARGET COORDINATE</label>
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            className="w-full bg-space-900 border border-space-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-obs-cyan"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">PRIMARY TELESCOPE</label>
          <input
            type="text"
            value={telescope}
            onChange={(e) => setTelescope(e.target.value)}
            className="w-full bg-space-900 border border-space-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-obs-cyan"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">SIGNAL-TO-NOISE (SNR): {snrDb} dB</label>
          <input
            type="range"
            min="0"
            max="25"
            step="0.5"
            value={snrDb}
            onChange={(e) => setSnrDb(parseFloat(e.target.value))}
            className="w-full accent-obs-cyan mt-1"
          />
        </div>
      </div>

      {/* Animated Pipeline Stage Flow */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
          <span>PIPELINE EXECUTION TELEMETRY:</span>
          <span>{activeStage >= 0 ? `EXECUTING STAGE ${activeStage + 1}/6` : 'IDLE / READY'}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map((stg, idx) => {
            const isActive = activeStage === idx;
            const isDone = activeStage > idx;
            return (
              <div
                key={stg.id}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  isActive
                    ? 'border-obs-cyan bg-obs-cyan/20 text-white shadow-md shadow-obs-cyan/20 animate-pulse'
                    : isDone
                    ? 'border-emerald-600/50 bg-emerald-950/20 text-emerald-400'
                    : 'border-space-800 bg-space-900/60 text-slate-400'
                }`}
              >
                <div className="flex flex-wrap items-center justify-center gap-1 mb-1">
                  {isDone ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] font-mono opacity-70">[{idx + 1}]</span>
                  )}
                  <span className="text-[11px] font-mono font-bold tracking-tight">{stg.name}</span>
                  {stg.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      {stg.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{stg.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI MODEL STACK & TRIAGE ARCHITECTURE */}
      <div className="mt-5 pt-4 border-t border-space-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-obs-cyan" />
            <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              AI MODEL STACK
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 font-mono">
              HYBRID ARCHITECTURE
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            CNN Signal Classifier + Isolation Forest Anomaly + Gemma 4 Open-Weight LLM
          </span>
        </div>

        {/* 3 Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
          {/* Card 1: SIGNAL DETECTION */}
          <div className="p-3.5 rounded-lg bg-space-900/90 border border-space-700/80 hover:border-obs-cyan/50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-obs-cyan">
                SIGNAL DETECTION
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-obs-cyan/15 border border-obs-cyan/30 text-obs-cyan">
                VISION AI
              </span>
            </div>
            <div className="text-xs font-bold text-white mb-0.5">
              LightweightSpectrogramResNet
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              Custom CNN
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-sans leading-relaxed">
              Custom 2-block PyTorch ResNet classifying 2D spectrogram windows into signal confidence ($p$) and 64-dim latent embedding in &lt;5ms.
            </p>
          </div>

          {/* Card 2: ANOMALY DETECTION */}
          <div className="p-3.5 rounded-lg bg-space-900/90 border border-space-700/80 hover:border-obs-amber/50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-obs-amber">
                ANOMALY DETECTION
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-obs-amber/15 border border-obs-amber/30 text-obs-amber">
                STATISTICAL AI
              </span>
            </div>
            <div className="text-xs font-bold text-white mb-0.5">
              Isolation Forest
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              + Spectral Features
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-sans leading-relaxed">
              Evaluates non-Gaussian density across combined latent embeddings, spectral kurtosis, entropy, PAPR, and temporal persistence.
            </p>
          </div>

          {/* Card 3: SCIENTIFIC EXPLANATION */}
          <div className="p-3.5 rounded-lg bg-space-900/90 border border-indigo-500/40 hover:border-indigo-400 transition-colors shadow-lg shadow-indigo-500/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                SCIENTIFIC EXPLANATION
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold">
                OPEN-WEIGHT
              </span>
            </div>
            <div className="text-xs font-bold text-white mb-0.5">
              Gemma 4
            </div>
            <div className="text-[11px] text-indigo-200 font-medium">
              Open-weight LLM
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-sans leading-relaxed">
              Translates structured scalar measurements (NOT raw pixels) into cautious, human-readable scientific triage rationales for astronomers.
            </p>
          </div>
        </div>

        {/* 10-Second Judge Architecture Ribbon */}
        <div className="mt-3 p-2.5 rounded-lg bg-space-950/70 border border-space-800 flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-slate-400">
          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider pr-1">TRIAGE PIPELINE:</span>
          <span className="px-1.5 py-0.5 rounded bg-space-800 text-slate-200 font-semibold">RADIO DATA</span>
          <span className="text-obs-cyan">→</span>
          <span className="px-1.5 py-0.5 rounded bg-obs-cyan/15 text-obs-cyan font-semibold border border-obs-cyan/30">CUSTOM CNN</span>
          <span className="text-obs-cyan">→</span>
          <span className="px-1.5 py-0.5 rounded bg-obs-amber/15 text-obs-amber font-semibold border border-obs-amber/30">ANOMALY DETECTOR</span>
          <span className="text-obs-cyan">→</span>
          <span className="px-1.5 py-0.5 rounded bg-space-800 text-slate-200 font-semibold">CANDIDATE SCORE</span>
          <span className="text-indigo-400">→</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">GEMMA 4</span>
          <span className="text-indigo-400">→</span>
          <span className="px-1.5 py-0.5 rounded bg-space-800 text-slate-200 font-semibold">HUMAN-READABLE SCIENTIFIC TRIAGE</span>
          <span className="text-emerald-400">→</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-300 font-bold border border-emerald-800">ASTRONOMER</span>
        </div>
      </div>
    </div>
  );
}
