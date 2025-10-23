"use client";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const hubs = [
  { label: 'Geneva', detail: 'Swiss trading headquarters', narrative: 'Trading, risk, and treasury oversight for Europe & Africa.' },
  { label: 'Dubai', detail: 'Middle East operations', narrative: 'Integrated maritime and crude flows across the Middle East & India.' },
  { label: 'Singapore', detail: 'Asia Pacific hub', narrative: 'Asia refined products, LNG, and strategic storage coordination.' },
];

const networkMetrics = [
  { label: 'Active Vessels Chartered', value: '45+', tone: 'text-cyan-200' },
  { label: 'Storage Capacity', value: '6.2M m³', tone: 'text-white' },
  { label: 'Daily Transactions', value: '1,200+', tone: 'text-cyan-100' },
];

interface GlobeOverlayProps {
  progress: number | null;
  opacity: number;
  isVisible: boolean;
}

export default function GlobeOverlay({ progress, opacity, isVisible }: GlobeOverlayProps) {
  if (progress === null) return null;

  const fadeIn = clamp(progress * 2.4);
  const focusPoints = [0.167, 0.5, 0.833];
  const focusWeights = focusPoints.map((point) => clamp(1 - Math.abs(progress - point) / 0.22));
  const highlightIndex = focusWeights.indexOf(Math.max(...focusWeights));
  const ribbonOpacity = clamp((progress - 0.25) * 2.1);
  const metricsOpacity = clamp((progress - 0.42) * 2.4);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      style={{
        visibility: isVisible ? 'visible' : 'hidden',
        opacity,
        transition: 'opacity 0.35s ease',
        background: 'radial-gradient(circle at 50% 20%, rgba(18,40,81,0.85) 0%, rgba(4,8,20,0.92) 60%, rgba(3,10,24,0.97) 100%)',
      }}
    >
      <div
        className="text-center text-white px-6 md:px-12 max-w-5xl"
        style={{
          opacity: fadeIn,
          transform: `translateY(${(1 - fadeIn) * 60}px)`
            + ` scale(${0.98 + fadeIn * 0.02})`,
          transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}
      >
        <p className="text-xs tracking-[0.45em] uppercase text-white/55 mb-6">Global Reach</p>
        <h3
          className="text-[42px] md:text-[58px] leading-tight font-light uppercase tracking-[0.3em] mx-auto mb-10"
          style={{ fontFamily: '"Josefin Sans", sans-serif' }}
        >
          Established in the world&apos;s major trade hubs
        </h3>
        <p className="text-white/65 text-base md:text-lg max-w-3xl mx-auto mb-12 leading-relaxed">
          A synchronised network connects Montfort desks across Europe, the Middle East, and Asia Pacific. Real-time shipping,
          storage, and financing decisions flow between hubs to deliver a single, resilient operating layer.
        </p>
  <div className="flex flex-col md:flex-row justify-center gap-10">
          {hubs.map((hub, index) => {
            const weight = focusWeights[index];
            const active = index === highlightIndex;
            return (
              <div key={hub.label} className="flex flex-col items-center text-center gap-3 max-w-xs">
                <span
                  className={`w-3 h-3 rounded-full transition-all ${
                    active ? 'bg-cyan-300 shadow-[0_0_24px_rgba(94,233,255,0.8)]' : 'bg-white/25'
                  }`}
                  style={{ opacity: 0.35 + weight * 0.65 }}
                />
                <span
                  className="text-[11px] tracking-[0.4em] uppercase transition-colors"
                  style={{ color: active ? 'rgba(255,255,255,0.96)' : `rgba(255,255,255,${0.35 + weight * 0.45})` }}
                >
                  {hub.label}
                </span>
                <span
                  className="text-[11px] tracking-[0.2em] uppercase transition-colors"
                  style={{ color: active ? 'rgba(255,255,255,0.78)' : `rgba(255,255,255,${0.25 + weight * 0.4})` }}
                >
                  {hub.detail}
                </span>
                <p
                  className="text-xs leading-relaxed text-white/60 transition-opacity"
                  style={{ opacity: 0.45 + weight * 0.55 }}
                >
                  {hub.narrative}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="mt-12 px-6 md:px-10"
        style={{
          opacity: ribbonOpacity,
          transform: `translateY(${(1 - ribbonOpacity) * 80}px)`,
          transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}
      >
        <div className="flex flex-wrap justify-center gap-6 text-[11px] uppercase tracking-[0.38em] text-white/50">
          <span className="px-4 py-2 border border-white/20 rounded-full backdrop-blur bg-white/10">
            Geneva ↔ Dubai ↔ Singapore
          </span>
          <span className="px-4 py-2 border border-white/20 rounded-full backdrop-blur bg-white/10">
            24/7 Coordination Desk
          </span>
          <span className="px-4 py-2 border border-white/20 rounded-full backdrop-blur bg-white/10">
            Secure Maritime Corridor
          </span>
        </div>
      </div>

      <div
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        style={{
          opacity: metricsOpacity,
          transform: `translateY(${(1 - metricsOpacity) * 100}px)`,
          transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}
      >
        {networkMetrics.map((metric) => (
          <div key={metric.label} className="px-8 py-6 bg-white/6 border border-white/12 rounded-3xl backdrop-blur">
            <span className={`block text-3xl font-light ${metric.tone}`}>{metric.value}</span>
            <span className="text-[11px] tracking-[0.35em] uppercase text-white/55">{metric.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
