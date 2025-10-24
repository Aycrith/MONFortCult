"use client";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const fadeIn = (progress: number, start: number, end: number) => {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
};

const fadeOut = (progress: number, start: number, end: number) => {
  if (progress <= start) return 1;
  if (progress >= end) return 0;
  return 1 - (progress - start) / (end - start);
};

interface AtmosphereOverlayProps {
  progress: number;
}

export default function AtmosphereOverlay({ progress }: AtmosphereOverlayProps) {
  const heroFog = clamp(
    fadeIn(progress, 0.13, 0.16) * fadeOut(progress, 0.18, 0.24)
  );

  const shipFog = clamp(
    fadeIn(progress, 0.6, 0.64) * fadeOut(progress, 0.72, 0.75)
  );

  if (heroFog <= 0 && shipFog <= 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
      {/* ✨ MINIMAL ATMOSPHERE - Very subtle, non-intrusive */}
      <div
        className="absolute inset-0 mix-blend-lighten"
        style={{
          opacity: heroFog * 0.15, // DRASTICALLY reduced from 0.7 for minimal effect
          backgroundImage: "url('/assets/clouds/35.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px) brightness(1.3)", // Heavy blur for soft haze only
          transform: "scale(1.2)",
          transition: "opacity 0.4s ease",
        }}
      />

      {/* ✨ REMOVED: Video layer causing muddiness */}
      {/* Video background disabled for clarity */}

      {/* ✨ SHIP SCENE FOG - Minimal for ship scene */}
      <div
        className="absolute inset-0"
        style={{
          opacity: shipFog * 0.3, // Reduced for subtlety
          backgroundImage: "url('/assets/clouds/62.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(35px)", // Heavier blur for haze effect
          transform: "scale(1.1)",
          mixBlendMode: "soft-light",
          transition: "opacity 0.4s ease",
        }}
      />
    </div>
  );
}
