import React from 'react';
import Celestial3DCanvas from './Celestial3DCanvas';
import CinematicVideoPlayer from './CinematicVideoPlayer';
import HolographicSpectrogram3D from './HolographicSpectrogram3D';
import { Radio, ArrowRight, Compass, ShieldAlert, Cpu, Sparkles, Activity, Eye } from 'lucide-react';

export default function LandingPage({ onLaunchMissionControl, onExploreTarget }) {
  return (
    <div className="space-y-16 pb-16 font-sans">
      {/* HERO SECTION WITH 3D CELESTIAL SKY DOME */}
      <section className="relative pt-6">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-obs-cyan/15 via-obs-indigo/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="text-center max-w-4xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-space-900 border border-obs-cyan/40 text-obs-cyan text-xs font-mono shadow-lg shadow-obs-cyan/10">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>RADIO SETI & BREAKTHROUGH LISTEN OBSERVATORY TRIAGE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-obs-emerald animate-ping" />
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Listen Beyond the Noise. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-obs-cyan via-teal-300 to-indigo-400">
              Discover the Cosmic Signal.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Open-source AI astronomical anomaly detection transforming hundreds of terabytes of radio telescope observations into prioritized candidate events.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onLaunchMissionControl}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-obs-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-bold text-sm transition-all shadow-lg shadow-obs-cyan/25 flex items-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Activity className="w-4 h-4 text-space-950" />
              <span>Launch Mission Control</span>
              <ArrowRight className="w-4 h-4 text-space-950" />
            </button>
          </div>
        </div>

        {/* 3D Celestial Interactive Canvas */}
        <div className="relative">
          <Celestial3DCanvas onExploreTarget={onExploreTarget} />
        </div>
      </section>

      {/* QUICK STATS METRIC BANNER */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-space-900/70 border border-space-800 text-center font-mono">
          <span className="text-[11px] text-slate-400 uppercase block">Central Frequency</span>
          <span className="text-xl font-bold text-obs-cyan">1420.405 MHz</span>
          <span className="text-[10px] text-slate-500 block">Neutral Hydrogen Line</span>
        </div>
        <div className="p-4 rounded-xl bg-space-900/70 border border-space-800 text-center font-mono">
          <span className="text-[11px] text-slate-400 uppercase block">Inference Speed</span>
          <span className="text-xl font-bold text-obs-emerald">&lt; 4.2 ms</span>
          <span className="text-[10px] text-slate-500 block">PyTorch Spectrogram ResNet</span>
        </div>
        <div className="p-4 rounded-xl bg-space-900/70 border border-space-800 text-center font-mono">
          <span className="text-[11px] text-slate-400 uppercase block">RFI Suppression</span>
          <span className="text-xl font-bold text-indigo-400">&gt; 99.4%</span>
          <span className="text-[10px] text-slate-500 block">Spatial ON/OFF Verification</span>
        </div>
        <div className="p-4 rounded-xl bg-space-900/70 border border-space-800 text-center font-mono">
          <span className="text-[11px] text-slate-400 uppercase block">Scientific Rigor</span>
          <span className="text-xl font-bold text-obs-amber">Zero Hallucinations</span>
          <span className="text-[10px] text-slate-500 block">Gemma 4 Open-Weight Reasoning</span>
        </div>
      </section>

      {/* CINEMATIC VIDEO THEATRE */}
      <section id="video-section" className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800 text-indigo-400 text-xs font-mono">
            <Eye className="w-3.5 h-3.5" />
            <span>DEEP SPACE LIVE THEATRE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-mono">
            Observatory Multi-Channel Feeds & Audio
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time optical telescope alignment, spectrogram radio waterfall telemetry, and deep space ambient audio synthesis.
          </p>
        </div>

        <CinematicVideoPlayer />
      </section>

      {/* 3D HOLOGRAPHIC SPECTROGRAM ELEVATION */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-obs-cyan/10 border border-obs-cyan/30 text-obs-cyan text-xs font-mono">
            <Activity className="w-3.5 h-3.5" />
            <span>TOPOGRAPHIC SIGNAL MAPPING</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-mono">
            Interactive 3D Waterfall Elevation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Rotate the radio frequency surface in 3D to differentiate non-Gaussian coherent spikes from flat thermal receiver noise.
          </p>
        </div>

        <HolographicSpectrogram3D />
      </section>

      {/* MISSION CONTROL BANNER CALLOUT */}
      <section className="p-8 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-obs-cyan/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Ready to Triage Astronomical Candidates?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Launch the full interactive Mission Control dashboard to run synthetic injections, inspect ON/OFF spatial cadences, and review Gemma 4 scientific rationales.
          </p>
          <div className="pt-2">
            <button
              onClick={onLaunchMissionControl}
              className="px-6 py-3 rounded-xl bg-obs-cyan hover:bg-cyan-300 text-space-950 font-bold text-sm transition-all shadow-lg shadow-obs-cyan/20 cursor-pointer inline-flex items-center space-x-2"
            >
              <span>Enter Mission Control Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
