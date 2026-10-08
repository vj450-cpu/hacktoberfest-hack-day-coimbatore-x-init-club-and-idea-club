import React, { useRef, useEffect, useState } from 'react';
import { Eye, RotateCcw, Compass, Sparkles } from 'lucide-react';

export default function Celestial3DCanvas({ onExploreTarget }) {
  const canvasRef = useRef(null);
  const [warpMode, setWarpMode] = useState(false);
  const [activeConstellation, setActiveConstellation] = useState(null);
  const [showWireframe, setShowWireframe] = useState(true);

  // Targets / Constellations for interactive clicking
  const TARGETS = [
    { name: 'Ross 128 (Target A)', ra: '11h 47m', dec: '+00° 48\'', type: 'Narrowband Drift Candidate', score: 94, x: -140, y: -60, z: 320 },
    { name: 'Proxima Centauri', ra: '14h 29m', dec: '-62° 40\'', type: 'Persistent Carrier Candidate', score: 82, x: 180, y: 70, z: 280 },
    { name: 'FRB 121102 (Burst)', ra: '05h 31m', dec: '+33° 08\'', type: 'Broadband Dispersed Transient', score: 64, x: -80, y: 130, z: 350 },
    { name: 'Orion Nebula Survey', ra: '05h 35m', dec: '-05° 23\'', type: 'Breakthrough Listen Cadence', score: 88, x: 120, y: -110, z: 400 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || 560);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 560;
    };
    window.addEventListener('resize', handleResize);

    // Camera and interaction state
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.15;
    let targetRotY = 0.2;
    let rotX = 0.15;
    let rotY = 0.2;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Generate stars
    const STAR_COUNT = 350;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 1500 + 100,
      size: Math.random() * 1.8 + 0.6,
      color: Math.random() > 0.85 ? '#38bdf8' : Math.random() > 0.7 ? '#818cf8' : Math.random() > 0.5 ? '#f59e0b' : '#ffffff',
      twinkleSpeed: Math.random() * 0.04 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    // Generate 3D Radio Telescope Dish Wireframe Vertices
    const dishVertices = [];
    const dishEdges = [];
    const RINGS = 5;
    const SEGMENTS = 16;
    const dishRadius = 130;
    const dishDepth = 45;

    // Center focal feed vertex
    const feedIdx = 0;
    dishVertices.push({ x: 0, y: -dishDepth - 60, z: 0 });

    // Feed support struts base vertices
    const strutIndices = [];

    // Rings
    for (let r = 1; r <= RINGS; r++) {
      const radius = (dishRadius * r) / RINGS;
      const y = -dishDepth * Math.pow(r / RINGS, 2);
      for (let s = 0; s < SEGMENTS; s++) {
        const theta = (s / SEGMENTS) * Math.PI * 2;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        dishVertices.push({ x, y, z });
        const curIdx = dishVertices.length - 1;

        if (r === RINGS && (s % 4 === 0)) {
          strutIndices.push(curIdx);
        }

        // Connect ring loop
        if (s > 0) {
          dishEdges.push([curIdx - 1, curIdx]);
        }
        if (s === SEGMENTS - 1) {
          dishEdges.push([curIdx, curIdx - (SEGMENTS - 1)]);
        }

        // Connect radial to previous ring
        if (r > 1) {
          const prevRingIdx = curIdx - SEGMENTS;
          dishEdges.push([prevRingIdx, curIdx]);
        }
      }
    }

    // Connect feed struts
    strutIndices.forEach((sIdx) => {
      dishEdges.push([feedIdx, sIdx]);
    });

    // Pedestal base
    const baseIdx = dishVertices.length;
    dishVertices.push({ x: 0, y: 50, z: 0 });
    dishVertices.push({ x: -40, y: 80, z: -40 });
    dishVertices.push({ x: 40, y: 80, z: -40 });
    dishVertices.push({ x: 40, y: 80, z: 40 });
    dishVertices.push({ x: -40, y: 80, z: 40 });
    dishEdges.push([baseIdx, baseIdx + 1], [baseIdx, baseIdx + 2], [baseIdx, baseIdx + 3], [baseIdx, baseIdx + 4]);
    dishEdges.push([baseIdx + 1, baseIdx + 2], [baseIdx + 2, baseIdx + 3], [baseIdx + 3, baseIdx + 4], [baseIdx + 4, baseIdx + 1]);

    // Mouse events
    const handleMouseDown = (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;

      if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch events for mobile
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastMouseX;
        const dy = e.touches[0].clientY - lastMouseY;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    };
    const handleTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // 3D Projection Helper
    const fov = 450;
    const project = (x, y, z, cx, cy) => {
      const scale = fov / (fov + z);
      return {
        x: cx + x * scale,
        y: cy + y * scale,
        scale,
        visible: z > -fov + 10,
      };
    };

    // 3D Rotation Helper
    const rotate3D = (p, rx, ry) => {
      // Rotate around Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;

      // Rotate around X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      return { x: x1, y: y2, z: z2 };
    };

    let time = 0;

    // Render loop
    const render = () => {
      time += 0.016;

      // Smooth camera interpolation
      if (!isDragging) {
        targetRotY += 0.003; // Gentle auto-rotation
      }
      rotX += (targetRotX + mouseY * 0.2 - rotX) * 0.05;
      rotY += (targetRotY + mouseX * 0.2 - rotY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Deep space atmospheric radial gradient allowing background artwork to shine through
      const gradient = ctx.createRadialGradient(cx, cy, 30, cx, cy, width * 0.7);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
      gradient.addColorStop(0.5, 'rgba(7, 12, 24, 0.70)');
      gradient.addColorStop(1, 'rgba(3, 7, 18, 0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle celestial nebula glow
      const nebula1 = ctx.createRadialGradient(cx - 200, cy - 80, 20, cx - 200, cy - 80, 320);
      nebula1.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      nebula1.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)');
      nebula1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(cx + 240, cy + 100, 30, cx + 240, cy + 100, 280);
      nebula2.addColorStop(0, 'rgba(244, 63, 94, 0.08)');
      nebula2.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
      nebula2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // 1. Render Stars
      const starSpeed = warpMode ? 8.0 : 0.8;
      stars.forEach((star) => {
        star.z -= starSpeed;
        if (star.z < 1) {
          star.z = 1500;
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
        }

        const rotated = rotate3D({ x: star.x, y: star.y, z: star.z }, rotX * 0.3, rotY * 0.3);
        const p = project(rotated.x, rotated.y, rotated.z, cx, cy);

        if (p.visible && p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height) {
          const alpha = Math.min(1, Math.max(0.2, (1 - star.z / 1500) * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed * 10 + star.phase))));
          ctx.beginPath();
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha;
          const sz = star.size * p.scale * 1.5;
          ctx.arc(p.x, p.y, Math.max(0.6, sz), 0, Math.PI * 2);
          ctx.fill();

          // Subtle star flare on closer stars
          if (sz > 2.2) {
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha * 0.25;
            ctx.beginPath();
            ctx.arc(p.x, p.y, sz * 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      ctx.globalAlpha = 1.0;

      // 2. Render 3D Celestial Targets / Constellation Nodes
      const projectedTargets = [];
      TARGETS.forEach((target, index) => {
        const rot = rotate3D({ x: target.x, y: target.y, z: target.z }, rotX * 0.6, rotY * 0.6);
        const p = project(rot.x, rot.y, rot.z, cx, cy);
        if (p.visible) {
          projectedTargets.push({ ...target, px: p.x, py: p.y, pScale: p.scale, index });
        }
      });

      // Draw constellation guide lines between targets
      if (projectedTargets.length >= 2) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        for (let i = 0; i < projectedTargets.length - 1; i++) {
          ctx.moveTo(projectedTargets[i].px, projectedTargets[i].py);
          ctx.lineTo(projectedTargets[i + 1].px, projectedTargets[i + 1].py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw target nodes
      projectedTargets.forEach((t) => {
        const isHovered = activeConstellation?.name === t.name;

        // Glowing node ring
        ctx.beginPath();
        ctx.arc(t.px, t.py, isHovered ? 14 : 9, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Pulsing core
        ctx.beginPath();
        const pulse = Math.sin(time * 3 + t.index) * 2;
        ctx.arc(t.px, t.py, Math.max(3, 4 + pulse), 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#38bdf8' : '#22d3ee';
        ctx.fill();

        // Target label tag
        ctx.font = '11px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = isHovered ? '#ffffff' : '#94a3b8';
        ctx.fillText(t.name, t.px + 14, t.py - 6);

        ctx.font = '9px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`SCORE: ${t.score} | ${t.ra}`, t.px + 14, t.py + 7);
      });

      // 3. Render 3D Radio Telescope Wireframe Dish
      if (showWireframe) {
        const dishCenterZ = 300;
        const rotatedDish = dishVertices.map((v) => {
          const r = rotate3D(v, rotX, rotY);
          return project(r.x, r.y, r.z + dishCenterZ, cx, cy + 30);
        });

        // Glowing dish emission rings (radio signal waves)
        const waveRadius = ((time * 40) % 180) + 20;
        const waveAlpha = Math.max(0, 1 - waveRadius / 200) * 0.45;
        const feedPt = rotatedDish[0];
        if (feedPt && feedPt.visible) {
          ctx.beginPath();
          ctx.arc(feedPt.x, feedPt.y, waveRadius * feedPt.scale, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${waveAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Second secondary wave
          const waveRadius2 = (((time * 40) + 90) % 180) + 20;
          const waveAlpha2 = Math.max(0, 1 - waveRadius2 / 200) * 0.35;
          ctx.beginPath();
          ctx.arc(feedPt.x, feedPt.y, waveRadius2 * feedPt.scale, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(129, 140, 248, ${waveAlpha2})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Draw wireframe edges
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1;

        dishEdges.forEach(([i, j]) => {
          const p1 = rotatedDish[i];
          const p2 = rotatedDish[j];
          if (p1 && p2 && p1.visible && p2.visible) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        });
        ctx.stroke();

        // Focal feed highlighted node
        if (feedPt && feedPt.visible) {
          ctx.beginPath();
          ctx.arc(feedPt.x, feedPt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // HUD crosshairs & Observatory reticle
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      // Cross center
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy);
      ctx.lineTo(cx + 30, cy);
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx, cy + 30);
      ctx.stroke();

      // Outer target ring
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.setLineDash([2, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [warpMode, activeConstellation, showWireframe]);

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-2xl overflow-hidden border border-space-700/80 bg-space-950/60 backdrop-blur-md shadow-2xl shadow-obs-cyan/5 select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating HUD Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-space-900/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-space-700/70 text-xs font-mono space-y-1 shadow-lg">
          <div className="flex items-center space-x-2 text-obs-cyan">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '12s' }} />
            <span className="font-semibold tracking-wide">3D CELESTIAL SKY DOME</span>
          </div>
          <p className="text-slate-400 text-[11px]">GBT / PARKES PRIMARY INTERFEROMETER</p>
          <div className="flex items-center space-x-3 text-[10px] text-slate-500 pt-0.5">
            <span>AZ: 184.22°</span>
            <span>ALT: 48.60°</span>
            <span className="text-obs-emerald">LOCKED</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Pill */}
      <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 flex flex-wrap items-center justify-between md:justify-end gap-2 bg-space-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-space-700/70 text-xs font-mono shadow-xl">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors border ${
              showWireframe
                ? 'bg-obs-cyan/20 text-obs-cyan border-obs-cyan/40'
                : 'bg-space-800 text-slate-400 border-space-700 hover:text-white'
            }`}
          >
            {showWireframe ? '3D Telescope ON' : '3D Telescope OFF'}
          </button>

          <button
            onClick={() => setWarpMode(!warpMode)}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors flex items-center space-x-1 border ${
              warpMode
                ? 'bg-obs-indigo/30 text-indigo-300 border-indigo-500/50'
                : 'bg-space-800 text-slate-400 border-space-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{warpMode ? 'Star Warp ON' : 'Warp Speed'}</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center text-slate-400 text-[11px] space-x-2">
          <Eye className="w-3.5 h-3.5 text-obs-cyan" />
          <span>Click & Drag to Orbit 3D Sky</span>
        </div>
      </div>

      {/* Target Quick Buttons */}
      <div className="absolute top-4 right-4 hidden lg:flex flex-col space-y-1.5 font-mono text-[11px]">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 px-1 font-semibold">Triage Coordinates</span>
        {TARGETS.map((t) => (
          <button
            key={t.name}
            onClick={() => {
              setActiveConstellation(t);
              if (onExploreTarget) onExploreTarget(t);
            }}
            onMouseEnter={() => setActiveConstellation(t)}
            className="px-2.5 py-1 bg-space-900/80 hover:bg-obs-cyan/20 border border-space-700/80 hover:border-obs-cyan/50 rounded text-slate-300 hover:text-obs-cyan transition-all text-left flex items-center justify-between space-x-3 backdrop-blur-md"
          >
            <span>{t.name}</span>
            <span className="text-obs-amber text-[10px]">Score {t.score}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
