"use client";

import { useMemo, type CSSProperties } from "react";

interface SnowOverlayProps {
  active: boolean;
}

interface Flake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

export default function SnowOverlay({ active }: SnowOverlayProps) {
  const flakes = useMemo<Flake[]>(() => {
    const seededRandom = (seed: number) => {
      const value = Math.sin(seed) * 10000;
      return value - Math.floor(value);
    };

    return Array.from({ length: 90 }, (_, index) => {
      const seed = index + 1;
      const left = seededRandom(seed * 1.123) * 100;
      const size = 1 + seededRandom(seed * 2.417) * 2.5;
      const duration = 8 + seededRandom(seed * 3.811) * 6;
      const delay = seededRandom(seed * 4.219) * 6;
      const drift = seededRandom(seed * 5.907) * 40 - 20;

      return {
        id: index,
        left,
        size,
        duration,
        delay,
        drift,
      };
    });
  }, []);

  const format = (value: number, fractionDigits = 4) => value.toFixed(fractionDigits);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 6, opacity: active ? 1 : 0, transition: "opacity 0.6s ease" }}
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${format(flake.left)}%`,
            top: "-6%",
            width: `${format(flake.size)}px`,
            height: `${format(flake.size)}px`,
            opacity: 0.75,
            filter: "blur(0.5px)",
            animation: `snowFall ${format(flake.duration, 5)}s linear ${format(flake.delay, 5)}s infinite`,
            "--snow-drift": `${format(flake.drift)}px`,
          } as CSSProperties}
        />
      ))}

      <style jsx>{`
        @keyframes snowFall {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          60% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(var(--snow-drift, 0px), 110vh, 0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
