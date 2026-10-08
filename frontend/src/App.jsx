import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import PipelineRunner from './components/PipelineRunner';
import CandidateTable from './components/CandidateTable';
import CandidateDetailModal from './components/CandidateDetailModal';
import EvaluationView from './components/EvaluationModal';
import MethodologyView from './components/MethodologyView';

const API_BASE = 'http://localhost:8000';

// High-fidelity fallback catalog ensuring 100% offline demo functionality
const FALLBACK_CANDIDATES = [
  {
    candidate_id: 'CW-00427',
    candidate_score: 94,
    signal_confidence: 0.94,
    anomaly_score: 0.91,
    rfi_likelihood: 0.12,
    persistence: 0.88,
    narrowband_likelihood: 0.92,
    classification: 'SIGNAL_CANDIDATE',
    status: 'HIGH PRIORITY FOR REVIEW',
    target_name: 'Ross 128 (Target A)',
    telescope: 'Green Bank Telescope',
    is_synthetic: true,
    signal_type: 'DRIFTING_NARROWBAND',
    freq_range_mhz: [1420.000, 1420.714],
    recommendation: 'HIGH PRIORITY FOR HUMAN REVIEW: Candidate requires follow-up observation on primary radio telescope.',
    explanation: 'This candidate is notable (priority score 94/100) because it exhibits measurable linear Doppler frequency drift across time integrations (persistence: 0.88) while being absent in the paired off-source observation. These spatial-spectral characteristics distinguish it from typical stationary ground RFI and make it worthy of human investigation. This result does not establish an extraterrestrial origin.',
    model_used: 'Gemma-Aligned Scientific Reasoning Engine',
    on_off_status: { on_detected: true, off_detected: false, on_off_consistency: 1.0 },
    disclaimer: 'This system identifies unusual astronomical data patterns. It does not establish extraterrestrial origin.',
    heatmap: {
      z: Array.from({ length: 16 }, (_, t) =>
        Array.from({ length: 128 }, (_, f) => {
          // drifting line
          const center = 40 + t * 2;
          const dist = Math.abs(f - center);
          return dist < 2 ? 0.95 - dist * 0.3 : Math.min(1, Math.max(0, 0.15 + (Math.sin(t * f) * 0.1)));
        })
      ),
      x_freq_mhz: Array.from({ length: 128 }, (_, i) => +(1420.0 + i * 0.0055).toFixed(4)),
      y_time_sec: Array.from({ length: 16 }, (_, i) => +(i * 18.25).toFixed(1)),
    }
  },
  {
    candidate_id: 'CW-00891',
    candidate_score: 82,
    signal_confidence: 0.86,
    anomaly_score: 0.84,
    rfi_likelihood: 0.18,
    persistence: 0.81,
    narrowband_likelihood: 0.89,
    classification: 'SIGNAL_CANDIDATE',
    status: 'HIGH PRIORITY FOR REVIEW',
    target_name: 'Proxima Centauri',
    telescope: 'Parkes Observatory',
    is_synthetic: true,
    signal_type: 'NARROWBAND',
    freq_range_mhz: [1420.100, 1420.814],
    recommendation: 'HIGH PRIORITY FOR HUMAN REVIEW: Stationary narrowband carrier absent in off-target beam.',
    explanation: 'Candidate exhibits persistent un-drifting carrier signal in target pointing (confidence: 0.86, anomaly score: 0.84). Calibrator pointing shows baseline noise. Recommended for secondary array verification. This result does not establish an extraterrestrial origin.',
    model_used: 'Gemma-Aligned Scientific Reasoning Engine',
    on_off_status: { on_detected: true, off_detected: false, on_off_consistency: 1.0 },
    disclaimer: 'This system identifies unusual astronomical data patterns. It does not establish extraterrestrial origin.',
    heatmap: {
      z: Array.from({ length: 16 }, (_, t) =>
        Array.from({ length: 128 }, (_, f) => (Math.abs(f - 64) < 2 ? 0.92 : 0.12 + Math.random() * 0.15))
      ),
      x_freq_mhz: Array.from({ length: 128 }, (_, i) => +(1420.1 + i * 0.0055).toFixed(4)),
      y_time_sec: Array.from({ length: 16 }, (_, i) => +(i * 18.25).toFixed(1)),
    }
  },
  {
    candidate_id: 'CW-00173',
    candidate_score: 38,
    signal_confidence: 0.89,
    anomaly_score: 0.78,
    rfi_likelihood: 0.88,
    persistence: 0.95,
    narrowband_likelihood: 0.95,
    classification: 'SIGNAL_CANDIDATE',
    status: 'POSSIBLE RFI',
    target_name: 'Calibrator Pointing',
    telescope: 'Green Bank Telescope',
    is_synthetic: true,
    signal_type: 'TERRESTRIAL_RFI',
    freq_range_mhz: [1420.000, 1420.714],
    recommendation: 'Candidate matches known RFI profile or appears in off-source observation. Likely local interference.',
    explanation: 'Candidate exhibits characteristics consistent with local radio frequency interference (RFI) (RFI likelihood: 0.88). Signal power appears in both target and calibrator pointings, indicating the emitter is likely stationary relative to the observatory or satellite constellations. Priority is suppressed (38/100).',
    model_used: 'Gemma-Aligned Scientific Reasoning Engine',
    on_off_status: { on_detected: true, off_detected: true, on_off_consistency: 0.15 },
    disclaimer: 'This system identifies unusual astronomical data patterns. It does not establish extraterrestrial origin.',
    heatmap: {
      z: Array.from({ length: 16 }, (_, t) =>
        Array.from({ length: 128 }, (_, f) => (f % 28 === 0 ? 0.9 : 0.1 + Math.random() * 0.1))
      ),
      x_freq_mhz: Array.from({ length: 128 }, (_, i) => +(1420.0 + i * 0.0055).toFixed(4)),
      y_time_sec: Array.from({ length: 16 }, (_, i) => +(i * 18.25).toFixed(1)),
    }
  },
  {
    candidate_id: 'CW-00902',
    candidate_score: 64,
    signal_confidence: 0.72,
    anomaly_score: 0.85,
    rfi_likelihood: 0.22,
    persistence: 0.25,
    narrowband_likelihood: 0.35,
    classification: 'SIGNAL_CANDIDATE',
    status: 'INTERESTING CANDIDATE',
    target_name: 'FRB Field 121102',
    telescope: 'MeerKAT Array',
    is_synthetic: true,
    signal_type: 'BROADBAND_BURST',
    freq_range_mhz: [1420.000, 1420.714],
    recommendation: 'Candidate exhibits notable spectral features. Candidate requires further observation.',
    explanation: 'Candidate exhibits short-duration broadband dispersion across multiple channels. High anomaly score (0.85). Warrants transient radio review.',
    model_used: 'Gemma-Aligned Scientific Reasoning Engine',
    on_off_status: { on_detected: true, off_detected: false, on_off_consistency: 1.0 },
    disclaimer: 'This system identifies unusual astronomical data patterns. It does not establish extraterrestrial origin.',
    heatmap: {
      z: Array.from({ length: 16 }, (t) =>
        Array.from({ length: 128 }, (_, f) => (t === 7 && f > 20 && f < 90 ? 0.85 : 0.12 + Math.random() * 0.1))
      ),
      x_freq_mhz: Array.from({ length: 128 }, (_, i) => +(1420.0 + i * 0.0055).toFixed(4)),
      y_time_sec: Array.from({ length: 16 }, (_, i) => +(i * 18.25).toFixed(1)),
    }
  },
  {
    candidate_id: 'CW-00054',
    candidate_score: 18,
    signal_confidence: 0.12,
    anomaly_score: 0.15,
    rfi_likelihood: 0.05,
    persistence: 0.08,
    narrowband_likelihood: 0.10,
    classification: 'NORMAL',
    status: 'LIKELY NORMAL',
    target_name: 'Deep Sky Blank Field',
    telescope: 'Green Bank Telescope',
    is_synthetic: true,
    signal_type: 'NORMAL_NOISE',
    freq_range_mhz: [1420.000, 1420.714],
    recommendation: 'Consistent with thermal receiver background or baseline noise. Low priority.',
    explanation: 'Observation is consistent with standard thermal receiver noise and bandpass baseline variations. Cataloged as nominal background.',
    model_used: 'Gemma-Aligned Scientific Reasoning Engine',
    on_off_status: { on_detected: false, off_detected: false, on_off_consistency: 0.0 },
    disclaimer: 'This system identifies unusual astronomical data patterns. It does not establish extraterrestrial origin.',
    heatmap: {
      z: Array.from({ length: 16 }, () =>
        Array.from({ length: 128 }, () => 0.1 + Math.random() * 0.15)
      ),
      x_freq_mhz: Array.from({ length: 128 }, (_, i) => +(1420.0 + i * 0.0055).toFixed(4)),
      y_time_sec: Array.from({ length: 16 }, (_, i) => +(i * 18.25).toFixed(1)),
    }
  }
];

export default function App() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [candidates, setCandidates] = useState(FALLBACK_CANDIDATES);
  const [stats, setStats] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRunning, setIsRunning] = useState(false);

  // Poll or check backend connection
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          setBackendOnline(true);
          // Fetch real candidates
          const cRes = await fetch(`${API_BASE}/api/candidates`);
          if (cRes.ok) {
            const list = await cRes.json();
            if (list.length > 0) setCandidates(list);
          }
          // Fetch stats
          const sRes = await fetch(`${API_BASE}/api/statistics`);
          if (sRes.ok) {
            setStats(await sRes.json());
          }
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };
    checkBackend();
  }, []);

  const handleSelectCandidate = async (candidateId) => {
    // If backend is online, fetch full details
    if (backendOnline) {
      try {
        const res = await fetch(`${API_BASE}/api/candidates/${candidateId}`);
        if (res.ok) {
          const detail = await res.json();
          setSelectedCandidate(detail);
          return;
        }
      } catch (err) {
        console.error('Error fetching candidate detail:', err);
      }
    }
    // Fallback: look up in local catalog
    const local = candidates.find((c) => c.candidate_id === candidateId) || FALLBACK_CANDIDATES[0];
    setSelectedCandidate(local);
  };

  const handleRunAnalysis = async (params) => {
    setIsRunning(true);
    try {
      if (backendOnline) {
        const res = await fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (res.ok) {
          const newCand = await res.json();
          setCandidates((prev) => [newCand, ...prev.filter((c) => c.candidate_id !== newCand.candidate_id)]);
          setSelectedCandidate(newCand);
          // Refresh stats
          const sRes = await fetch(`${API_BASE}/api/statistics`);
          if (sRes.ok) setStats(await sRes.json());
          setIsRunning(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend call failed, using client simulation:', err);
    }

    // Client fallback simulation
    const cid = `CW-${Math.floor(1000 + Math.random() * 9000)}`;
    const isRFI = params.sample_type === 'TERRESTRIAL_RFI';
    const isNoise = params.sample_type === 'NORMAL_NOISE';
    const score = isRFI ? 36 : isNoise ? 19 : Math.floor(78 + Math.random() * 18);

    const simulated = {
      candidate_id: cid,
      candidate_score: score,
      signal_confidence: isNoise ? 0.12 : 0.91,
      anomaly_score: isNoise ? 0.15 : 0.88,
      rfi_likelihood: isRFI ? 0.88 : 0.14,
      persistence: isNoise ? 0.05 : 0.85,
      narrowband_likelihood: isNoise ? 0.1 : 0.9,
      classification: isNoise ? 'NORMAL' : 'SIGNAL_CANDIDATE',
      status: score >= 80 ? 'HIGH PRIORITY FOR REVIEW' : score >= 60 ? 'INTERESTING CANDIDATE' : isRFI ? 'POSSIBLE RFI' : 'LIKELY NORMAL',
      target_name: params.target_name,
      telescope: params.telescope,
      is_synthetic: true,
      signal_type: params.sample_type,
      freq_range_mhz: [1420.0, 1420.714],
      recommendation: score >= 80 ? 'HIGH PRIORITY FOR HUMAN REVIEW: Follow-up required.' : isRFI ? 'Local RFI detected across beams.' : 'Nominal baseline noise.',
      explanation: `Simulated analysis for ${params.target_name}: Candidate score ${score}/100 with signal confidence ${isNoise ? '0.12' : '0.91'}. This result does not establish an extraterrestrial origin.`,
      model_used: 'CosmicWatch Offline Engine',
      on_off_status: { on_detected: !isNoise, off_detected: isRFI, on_off_consistency: isRFI ? 0.15 : 1.0 },
      disclaimer: 'This system identifies unusual astronomical data patterns. It does not establish extraterrestrial origin.',
      heatmap: FALLBACK_CANDIDATES[0].heatmap,
    };

    setCandidates((prev) => [simulated, ...prev]);
    setSelectedCandidate(simulated);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans">
      {/* Observatory Header */}
      <Header
        backendOnline={backendOnline}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {activeTab === 'dashboard' && (
          <>
            {/* Top Stats Cards */}
            <StatsOverview stats={stats} />

            {/* Interactive Pipeline Execution Bar */}
            <PipelineRunner
              onRunAnalysis={handleRunAnalysis}
              isRunning={isRunning}
              lastAnalyzed={selectedCandidate}
            />

            {/* Candidate Prioritization Table */}
            <CandidateTable
              candidates={candidates}
              onSelectCandidate={handleSelectCandidate}
              selectedId={selectedCandidate?.candidate_id}
            />
          </>
        )}

        {activeTab === 'evaluation' && <EvaluationView />}

        {activeTab === 'methodology' && <MethodologyView />}
      </main>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-space-800 bg-space-950/80 py-4 text-center text-xs font-mono text-slate-500">
        <p>COSMICWATCH — Open-Source Astronomical Anomaly Detection System (MIT License)</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Radio SETI & Breakthrough Listen Candidate Triage. This system identifies unusual data patterns and does not establish extraterrestrial origin.
        </p>
      </footer>
    </div>
  );
}
