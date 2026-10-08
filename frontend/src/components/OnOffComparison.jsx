import React from 'react';
import { Target, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function OnOffComparison({ onOffStatus, targetName = "Target A", telescope = "Green Bank Telescope" }) {
  const onDetected = onOffStatus?.on_detected ?? true;
  const offDetected = onOffStatus?.off_detected ?? false;
  const isDirectional = onDetected && !offDetected;
  const isMultiBeam = onDetected && offDetected;

  return (
    <div className="bg-space-900/90 rounded-xl p-4 border border-space-800">
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-obs-indigo" />
          <span className="font-bold text-white tracking-wider uppercase">ON / OFF CADENCE SPATIAL VERIFICATION</span>
        </div>
        <span className="text-slate-400">Pointings: AB Cadence Protocol</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* ON Observation Box */}
        <div className={`p-3 rounded-lg border text-xs font-mono ${onDetected ? 'bg-obs-cyan/10 border-obs-cyan/50 text-white' : 'bg-space-950 border-space-800 text-slate-400'}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-obs-cyan">POINTING A (ON-SOURCE TARGET)</span>
            {onDetected ? (
              <span className="flex items-center space-x-1 text-obs-cyan font-bold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>SIGNAL PRESENT</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-slate-500 text-[11px]">
                <XCircle className="h-3.5 w-3.5" />
                <span>NOT DETECTED</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-300">Target: {targetName}</div>
          <div className="text-[10px] text-slate-500">Antenna pointed on boresight target coordinates</div>
        </div>

        {/* OFF Observation Box */}
        <div className={`p-3 rounded-lg border text-xs font-mono ${offDetected ? 'bg-purple-950/30 border-purple-600/50 text-white' : 'bg-emerald-950/20 border-emerald-800/50 text-slate-300'}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-purple-400">POINTING B (OFF-SOURCE CALIBRATOR)</span>
            {offDetected ? (
              <span className="flex items-center space-x-1 text-purple-400 font-bold text-[11px]">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>SIGNAL PRESENT (CONSISTENT WITH RFI)</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>ABSENT (CONSISTENT WITH DIRECTIONAL CANDIDATE)</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-300">Target: Offset Blank Field / Calibrator</div>
          <div className="text-[10px] text-slate-500">Antenna slewed by ~1.0° beamwidth offset</div>
        </div>
      </div>

      {/* Verification Conclusion Banner */}
      <div className={`p-2.5 rounded-lg border text-xs font-mono flex items-start space-x-2.5 ${
        isDirectional
          ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300'
          : isMultiBeam
          ? 'bg-purple-950/30 border-purple-700/60 text-purple-300'
          : 'bg-space-950 border-space-800 text-slate-400'
      }`}>
        {isDirectional ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
        ) : isMultiBeam ? (
          <AlertTriangle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
        )}
        <div>
          <span className="font-bold block">
            {isDirectional
              ? 'SPATIAL CADENCE: Signal absent in off-source pointing (directional candidate; requires further observation).'
              : isMultiBeam
              ? 'SPATIAL CADENCE: Signal present in both pointings (consistent with non-directional RFI).'
              : 'NO PERSISTENT SIGNAL DETECTED IN POINTING CADENCE.'}
          </span>
          <p className="text-[11px] opacity-80 mt-0.5">
            {isDirectional
              ? 'Candidate is not detected in the off-target pointing, satisfying initial spatial filter criteria. Does NOT prove extraterrestrial origin; transient RFI, satellite drift, or instrumental effects must still be ruled out with repeated observation.'
              : isMultiBeam
              ? 'Appears in multiple independent pointings, characteristic of local ground interference or satellite constellations entering antenna sidelobes.'
              : 'Observation remains consistent with nominal receiver noise statistics.'}
          </p>
        </div>
      </div>
    </div>
  );
}
