import React, { useState } from 'react';
import { Eye, ArrowUpDown, Filter, Sparkles, AlertCircle, Radio } from 'lucide-react';

export default function CandidateTable({ candidates, onSelectCandidate, selectedId }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('SCORE_DESC');

  const filtered = candidates.filter((c) => {
    if (filterStatus === 'HIGH') return c.status?.includes('HIGH');
    if (filterStatus === 'INTERESTING') return c.status?.includes('INTERESTING');
    if (filterStatus === 'RFI') return c.status?.includes('RFI');
    if (filterStatus === 'NORMAL') return c.status?.includes('NORMAL');
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'SCORE_DESC') return b.candidate_score - a.candidate_score;
    if (sortBy === 'ANOMALY_DESC') return b.anomaly_score - a.anomaly_score;
    if (sortBy === 'CONF_DESC') return b.signal_confidence - a.signal_confidence;
    return 0;
  });

  const getStatusBadge = (status) => {
    if (status?.includes('HIGH')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 border border-rose-500/40 text-rose-400">
          HIGH PRIORITY FOR REVIEW
        </span>
      );
    }
    if (status?.includes('INTERESTING')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 border border-amber-500/40 text-amber-400">
          INTERESTING CANDIDATE
        </span>
      );
    }
    if (status?.includes('RFI')) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/15 border border-purple-500/40 text-purple-400">
          POSSIBLE RFI
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-400">
        LIKELY NORMAL
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-rose-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-obs-cyan';
    return 'text-slate-400';
  };

  return (
    <div className="observatory-panel rounded-xl border border-space-700 overflow-hidden">
      {/* Table Header & Filters */}
      <div className="p-4 border-b border-space-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold font-mono tracking-wider text-white flex items-center space-x-2">
            <Radio className="h-4 w-4 text-obs-cyan" />
            <span>ASTRONOMICAL CANDIDATE CATALOG</span>
            <span className="text-xs font-normal text-slate-400">({candidates.length} observations)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by multi-variable CosmicWatch score incorporating CNN confidence, anomaly score, and ON/OFF consistency.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-500 hidden sm:inline">FILTER:</span>
          {['ALL', 'HIGH', 'INTERESTING', 'RFI'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterStatus === f
                  ? 'bg-obs-cyan text-space-950 font-bold'
                  : 'bg-space-900 border border-space-700 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-space-900/80 border-b border-space-800 text-slate-400 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Candidate ID</th>
              <th className="py-3 px-4">Target / Observatory</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-center">Signal Conf</th>
              <th className="py-3 px-4 text-center">Anomaly</th>
              <th className="py-3 px-4 text-center">RFI Like</th>
              <th className="py-3 px-4">Verification Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-space-850">
            {sorted.map((cand) => {
              const isSelected = selectedId === cand.candidate_id;
              return (
                <tr
                  key={cand.candidate_id}
                  onClick={() => onSelectCandidate(cand.candidate_id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-obs-cyan/10 border-l-4 border-obs-cyan' : 'hover:bg-space-900/60'
                  }`}
                >
                  {/* Candidate ID */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white tracking-wider">{cand.candidate_id}</span>
                      {cand.is_synthetic && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-950/40 border border-amber-800/60 text-[9px] text-amber-400">
                          SYNTHETIC
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block">{cand.signal_type || 'OBSERVED'}</span>
                  </td>

                  {/* Target / Source */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{cand.target_name || 'Ross 128'}</div>
                    <div className="text-[10px] text-slate-400">{cand.telescope || 'GBT'}</div>
                  </td>

                  {/* Score */}
                  <td className="py-3 px-4 text-center">
                    <span className={`text-base font-extrabold ${getScoreColor(cand.candidate_score)}`}>
                      {cand.candidate_score}
                    </span>
                    <span className="text-[10px] text-slate-500">/100</span>
                  </td>

                  {/* Signal Confidence */}
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-slate-300">
                      {(cand.signal_confidence * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Anomaly Score */}
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-obs-amber">
                      {(cand.anomaly_score * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* RFI Likelihood */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-slate-400">
                      {cand.rfi_likelihood != null ? (cand.rfi_likelihood * 100).toFixed(0) + '%' : '12%'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    {getStatusBadge(cand.status)}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCandidate(cand.candidate_id);
                      }}
                      className="px-2.5 py-1 rounded bg-space-800 hover:bg-obs-cyan hover:text-space-950 text-slate-300 border border-space-700 transition-colors inline-flex items-center space-x-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
