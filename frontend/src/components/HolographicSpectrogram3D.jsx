import React, { useRef, useEffect, useState } from 'react';
import { Layers, RotateCcw, Activity, Zap, Radio, Sliders } from 'lucide-react';

const SIGNAL_PRESETS = [
  {
    id: 'drift',
    name: 'Drifting Narrowband (Candidate CW-00427)',
    type: 'DRIFTING_NARROWBAND',
    description: 'Measurable Doppler frequency drift (-0.024 Hz/s) persisting across time integrations.',
    color: '#38bdf8',
    generate: (cols, rows) => {
      const data = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        const driftCenter = 15 + r * 1.8;
        for (let c = 0; c < cols; c++) {
          const dist = Math.abs(c - driftCenter);
          let val = 0.08 + Math.random() * 0.1;
          if (dist < 2.5) {
            val = Math.max(val, 0.95 - dist * 0.28);
          }
          row.push(val);
        }
        data.push(row);
      }
      return data;
    }
  },
  {
    id: 'burst',
    name: 'Broadband Dispersed Burst (FRB 121102)',
    type: 'BROADBAND_BURST',
    description: 'Transient high-intensity pulse arriving across multiple frequency channels at t = 7.',
    color: '#a855f7',
    generate: (cols, rows) => {
      const data = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          let val = 0.08 + Math.random() * 0.1;
          if (r === 7 && c >= 10 && c <= 45) {
            val = 0.92;
          }
          row.push(val);
        }
        data.push(row);
      }
      return data;
    }
  },
  {
    id: 'rfi',
    name: 'Terrestrial Multi-Channel RFI',
    type: 'TERRESTRIAL_RFI',
    description: 'Stationary vertical combs with strong harmonics present across multiple channels.',
    color: '#f59e0b',
    generate: (cols, rows) => {
      const data = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          let val = 0.08 + Math.random() * 0.1;
          if (c % 12 === 0) {
            val = 0.88;
          }
          row.push(val);
        }
        data.push(row);
      }
      return data;
    }
  },
  {
    id: 'noise',
    name: 'Nominal Thermal Receiver Noise',
    type: 'NORMAL_NOISE',
    description: 'Gaussian thermal fluctuations with zero coherent narrowband power spikes.',
    color: '#64748b',
    generate: (cols, rows) => {
      const data = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          row.push(0.08 + Math.random() * 0.16);
        }
        data.push(row);
      }
      return data;
    }
  }
];

export default function HolographicSpectrogram3D() {
  const canvasRef = useRef(null);
  const [selectedPresetId, setSelectedPresetId] = useState('drift');
  const [wireframeStyle, setWireframeStyle] = useState('mesh'); // 'mesh' | 'points' | 'solid'
  const [elevationScale, setElevationScale] = useState(70);

  const activePreset = SIGNAL_PRESETS.find((p) => p.id === selectedPresetId) || SIGNAL_PRESETS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 420);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 420;
    };
    window.addEventListener('resize', handleResize);

    // 3D Grid dimensions
    const COLS = 48; // Frequency bins
    const ROWS = 20; // Time steps
    const gridData = activePreset.generate(COLS, ROWS);

    let rotX = 0.75;
    let rotY = -0.55;
    let targetRotX = 0.75;
    let targetRotY = -0.55;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      targetRotY += dx * 0.008;
      targetRotX += dy * 0.008;
      // Clamp pitch
      targetRotX = Math.max(0.1, Math.min(1.4, targetRotX));
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch support
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastX;
      const dy = e.touches[0].clientY - lastY;
      targetRotY += dx * 0.008;
      targetRotX += dy * 0.008;
      targetRotX = Math.max(0.1, Math.min(1.4, targetRotX));
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    };
    const handleTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Projection math
    const fov = 400;
    const project = (x, y, z, cx, cy) => {
      const scale = fov / (fov + z + 250);
      return {
        x: cx + x * scale,
        y: cy + y * scale,
        scale,
      };
    };

    const rotate = (x, y, z, rx, ry) => {
      // Rotate Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      return { x: x1, y: y2, z: z2 };
    };

    let time = 0;

    const render = () => {
      time += 0.015;
      if (!isDragging) {
        // Slow gentle idle drift
        targetRotY += 0.001;
      }
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;

      // Dark observatory background
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, width, height);

      // Perspective grid spacing
      const spacingX = 11;
      const spacingZ = 16;
      const offsetX = (COLS * spacingX) / 2;
      const offsetZ = (ROWS * spacingZ) / 2;

      // Compute 3D points
      const points = [];
      for (let r = 0; r < ROWS; r++) {
        const rowPts = [];
        for (let c = 0; c < COLS; c++) {
          const val = gridData[r][c];
          const rawX = c * spacingX - offsetX;
          const rawY = -val * elevationScale; // Elevation
          const rawZ = r * spacingZ - offsetZ;

          const rot = rotate(rawX, rawY, rawZ, rotX, rotY);
          const prj = project(rot.x, rot.y, rot.z, cx, cy);

          rowPts.push({ ...prj, val, zDepth: rot.z });
        }
        points.push(rowPts);
      }

      // Draw 3D surface lines along frequency axis (columns) and time axis (rows)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const p = points[r][c];

          // Connect to next column
          if (c < COLS - 1) {
            const nextP = points[r][c + 1];
            const avgVal = (p.val + nextP.val) / 2;
            const hue = 220 - avgVal * 190; // Blue to Cyan to Amber/Red
            ctx.beginPath();
            ctx.strokeStyle = `hsl(${hue}, 85%, ${avgVal * 50 + 25}%)`;
            ctx.lineWidth = avgVal > 0.4 ? 1.5 : 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(nextP.x, nextP.y);
            ctx.stroke();
          }

          // Connect to next row (time integration)
          if (r < ROWS - 1) {
            const nextRowP = points[r + 1][c];
            const avgVal = (p.val + nextRowP.val) / 2;
            const hue = 220 - avgVal * 190;
            ctx.beginPath();
            ctx.strokeStyle = `hsl(${hue}, 85%, ${avgVal * 50 + 20}%)`;
            ctx.lineWidth = avgVal > 0.4 ? 1.2 : 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(nextRowP.x, nextRowP.y);
            ctx.stroke();
          }

          // Vertex highlight on high power nodes
          if (p.val > 0.5) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.val * 3, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
          }
        }
      }

      // Bounding box base grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      const b1 = project(...Object.values(rotate(-offsetX, 0, -offsetZ, rotX, rotY)), cx, cy);
      const b2 = project(...Object.values(rotate(offsetX, 0, -offsetZ, rotX, rotY)), cx, cy);
      const b3 = project(...Object.values(rotate(offsetX, 0, offsetZ, rotX, rotY)), cx, cy);
      const b4 = project(...Object.values(rotate(-offsetX, 0, offsetZ, rotX, rotY)), cx, cy);

      ctx.beginPath();
      ctx.moveTo(b1.x, b1.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(b3.x, b3.y);
      ctx.lineTo(b4.x, b4.y);
      ctx.closePath();
      ctx.stroke();

      // Axis labels
      ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('FREQ AXIS (MHz) →', b2.x + 5, b2.y);
      ctx.fillStyle = '#818cf8';
      ctx.fillText('TIME (s) ↓', b4.x - 50, b4.y + 12);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activePreset, elevationScale]);

  return (
    <div className="w-full rounded-2xl border border-space-700/80 bg-space-900/90 backdrop-blur-xl overflow-hidden shadow-2xl font-mono">
      {/* Control Header */}
      <div className="p-4 border-b border-space-800 bg-space-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-obs-cyan/20 text-obs-cyan border border-obs-cyan/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">3D HOLOGRAPHIC SPECTROGRAM TOPOGRAPHY</h3>
            <p className="text-[11px] text-slate-400">Drag canvas to rotate 3D waterfall elevation matrix</p>
          </div>
        </div>

        {/* Signal Archetype Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SIGNAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPresetId(preset.id)}
              className={`px-3 py-1 rounded text-xs transition-colors border ${
                selectedPresetId === preset.id
                  ? 'bg-obs-cyan/20 text-obs-cyan border-obs-cyan/50 font-bold'
                  : 'bg-space-800 text-slate-400 border-space-700 hover:text-white'
              }`}
            >
              {preset.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative aspect-[16/7] w-full bg-space-950 overflow-hidden cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Elevation height slider */}
        <div className="absolute bottom-3 left-4 flex items-center space-x-2 bg-space-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-space-700 text-xs text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-obs-cyan" />
          <span className="text-[11px]">3D Elevation:</span>
          <input
            type="range"
            min="20"
            max="120"
            value={elevationScale}
            onChange={(e) => setElevationScale(Number(e.target.value))}
            className="w-20 accent-obs-cyan cursor-pointer"
          />
        </div>

        <div className="absolute top-3 right-4 bg-space-950/80 backdrop-blur-md px-3 py-1 rounded border border-space-700 text-[11px] text-slate-400">
          <span>Signal Archetype: <strong className="text-white">{activePreset.type}</strong></span>
        </div>
      </div>

      {/* Description footer */}
      <div className="p-3.5 bg-space-950/80 border-t border-space-800 text-xs text-slate-300 flex items-center justify-between">
        <p className="text-[11px] text-slate-300 flex items-center space-x-1.5">
          <Radio className="w-3.5 h-3.5 text-obs-cyan" />
          <span>{activePreset.description}</span>
        </p>
        <span className="text-[10px] text-slate-500 hidden sm:inline">3D Isometric Matrix | 48 Bins × 20 Integrations</span>
      </div>
    </div>
  );
}
