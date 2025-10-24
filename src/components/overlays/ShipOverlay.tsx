"use client";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const segments = [
  {
    name: 'Montfort Trading',
    tagline: 'Operating efficiently by leading with innovation.',
    start: 0,
    peak: 0.126,
    end: 0.25,
  },
  {
    name: 'Montfort Capital',
    tagline: 'Identifying and seizing opportunities that maximise value.',
    start: 0.25,
    peak: 0.375,
    end: 0.5,
  },
  {
    name: 'Montfort Maritime',
    tagline: 'Powering progress and delivering energy across the globe.',
    start: 0.5,
    peak: 0.625,
    end: 0.75,
  },
  {
    name: 'Fort Energy',
    tagline: 'Advancing innovation in future-ready energy investments.',
    start: 0.75,
    peak: 0.875,
    end: 1,
  },
];

interface ShipOverlayProps {
  progress: number | null;
  opacity: number;
  isVisible: boolean;
}

export default function ShipOverlay({ progress, opacity, isVisible }: ShipOverlayProps) {
  if (progress === null) return null;

  const activeIndex = segments.findIndex((segment, idx) => {
    const nextStart = segments[idx + 1]?.start ?? 1.01;
    return progress >= segment.start && progress < nextStart;
  });
  const safeIndex = activeIndex === -1 ? segments.length - 1 : activeIndex;
  const segment = segments[safeIndex];

  const appearWindow = segment.peak > segment.start ? clamp((progress - segment.start) / (segment.peak - segment.start)) : 1;
  const fadeWindow = segment.end > segment.peak ? clamp((segment.end - progress) / (segment.end - segment.peak)) : 1;
  const headlineOpacity = clamp(Math.min(appearWindow, fadeWindow));
  const tickerProgress = clamp(progress);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        visibility: isVisible ? 'visible' : 'hidden',
        opacity,
        transition: 'opacity 0.4s ease',
        background: 'linear-gradient(160deg, rgba(5,8,15,0.25) 0%, rgba(8,12,20,0.15) 65%, transparent 100%)', // ✨ HEAVILY REDUCED darkness to showcase industrial engine scene
      }}
    >
      <div className="absolute inset-x-0 top-12 flex justify-center">
        <div
          className="flex items-center gap-4 px-5 py-3 rounded-full border border-white/30 backdrop-blur-md"
          style={{
            background: 'rgba(255, 255, 255, 0.08)', // ✨ Subtle glass morphism
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          <span className="text-[11px] tracking-[0.4em] uppercase text-white/70">Divisions</span>
          <div className="flex gap-3 text-[11px] tracking-[0.35em] uppercase">
            {segments.map((division, divisionIndex) => {
              const active = divisionIndex === safeIndex;
              return (
                <span
                  key={division.name}
                  className={`transition-colors ${active ? 'text-white' : 'text-white/40'}`}
                >
                  {division.name.split(' ')[1]}
                </span>
              );
            })}
          </div>
          <span className="text-[11px] tracking-[0.35em] uppercase text-white/50">
            {String(safeIndex + 1).padStart(2, '0')}/{String(segments.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    <div className="absolute inset-0 flex items-center justify-center px-14 text-white">
        <div
          className="text-center max-w-4xl"
          style={{
            opacity: headlineOpacity,
            transform: `translateY(${(0.5 - headlineOpacity) * 40}px)`,
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)', // ✨ Text shadow for better readability
          }}
        >
          <p className="text-xs tracking-[0.5em] uppercase text-white/50 mb-6">
            {String(safeIndex + 1).padStart(2, '0')} / {String(segments.length).padStart(2, '0')}
          </p>
          <h3
            className="text-[58px] md:text-[68px] leading-[1.1] font-light uppercase tracking-[0.32em] mb-8"
            style={{ fontFamily: '"Josefin Sans", sans-serif' }}
          >
            {segment.name}
          </h3>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
            {segment.tagline}
          </p>
        </div>
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl">
        <div className="h-[2px] bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/70 transition-transform"
            style={{ transform: `scaleX(${tickerProgress})`, transformOrigin: 'left' }}
          />
        </div>
        <div className="flex justify-between mt-3 text-[11px] tracking-[0.38em] uppercase text-white/45">
          {segments.map((division, divisionIndex) => (
            <span
              key={division.name}
              className={divisionIndex === safeIndex ? 'text-white' : undefined}
            >
              {division.name.split(' ')[1]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
