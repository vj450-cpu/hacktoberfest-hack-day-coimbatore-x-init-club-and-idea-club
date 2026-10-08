import React from 'react';
import { Database, ShieldCheck, Radio, AlertTriangle, Flame } from 'lucide-react';

export default function StatsOverview({ stats }) {
  const cards = [
    {
      label: 'Observations Analyzed',
      value: stats?.observations_analyzed ?? 5,
      subtext: 'High-res filterbank windows',
      icon: Database,
      color: 'text-obs-cyan',
      borderColor: 'border-obs-cyan/20',
      bgColor: 'bg-obs-cyan/5',
    },
    {
      label: 'Normal Observations',
      value: stats?.normal_observations ?? 1,
      subtext: 'Thermal Gaussian baseline',
      icon: ShieldCheck,
      color: 'text-slate-400',
      borderColor: 'border-slate-700/50',
      bgColor: 'bg-slate-800/30',
    },
    {
      label: 'Known / Normal Signals',
      value: stats?.known_normal_signals ?? 1,
      subtext: 'Instrument & reference combs',
      icon: Radio,
      color: 'text-obs-indigo',
      borderColor: 'border-obs-indigo/20',
      bgColor: 'bg-obs-indigo/5',
    },
    {
      label: 'Anomalies Detected',
      value: stats?.anomalies ?? 3,
      subtext: 'Isolation Forest flagged (score > 0.7)',
      icon: AlertTriangle,
      color: 'text-obs-amber',
      borderColor: 'border-obs-amber/20',
      bgColor: 'bg-obs-amber/5',
    },
    {
      label: 'High-Priority Candidates',
      value: stats?.high_priority_candidates ?? 2,
      subtext: 'Score ≥ 80 / Warrants telescope review',
      icon: Flame,
      color: 'text-obs-rose',
      borderColor: 'border-rose-500/30',
      bgColor: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`observatory-panel observatory-panel-hover rounded-xl p-4 border ${card.borderColor} ${card.bgColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 font-mono tracking-tight">{card.label}</span>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${card.color}`}>
                {card.value}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
