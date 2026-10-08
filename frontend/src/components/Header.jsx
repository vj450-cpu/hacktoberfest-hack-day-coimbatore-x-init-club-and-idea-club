import React, { useState, useEffect } from 'react';
import { Radio, Telescope, Activity, ShieldAlert, Cpu, BarChart3, Database } from 'lucide-react';

export default function Header({ backendOnline, activeTab, setActiveTab }) {
  const [timeUtc, setTimeUtc] = useState('');
  const [mjd, setMjd] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
      // Approximate MJD calculation
      const mjdVal = (now.getTime() / 86400000) + 40587;
      setMjd(mjdVal.toFixed(3));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-space-700/60 bg-space-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3.5 cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-obs-cyan/20 to-obs-indigo/30 border border-obs-cyan/40 group-hover:border-obs-cyan flex items-center justify-center shadow-lg shadow-obs-cyan/10 transition-all">
            <Radio className="h-5 w-5 text-obs-cyan animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-wider text-white font-mono group-hover:text-obs-cyan transition-colors">COSMIC<span className="text-obs-cyan">WATCH</span></span>
              <span className="text-xs px-2 py-0.5 rounded bg-space-800 border border-space-700 text-slate-400 font-mono">v1.0.0</span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide">3D AI Astronomical Anomaly & Candidate Prioritization</p>
          </div>
        </div>

        {/* Telemetry Status Bar */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <Telescope className="h-3.5 w-3.5 text-obs-indigo" />
            <span className="text-slate-400">ARRAY:</span>
            <span className="text-white font-semibold">GBT / PARKES</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-300">
            <Activity className="h-3.5 w-3.5 text-obs-cyan" />
            <span className="text-slate-400">TIME:</span>
            <span className="text-white">{timeUtc || '00:00:00 UTC'}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">MJD:</span>
            <span className="text-obs-cyan">{mjd || '59000.000'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-obs-emerald shadow-md shadow-obs-emerald animate-ping"></span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold border bg-emerald-950/60 border-emerald-600/70 text-emerald-300 font-mono tracking-wider shadow-sm shadow-emerald-500/20">
              ONLINE // GEMMA 4 ACTIVE
            </span>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${activeTab === 'landing' ? 'bg-gradient-to-r from-obs-cyan/20 to-obs-indigo/20 text-obs-cyan border border-obs-cyan/50 shadow-sm shadow-obs-cyan/20 font-bold' : 'text-slate-400 hover:text-white hover:bg-space-800'}`}
          >
            <Telescope className="h-3.5 w-3.5 text-obs-cyan" />
            <span>3D Observatory</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${activeTab === 'dashboard' ? 'bg-obs-cyan/15 text-obs-cyan border border-obs-cyan/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-space-800'}`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Mission Control</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${activeTab === 'evaluation' ? 'bg-obs-cyan/15 text-obs-cyan border border-obs-cyan/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-space-800'}`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>AI Evaluation</span>
          </button>

          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${activeTab === 'methodology' ? 'bg-obs-cyan/15 text-obs-cyan border border-obs-cyan/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-space-800'}`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Science Protocol</span>
          </button>
        </div>

      </div>
    </header>
  );
}
