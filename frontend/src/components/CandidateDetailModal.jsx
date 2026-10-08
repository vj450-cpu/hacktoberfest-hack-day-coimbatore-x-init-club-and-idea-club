import React from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, Telescope, Radio, ExternalLink, Activity, Info } from 'lucide-react';
import WaterfallViewer from './WaterfallViewer';
import OnOffComparison from './OnOffComparison';

export default function CandidateDetailModal({ candidate, onClose }) {
  if (!candidate) return null;

  const score = candidate.candidate_score ?? 0;
  const isHighPri = score >= 80;
  const isInteresting = score >= 60 && score < 80;
  const isRFI = candidate.status?.includes('RFI') || (candidate.rfi_likelihood ?? 0) >= 0.7;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-space-950 border border-space-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-space-900/80">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${
              isHighPri ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' :
              isInteresting ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
              isRFI ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' :
              'bg-space-800 border-space-700 text-slate-400'
            }`}>
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold font-mono text-white tracking-wider">
                  CANDIDATE INSPECTION: {candidate.candidate_id}
                </h2>
                {candidate.is_synthetic && (
                  <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-[10px] text-amber-400 font-mono">
                    SYNTHETIC VALIDATION
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Target: <span className="text-white">{candidate.target_name || 'Ross 128'}</span> | Observatory: <span className="text-obs-cyan">{candidate.telescope || 'GBT'}</span> | Signal: <span className="text-slate-300">{candidate.signal_type || 'OBSERVED'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-400 hover:text-white transition-colors border border-space-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Key Metric Gauges Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            
            {/* Candidate Score */}
            <div className="p-3 rounded-xl bg-space-900 border border-space-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">CosmicWatch Score</span>
              <div className={`text-2xl font-black ${
                isHighPri ? 'text-rose-400' : isInteresting ? 'text-amber-400' : isRFI ? 'text-purple-400' : 'text-slate-400'
              }`}>
                {score}<span className="text-xs font-normal text-slate-500">/100</span>
              </div>
            </div>

            {/* Signal Confidence */}
            <div className="p-3 rounded-xl bg-space-900 border border-space-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Signal Confidence</span>
              <div className="text-2xl font-black text-obs-cyan">
                {((candidate.signal_confidence ?? 0) * 100).toFixed(0)}%
              </div>
            </div>

            {/* Anomaly Score */}
            <div className="p-3 rounded-xl bg-space-900 border border-space-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Anomaly Score</span>
              <div className="text-2xl font-black text-obs-amber">
                {((candidate.anomaly_score ?? 0) * 100).toFixed(0)}%
              </div>
            </div>

            {/* Persistence */}
            <div className="p-3 rounded-xl bg-space-900 border border-space-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Persistence</span>
              <div className="text-2xl font-black text-slate-200">
                {((candidate.persistence ?? 0) * 100).toFixed(0)}%
              </div>
            </div>

            {/* Narrowband Likelihood */}
            <div className="p-3 rounded-xl bg-space-900 border border-space-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Narrowband Likelihood</span>
              <div className="text-2xl font-black text-obs-teal">
                {((candidate.narrowband_likelihood ?? 0) * 100).toFixed(0)}%
              </div>
            </div>

            {/* RFI Likelihood */}
            <div className="p-3 rounded-xl bg-space-900 border border-space-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">RFI Likelihood</span>
              <div className={`text-2xl font-black ${isRFI ? 'text-purple-400' : 'text-slate-400'}`}>
                {((candidate.rfi_likelihood ?? 0) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Spectrogram Waterfall Visualization */}
          <WaterfallViewer
            heatmapData={candidate.heatmap}
            title={`Waterfall Spectrogram - ${candidate.target_name || candidate.candidate_id}`}
          />

          {/* ON / OFF Cross-Observation Spatial Check */}
          <OnOffComparison
            onOffStatus={candidate.on_off_status}
            targetName={candidate.target_name}
            telescope={candidate.telescope}
          />

          {/* AI Explanation Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-obs-indigo/10 to-obs-cyan/10 border border-obs-cyan/30">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-obs-cyan animate-pulse" />
              <h3 className="text-xs font-bold font-mono tracking-wider text-obs-cyan uppercase">
                WHY IS THIS INTERESTING? — SCIENTIFIC REASONING ANALYSIS
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-space-900 border border-space-700 text-slate-400 font-mono">
                {candidate.model_used || 'Gemma-2 Open-Weight'}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              "{candidate.explanation}"
            </p>
          </div>

          {/* Investigation Recommendation Banner */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
            isHighPri
              ? 'bg-rose-950/30 border-rose-600/60 text-rose-200'
              : isInteresting
              ? 'bg-amber-950/30 border-amber-600/60 text-amber-200'
              : isRFI
              ? 'bg-purple-950/30 border-purple-600/60 text-purple-200'
              : 'bg-space-900 border-space-800 text-slate-300'
          }`}>
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase font-mono tracking-wide">
                RECOMMENDATION: {candidate.status}
              </div>
              <p className="text-xs mt-1 opacity-90 font-sans">
                {candidate.recommendation}
              </p>
            </div>
          </div>

          {/* Mandatory Scientific Disclaimer */}
          <div className="p-3 rounded-lg bg-space-900/60 border border-space-800 flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
            <Info className="h-4 w-4 text-obs-cyan flex-shrink-0" />
            <span>
              <strong>SCIENTIFIC MANDATE:</strong> {candidate.disclaimer || "This system identifies unusual astronomical data patterns. It does not establish extraterrestrial origin."}
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-space-800 bg-space-900/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Observation ID: {candidate.observation_id || candidate.candidate_id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-space-800 hover:bg-space-700 text-white border border-space-700 transition-colors font-medium"
          >
            Close Telemetry View
          </button>
        </div>

      </div>
    </div>
  );
}
