import React, { useRef, useEffect, useState } from 'react';
import { Eye, Palette, ZoomIn, Info } from 'lucide-react';

// Astronomical Colormaps
const COLORMAPS = {
  viridis: [
    [68, 1, 84], [72, 35, 116], [64, 67, 135], [52, 94, 141],
    [41, 120, 142], [32, 144, 140], [34, 167, 132], [68, 190, 112],
    [121, 209, 81], [189, 222, 38], [253, 231, 37]
  ],
  plasma: [
    [13, 8, 135], [75, 3, 161], [126, 3, 168], [168, 34, 150],
    [203, 70, 121], [229, 107, 93], [248, 148, 65], [253, 195, 40],
    [240, 249, 33]
  ],
  cosmic: [
    [3, 7, 18], [15, 23, 42], [30, 58, 138], [37, 99, 235],
    [56, 189, 248], [125, 211, 252], [224, 242, 254], [255, 255, 255]
  ]
};

function interpolateColor(t, colormapKey = 'viridis') {
  const map = COLORMAPS[colormapKey] || COLORMAPS.viridis;
  const scaled = Math.max(0, Math.min(1, t)) * (map.length - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  if (idx >= map.length - 1) return map[map.length - 1];
  const c1 = map[idx];
  const c2 = map[idx + 1];
  return [
    Math.round(c1[0] + frac * (c2[0] - c1[0])),
    Math.round(c1[1] + frac * (c2[1] - c1[1])),
    Math.round(c1[2] + frac * (c2[2] - c1[2]))
  ];
}

export default function WaterfallViewer({ heatmapData, title = "Spectrogram Waterfall" }) {
  const canvasRef = useRef(null);
  const [colormap, setColormap] = useState('viridis');
  const [hoverInfo, setHoverInfo] = useState(null);

  const z = heatmapData?.z || [];
  const xFreq = heatmapData?.x_freq_mhz || [];
  const yTime = heatmapData?.y_time_sec || [];
  const nTime = z.length;
  const nFreq = nTime > 0 ? z[0].length : 0;

  useEffect(() => {
    if (!canvasRef.current || nTime === 0 || nFreq === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = nFreq;
    canvas.height = nTime;
    const imgData = ctx.createImageData(nFreq, nTime);

    for (let t = 0; t < nTime; t++) {
      for (let f = 0; f < nFreq; f++) {
        const val = z[t][f];
        const [r, g, b] = interpolateColor(val, colormap);
        const pixelIdx = (t * nFreq + f) * 4;
        imgData.data[pixelIdx] = r;
        imgData.data[pixelIdx + 1] = g;
        imgData.data[pixelIdx + 2] = b;
        imgData.data[pixelIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [z, nTime, nFreq, colormap]);

  const handleMouseMove = (e) => {
    if (!canvasRef.current || nTime === 0 || nFreq === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const fIdx = Math.floor((x / rect.width) * nFreq);
    const tIdx = Math.floor((y / rect.height) * nTime);

    if (fIdx >= 0 && fIdx < nFreq && tIdx >= 0 && tIdx < nTime) {
      const freqVal = xFreq[fIdx] || (1420.0 + fIdx * 0.0028).toFixed(4);
      const timeVal = yTime[tIdx] || (tIdx * 18.25).toFixed(1);
      const powerVal = z[tIdx][fIdx] ? (z[tIdx][fIdx] * 100).toFixed(1) : 0;
      setHoverInfo({ freqVal, timeVal, powerVal, x, y });
    }
  };

  const handleMouseLeave = () => setHoverInfo(null);

  const freqStart = xFreq[0] || 1420.0;
  const freqEnd = xFreq[xFreq.length - 1] || 1420.714;
  const timeEnd = yTime[yTime.length - 1] || (nTime * 18.25).toFixed(0);

  return (
    <div className="bg-space-900/90 rounded-xl p-4 border border-space-800 relative">
      {/* Viewer Header */}
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Eye className="h-4 w-4 text-obs-cyan" />
          <span className="font-bold text-white tracking-wider uppercase">{title}</span>
          <span className="text-slate-400">({nFreq} channels x {nTime} integrations)</span>
        </div>

        {/* Colormap Selector */}
        <div className="flex items-center space-x-2">
          <Palette className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-400">COLORMAP:</span>
          {['viridis', 'plasma', 'cosmic'].map((cm) => (
            <button
              key={cm}
              onClick={() => setColormap(cm)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                colormap === cm
                  ? 'bg-obs-cyan text-space-950'
                  : 'bg-space-800 border border-space-700 text-slate-400 hover:text-white'
              }`}
            >
              {cm}
            </button>
          ))}
        </div>
      </div>

      {/* Spectrogram Canvas with Axes */}
      <div className="relative border border-space-700 rounded-lg overflow-hidden bg-black">
        {/* Top Frequency Labels */}
        <div className="bg-space-950/80 px-3 py-1 flex justify-between text-[10px] font-mono text-obs-cyan border-b border-space-800">
          <span>f_start: {freqStart} MHz</span>
          <span className="text-slate-400">FREQUENCY AXIS (Topocentric Frame)</span>
          <span>f_stop: {freqEnd} MHz</span>
        </div>

        {/* Canvas Body with Time Axis on Left */}
        <div className="relative flex">
          {/* Time axis ticks */}
          <div className="w-12 bg-space-950/90 border-r border-space-800 py-1 flex flex-col justify-between text-[9px] font-mono text-slate-400 text-right pr-1.5 select-none">
            <span>0.0s</span>
            <span>{(timeEnd * 0.25).toFixed(0)}s</span>
            <span>{(timeEnd * 0.5).toFixed(0)}s</span>
            <span>{(timeEnd * 0.75).toFixed(0)}s</span>
            <span>{timeEnd}s</span>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-64 object-fill block"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Hover Crosshair Info Box */}
            {hoverInfo && (
              <div
                className="absolute pointer-events-none bg-space-950/95 border border-obs-cyan/60 rounded px-2.5 py-1 text-[11px] font-mono text-white shadow-xl z-20"
                style={{
                  left: Math.min(hoverInfo.x + 12, 280),
                  top: Math.max(hoverInfo.y - 45, 10),
                }}
              >
                <div className="text-obs-cyan font-bold">{hoverInfo.freqVal} MHz</div>
                <div className="text-slate-300">Time: {hoverInfo.timeVal}s | Norm Power: {hoverInfo.powerVal}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="bg-space-950/80 px-3 py-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-space-800">
          <span>Time: 0 → {timeEnd}s</span>
          <div className="flex items-center space-x-1.5">
            <span>LOW POWER</span>
            <div className="w-20 h-2 rounded bg-gradient-to-r from-purple-900 via-teal-500 to-yellow-300"></div>
            <span>HIGH SNR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
