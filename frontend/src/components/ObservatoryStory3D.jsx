import React, { useState, useRef } from 'react';
import { Telescope, Compass, Radio, Sparkles, ExternalLink, ShieldCheck, X, Maximize2 } from 'lucide-react';

const STORY_CARDS = [
  {
    id: 'card-1',
    image: '/pk/07c0f39f06bf2c16dbc4684579260b1e.webp',
    fallbackJpg: '/pk/07c0f39f06bf2c16dbc4684579260b1e.webp',
    title: 'The Coastal Mountaintop Sanctuary',
    subtitle: 'High-Altitude Radio & Optical Observatory',
    tag: 'STATION ALPHA',
    badgeColor: 'border-obs-cyan/50 text-obs-cyan bg-obs-cyan/10',
    description: 'Nestled between oceanic horizons and celestial auroras, the primary observatory dish listens continuously to the 1420.405 MHz neutral hydrogen line, capturing petabytes of sky integrations per week.',
    specs: {
      location: 'Mountaintop Array (Latitude 38.4° N)',
      elevation: '2,640 meters MSL',
      aperture: '100-meter Parabolic Equivalent',
      frequencyBand: 'L-Band (1.1 - 1.9 GHz)',
    },
    quote: '"Under the swirling stellar vortex, every photon and radio wave tells the story of the cosmos."'
  },
  {
    id: 'card-2',
    image: '/pk/ac6b3f218843463d970fd50f69593830.webp',
    fallbackJpg: '/pk/ac6b3f218843463d970fd50f69593830.webp',
    title: 'Constellation Cartography & Alignment',
    subtitle: 'Astrometric Pointing & Target Verification',
    tag: 'STELLAR CADENCE',
    badgeColor: 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10',
    description: 'Targeting exoplanet hosts across Orion, Canis Major, and nearby M-dwarf systems. Precision steering isolates localized celestial points from terrestrial radio frequency interference (RFI).',
    specs: {
      targetCatalog: 'Breakthrough Listen Star Catalog',
      constellations: 'Orion, Taurus, Canis Major',
      pointingPrecision: '< 2.4 arcseconds',
      cadenceCycle: 'ABACAD Spatial Beam Swap',
    },
    quote: '"Mapping the ancient star patterns to pinpoint where modern anomalous radio pulses emerge."'
  },
  {
    id: 'card-3',
    image: '/pk/6e9b79072b1f090614dcbefb61837007.webp',
    fallbackJpg: '/pk/6e9b79072b1f090614dcbefb61837007.webp',
    title: 'The Dome of Deep Space Transients',
    subtitle: 'Real-Time Spatial ON/OFF Verification',
    tag: 'SPATIAL CADENCE',
    badgeColor: 'border-obs-emerald/50 text-emerald-400 bg-emerald-500/10',
    description: 'Inside the copper-roofed dome, observations alternate between on-target pointing and calibrator off-target pointing. Signals appearing in both beams are immediately discarded as local RFI.',
    specs: {
      samplingRate: '18.25-second Time Integrations',
      channelResolution: '2.79 Hz / bin',
      rfiRejection: '> 99.4% Terrestrial Suppression',
      interferometer: 'Dual-Polarization Feeds',
    },
    quote: '"The greatest enemy of SETI is not the silence of space, but the chatter of human satellites."'
  },
  {
    id: 'card-4',
    image: '/pk/83c40988880281aef82c1e56fd4da862.webp',
    fallbackJpg: '/pk/83c40988880281aef82c1e56fd4da862.webp',
    title: 'Summit Horizons: The Dawn of Discovery',
    subtitle: 'Dual-Layer Machine Learning Triage',
    tag: 'AI ANOMALY CORE',
    badgeColor: 'border-amber-500/50 text-amber-400 bg-amber-500/10',
    description: 'Astronomers greet the celestial dawn as the dual-path AI pipeline processes millions of spectrogram windows in under 5 milliseconds, calculating non-Gaussian kurtosis and latent embeddings.',
    specs: {
      visionModel: 'LightweightSpectrogramResNet (PyTorch)',
      densityEstimator: 'Isolation Forest (64 Latent Dims)',
      inferenceTime: '< 4.2 ms on standard CPU',
      candidateScore: 'Multi-criteria 0 - 100 ranking',
    },
    quote: '"Standing on the edge of the sky, where human intuition pairs with automated deep learning."'
  },
  {
    id: 'card-5',
    image: '/pk/4b199cfe04ea9774230c8bf2f21f1a14.webp',
    fallbackJpg: '/pk/4b199cfe04ea9774230c8bf2f21f1a14.jpg',
    title: 'The Wonder of Discovery',
    subtitle: 'Gemma 4 Explainable Scientific Reasoning',
    tag: 'EXPLAINABLE AI',
    badgeColor: 'border-rose-500/50 text-rose-400 bg-rose-500/10',
    description: 'A candidate with measurable Doppler drift and zero off-target leakage is flagged. Open-weight Gemma 4 translates complex tensor mathematics into clear, ethical rationales for human telescope crews.',
    specs: {
      reasoningEngine: 'Gemma 4 Open-Weight Aligned Prompts',
      ethicalMandate: 'Zero extraterrestrial hallucination',
      outputFormat: 'Structured Astronomical Follow-up Brief',
      validation: 'Empirically tested against held-out bench',
    },
    quote: '"A genuine anomaly is not an answer, but an urgent invitation for deeper scientific inquiry."'
  }
];

function Card3D({ card, onInspect }) {
  const cardRef = useRef(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // tilt degrees
    const rotateY = ((x - centerX) / centerX) * 12;

    setRotX(rotateX);
    setRotY(rotateY);
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
  };

  return (
    <div
      style={{ perspective: '1000px' }}
      className="w-full flex justify-center py-2"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onInspect(card)}
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${isHovered ? 1.03 : 1}, ${isHovered ? 1.03 : 1}, 1)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        }}
        className="relative group cursor-pointer w-full max-w-sm rounded-2xl bg-space-900 border border-space-700/80 hover:border-obs-cyan/60 p-4 shadow-xl hover:shadow-2xl hover:shadow-obs-cyan/20 overflow-hidden transform-gpu"
      >
        {/* Dynamic Glare Reflection */}
        {isHovered && (
          <div
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)`,
            }}
            className="absolute inset-0 pointer-events-none z-20 rounded-2xl"
          />
        )}

        {/* Artwork Image Container */}
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-4 bg-space-950 border border-space-800">
          <img
            src={card.image}
            alt={card.title}
            onError={(e) => {
              if (card.fallbackJpg && e.target.src !== card.fallbackJpg) {
                e.target.src = card.fallbackJpg;
              }
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-space-950/80 via-transparent to-black/20" />

          {/* Tag Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md ${card.badgeColor}`}>
              {card.tag}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 z-10">
            <div className="p-1.5 rounded-lg bg-space-950/80 text-obs-cyan border border-obs-cyan/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 font-mono">
          <h4 className="text-base font-bold text-white group-hover:text-obs-cyan transition-colors">
            {card.title}
          </h4>
          <p className="text-xs text-obs-indigo font-medium">
            {card.subtitle}
          </p>
          <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        </div>

        {/* Footer specs pill */}
        <div className="mt-4 pt-3 border-t border-space-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="text-slate-400">INSPECT LOG</span>
          <span className="text-obs-cyan flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Explore 3D</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ObservatoryStory3D() {
  const [activeModalCard, setActiveModalCard] = useState(null);

  return (
    <section className="py-12 space-y-8">
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-obs-cyan/10 border border-obs-cyan/30 text-obs-cyan text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OBSERVATORY CHRONICLES & ASTRONOMICAL SUITE</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-wide">
          The Journey of Cosmic Candidate Discovery
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed font-sans">
          From high-altitude coastal telescopes to deep-space constellation cartography and dual-layer AI triage. Explore the authentic stages of radio astronomy candidate triage.
        </p>
      </div>

      {/* 3D Interactive Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {STORY_CARDS.map((card) => (
          <Card3D
            key={card.id}
            card={card}
            onInspect={(c) => setActiveModalCard(c)}
          />
        ))}
      </div>

      {/* 3D Inspection Modal */}
      {activeModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-space-900 border border-space-700 rounded-2xl overflow-hidden shadow-2xl font-mono text-slate-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-space-950">
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${activeModalCard.badgeColor}`}>
                  {activeModalCard.tag}
                </span>
                <h3 className="text-lg font-bold text-white">{activeModalCard.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalCard(null)}
                className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
              {/* Artwork View */}
              <div className="space-y-4">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-space-750 shadow-inner bg-space-950">
                  <img
                    src={activeModalCard.image}
                    alt={activeModalCard.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-950/70 via-transparent to-transparent pointer-events-none" />
                </div>
                <blockquote className="p-3.5 rounded-xl bg-space-950 border border-space-800 text-xs italic text-obs-cyan leading-relaxed">
                  {activeModalCard.quote}
                </blockquote>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                    Observation Brief
                  </h4>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {activeModalCard.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-space-800">
                  <h4 className="text-xs uppercase text-obs-cyan font-bold tracking-wider">
                    Observatory Telemetry Specs
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {Object.entries(activeModalCard.specs).map(([key, value]) => (
                      <div key={key} className="p-2.5 rounded-lg bg-space-950/70 border border-space-800/80 flex items-center justify-between">
                        <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs space-y-1">
                  <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Scientific Rigor & Attribution</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans">
                    All candidates undergo rigorous cross-beam verification before human escalation. This protocol protects telescope time from terrestrial false alarms.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-space-800 bg-space-950 flex justify-end">
              <button
                onClick={() => setActiveModalCard(null)}
                className="px-4 py-2 rounded-lg bg-obs-cyan hover:bg-obs-cyan/90 text-space-950 font-bold text-xs transition-colors"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
