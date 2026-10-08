import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Radio, Sparkles, RefreshCw, Film, Upload, Info } from 'lucide-react';

const VIDEO_FEEDS = [
  {
    id: 'deep-space',
    title: 'Breakthrough Listen: Deep Sky Sweep',
    sourceType: 'canvas-video',
    target: 'Ross 128 / Gliese 445',
    description: 'Ultra-wideband multi-beam scan across high-priority habitable exoplanetary systems.',
    coords: 'RA 11h 47m 44s | Dec +00° 48\' 16"',
    freq: '1420.4057 MHz (Hydrogen Line)',
    snr: '24.8 dB',
    drift: '-0.024 Hz/s',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // Fallback stream
  },
  {
    id: 'dish-tracking',
    title: 'Green Bank & Parkes Dish Telemetry',
    sourceType: 'canvas-video',
    target: 'Primary Azimuth Slew',
    description: 'Real-time 100-meter paraboloid mechanical pointing and cryo-receiver temperature monitoring.',
    coords: 'Az: 184.22° | El: 48.60°',
    freq: 'L-Band (1.1 - 1.9 GHz)',
    snr: '18.2 dB',
    drift: '0.000 Hz/s',
  },
  {
    id: 'spectrogram-stream',
    title: 'Spectrogram Doppler Drift Live Stream',
    sourceType: 'canvas-video',
    target: 'Candidate CW-00427',
    description: 'High-resolution time-frequency waterfall feed showing coherent non-terrestrial carrier drift.',
    coords: 'Cadence: ON-Target (Beam 1)',
    freq: 'Channel 427.88 kHz',
    snr: '31.4 dB',
    drift: '-0.380 Hz/s',
  }
];

export default function CinematicVideoPlayer() {
  const [activeFeedId, setActiveFeedId] = useState('deep-space');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [ambientAudio, setAmbientAudio] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [isUsingCustom, setIsUsingCustom] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const synthNodesRef = useRef([]);

  const currentFeed = isUsingCustom
    ? {
        id: 'custom',
        title: 'Custom User Observatory Video Feed',
        target: 'User Specified Stream',
        description: 'Direct video feed stream loaded from user media source.',
        coords: 'User Stream Matrix',
        freq: 'Broadband Multiplex',
        snr: '28.0 dB',
        drift: 'Variable',
      }
    : VIDEO_FEEDS.find((f) => f.id === activeFeedId) || VIDEO_FEEDS[0];

  // Synthesize ethereal space ambient drone via Web Audio API (100% offline, zero audio files required)
  const toggleAmbientSound = () => {
    if (ambientAudio) {
      // Turn off
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAmbientAudio(false);
    } else {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        // Root celestial frequency 108 Hz (A2 sub harmonic)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(108, ctx.currentTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(162, ctx.currentTime); // Perfect fifth harmonic

        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(216, ctx.currentTime); // Octave

        // Gentle low-pass filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc3.start();

        synthNodesRef.current = [osc1, osc2, osc3, gainNode];
        setAmbientAudio(true);
      } catch (e) {
        console.warn('Web Audio API initialized with warning:', e);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Procedural Canvas Video Renderer when no external MP4 is loaded or for the cosmic observatory simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const width = (canvas.width = 960);
    const height = (canvas.height = 540);

    let frame = 0;

    const renderVideo = () => {
      frame++;
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      const time = frame * 0.02 * speed;

      if (activeFeedId === 'deep-space' || isUsingCustom) {
        // Deep Space Flythrough Nebula Simulation
        const cx = width / 2;
        const cy = height / 2;

        // Swirling galactic disk
        for (let i = 0; i < 4; i++) {
          const armAngle = time * 0.3 + (i * Math.PI) / 2;
          const grad = ctx.createRadialGradient(
            cx + Math.cos(armAngle) * 80,
            cy + Math.sin(armAngle) * 40,
            10,
            cx,
            cy,
            380
          );
          grad.addColorStop(0, i % 2 === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(139, 92, 246, 0.3)');
          grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.15)');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }

        // Drifting stars with velocity streaks
        for (let s = 0; s < 120; s++) {
          const seed = (s * 9301 + 49297) % 233280;
          const angle = (seed % 360) * (Math.PI / 180);
          const baseDist = ((seed % 1000) / 1000) * 450;
          const currentDist = (baseDist + time * 120) % 500;
          const sx = cx + Math.cos(angle + time * 0.1) * currentDist;
          const sy = cy + Math.sin(angle + time * 0.1) * currentDist * 0.65;
          const size = (currentDist / 500) * 2.8 + 0.5;

          ctx.beginPath();
          ctx.fillStyle = s % 5 === 0 ? '#38bdf8' : s % 7 === 0 ? '#f59e0b' : '#ffffff';
          ctx.globalAlpha = Math.min(1, currentDist / 150);
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();

          // Motion streak
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = size * 0.8;
          ctx.moveTo(sx, sy);
          ctx.lineTo(
            sx - Math.cos(angle) * (currentDist / 500) * 12,
            sy - Math.sin(angle) * (currentDist / 500) * 8
          );
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      } else if (activeFeedId === 'dish-tracking') {
        // Radio Telescope Elevation & Azimuth Mechanical Simulation
        const cx = width / 2;
        const cy = height / 2 + 30;

        // Grid lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 1;
        for (let y = 40; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Rotating radar / Azimuth indicator
        ctx.beginPath();
        ctx.arc(cx, cy, 180, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 120, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.stroke();

        // Sweeping beam
        const sweepAngle = time * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 180, sweepAngle - 0.35, sweepAngle);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fill();

        // Dish outline
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20, 140, 50 + Math.sin(time) * 15, time * 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Feed horn
        ctx.beginPath();
        ctx.moveTo(cx, cy - 80);
        ctx.lineTo(cx - 50, cy - 10);
        ctx.moveTo(cx, cy - 80);
        ctx.lineTo(cx + 50, cy - 10);
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();
      } else {
        // Spectrogram Waterfall Feed
        const cols = 80;
        const rows = 35;
        const cellW = width / cols;
        const cellH = (height - 80) / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            // Simulated drifting narrowband signal
            const driftCenter = 30 + (r * 0.8 + time * 15) % cols;
            const dist = Math.abs(c - driftCenter);
            let val = Math.random() * 0.15;
            if (dist < 1.8) {
              val = 0.95 - dist * 0.2;
            }

            const hue = 220 - val * 180; // Blue to Cyan to Amber/Red
            ctx.fillStyle = `hsl(${hue}, 85%, ${val * 60 + 10}%)`;
            ctx.fillRect(c * cellW, 40 + r * cellH, cellW, cellH);
          }
        }
      }

      // Audio visualizer bar graph at bottom
      const barCount = 48;
      const barW = width / barCount;
      for (let b = 0; b < barCount; b++) {
        const h = Math.abs(Math.sin(time * 3 + b * 0.4)) * 36 + Math.random() * 12;
        ctx.fillStyle = b % 3 === 0 ? '#38bdf8' : b % 5 === 0 ? '#818cf8' : '#22d3ee';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(b * barW + 2, height - h, barW - 4, h);
      }
      ctx.globalAlpha = 1.0;

      // Scanline overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      for (let sl = 0; sl < height; sl += 4) {
        ctx.fillRect(0, sl, width, 1.5);
      }

      if (isPlaying) {
        animationId = requestAnimationFrame(renderVideo);
      }
    };

    renderVideo();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeFeedId, isPlaying, speed, isUsingCustom]);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setIsUsingCustom(true);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-space-700/80 bg-space-900/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-obs-cyan/5">
      {/* Top Channel Bar */}
      <div className="px-5 py-3.5 border-b border-space-800 flex flex-wrap items-center justify-between gap-3 bg-space-950/70">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-md bg-obs-cyan/15 text-obs-cyan border border-obs-cyan/30">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide font-mono flex items-center space-x-2">
              <span>OBSERVATORY LIVE VIDEO FEED</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                LIVE HD
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">Stream: {currentFeed.title}</p>
          </div>
        </div>

        {/* Stream Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {VIDEO_FEEDS.map((feed) => (
            <button
              key={feed.id}
              onClick={() => {
                setActiveFeedId(feed.id);
                setIsUsingCustom(false);
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all border ${
                !isUsingCustom && activeFeedId === feed.id
                  ? 'bg-obs-cyan/20 text-obs-cyan border-obs-cyan/50 shadow-sm shadow-obs-cyan/20'
                  : 'bg-space-800 text-slate-400 border-space-700 hover:text-white hover:bg-space-750'
              }`}
            >
              {feed.title.split(':')[0]}
            </button>
          ))}

          {/* User Video Upload / Local File Button */}
          <label className={`px-3 py-1 rounded-md text-xs font-mono cursor-pointer transition-all border flex items-center space-x-1.5 ${
            isUsingCustom
              ? 'bg-obs-indigo/30 text-indigo-300 border-indigo-500/60 shadow-sm shadow-indigo-500/20'
              : 'bg-space-800 text-slate-400 border-space-700 hover:text-white'
          }`}>
            <Upload className="w-3 h-3 text-indigo-400" />
            <span>Load Video</span>
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Video Display Window with Holographic HUD */}
      <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
        {isUsingCustom && customVideoUrl ? (
          <video
            ref={videoRef}
            src={customVideoUrl}
            autoPlay
            loop
            muted={isMuted}
            className="w-full h-full object-cover"
          />
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover block"
          />
        )}

        {/* Video HUD Telemetry Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
          {/* Top HUD */}
          <div className="flex items-start justify-between">
            <div className="bg-space-950/80 backdrop-blur-md px-3.5 py-2 rounded-lg border border-space-700/70 font-mono text-xs space-y-0.5">
              <div className="flex items-center space-x-2 text-obs-cyan">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-bold">{currentFeed.freq}</span>
              </div>
              <p className="text-slate-400 text-[11px]">{currentFeed.coords}</p>
              <div className="text-[10px] text-slate-500 flex space-x-3 pt-0.5">
                <span>SNR: <strong className="text-obs-emerald">{currentFeed.snr}</strong></span>
                <span>DRIFT: <strong className="text-obs-amber">{currentFeed.drift}</strong></span>
              </div>
            </div>

            <div className="bg-space-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-space-700/70 font-mono text-right text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block">TELEMETRY LOCK</span>
              <span className="text-obs-cyan font-bold">CARRIER DETECTED</span>
            </div>
          </div>

          {/* Corner Reticles */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-obs-cyan/60 pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-obs-cyan/60 pointer-events-none"></div>
          <div className="absolute bottom-16 left-4 w-4 h-4 border-b-2 border-l-2 border-obs-cyan/60 pointer-events-none"></div>
          <div className="absolute bottom-16 right-4 w-4 h-4 border-b-2 border-r-2 border-obs-cyan/60 pointer-events-none"></div>

          {/* Video Description Banner */}
          <div className="bg-space-950/85 backdrop-blur-md p-3 rounded-xl border border-space-700/70 max-w-xl self-start text-xs font-mono">
            <span className="text-obs-cyan text-[11px] font-semibold block">{currentFeed.target}</span>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{currentFeed.description}</p>
          </div>
        </div>

        {/* Video Player Floating Control Bar */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between bg-space-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-space-700/80 text-xs font-mono shadow-2xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-obs-cyan/20 text-obs-cyan hover:bg-obs-cyan/30 transition-colors"
              title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Ambient Audio Synthesizer Toggle */}
            <button
              onClick={toggleAmbientSound}
              className={`px-2.5 py-1 rounded-md text-[11px] flex items-center space-x-1.5 transition-all border ${
                ambientAudio
                  ? 'bg-obs-indigo/30 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/30'
                  : 'bg-space-800 text-slate-400 border-space-700 hover:text-white'
              }`}
              title="Toggle Web Audio Space Drone (Zero External Files, 100% Offline)"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{ambientAudio ? 'Space Audio: ON' : 'Ambient Space Audio'}</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-obs-cyan" />}
            </button>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            {/* Playback speed */}
            <div className="flex items-center space-x-1 text-[11px]">
              <span>Speed:</span>
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    speed === s ? 'bg-obs-cyan/20 text-obs-cyan font-bold' : 'hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (canvasRef.current && canvasRef.current.parentElement) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    canvasRef.current.parentElement.requestFullscreen();
                  }
                }
              }}
              className="hover:text-white transition-colors"
              title="Fullscreen Observatory View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feed Metadata Specs */}
      <div className="p-4 bg-space-950/60 border-t border-space-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div>
          <span className="text-slate-400 text-[10px] block">OBSERVATORY</span>
          <span className="text-white font-medium">Green Bank / Parkes</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">CENTRAL FREQUENCY</span>
          <span className="text-obs-cyan font-medium">1420.4057 MHz</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">SAMPLING CORRIDOR</span>
          <span className="text-obs-indigo font-medium">Breakthrough BLIMPY</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">AI ENGINE</span>
          <span className="text-obs-emerald font-medium">Lightweight ResNet (5ms)</span>
        </div>
      </div>
    </div>
  );
}
