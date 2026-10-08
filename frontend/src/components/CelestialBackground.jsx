import React, { useState, useEffect } from 'react';

export const PAGE_BACKGROUNDS = {
  landing: {
    id: 'landing',
    name: 'Mountaintop Sanctuary',
    src: '/pk/07c0f39f06bf2c16dbc4684579260b1e.webp',
    tag: '3D OBSERVATORY GATEWAY',
    opacity: 0.45,
    overlay: 'radial-gradient(ellipse at 50% 30%, rgba(3, 7, 18, 0.2) 0%, rgba(3, 7, 18, 0.7) 65%, #030712 100%)',
    scanlines: false,
  },
  dashboard: {
    id: 'dashboard',
    name: 'The Observatory Dome',
    src: '/pk/6e9b79072b1f090614dcbefb61837007.webp',
    tag: 'MISSION CONTROL OPERATIONS ROOM',
    opacity: 0.32,
    overlay: 'radial-gradient(ellipse at 50% 20%, rgba(7, 12, 24, 0.4) 0%, rgba(3, 7, 18, 0.85) 70%, #030712 100%)',
    scanlines: true,
  },
  evaluation: {
    id: 'evaluation',
    name: 'Summit Dawn Horizons',
    src: '/pk/83c40988880281aef82c1e56fd4da862.webp',
    tag: 'EMPIRICAL BENCHMARK LAB',
    opacity: 0.35,
    overlay: 'radial-gradient(ellipse at 50% 25%, rgba(15, 23, 42, 0.35) 0%, rgba(3, 7, 18, 0.85) 70%, #030712 100%)',
    scanlines: true,
  },
  methodology: {
    id: 'methodology',
    name: 'Constellation Cartography',
    src: '/pk/ac6b3f218843463d970fd50f69593830.webp',
    tag: 'ASTROMETRIC SCIENCE PROTOCOL',
    opacity: 0.35,
    overlay: 'radial-gradient(ellipse at 50% 25%, rgba(12, 19, 34, 0.3) 0%, rgba(3, 7, 18, 0.85) 70%, #030712 100%)',
    scanlines: false,
  },
};

export default function CelestialBackground({ activeTab = 'landing' }) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Mouse parallax effect for 3D depth feeling
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * -18;
      const y = (e.clientY / innerHeight - 0.5) * -14;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const currentBg = PAGE_BACKGROUNDS[activeTab] || PAGE_BACKGROUNDS.landing;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background Images for Each Distinct Page with Smooth Crossfade */}
      {Object.entries(PAGE_BACKGROUNDS).map(([tabKey, config]) => {
        const isActive = activeTab === tabKey;
        return (
          <div
            key={tabKey}
            style={{
              opacity: isActive ? config.opacity : 0,
              transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0) scale(1.06)`,
              transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s ease-out',
              backgroundImage: `url(${config.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 28%',
            }}
            className="absolute inset-0 w-full h-full will-change-transform"
          />
        );
      })}

      {/* Page-Specific Vignette and Contrast Overlay */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: currentBg.overlay,
        }}
      />

      {/* Top Navbar Dimmer */}
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, rgba(3, 7, 18, 0.85) 0%, transparent 100%)',
        }}
      />

      {/* Bottom Footer Dimmer */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(to top, rgba(3, 7, 18, 0.95) 0%, transparent 100%)',
        }}
      />

      {/* Mission Control Scanline Overlay for Dashboard and Evaluation */}
      {currentBg.scanlines && (
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(56, 189, 248, 0.08) 3px, rgba(56, 189, 248, 0.08) 4px)',
          }}
        />
      )}

      {/* Subtle Coordinate Grid Layer for Methodology and Dashboard */}
      {(activeTab === 'dashboard' || activeTab === 'methodology') && (
        <div
          className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.15) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      )}

      {/* Subtle Page Identifier Badge (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-20 hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-space-950/80 backdrop-blur-md border border-space-800 text-[10px] font-mono text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-obs-cyan animate-pulse"></span>
        <span className="font-semibold text-slate-300">{currentBg.name}</span>
        <span className="text-slate-500">|</span>
        <span className="text-obs-cyan">{currentBg.tag}</span>
      </div>
    </div>
  );
}
