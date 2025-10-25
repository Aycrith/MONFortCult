"use client";

import type { SceneTone } from "../MenuPanel";

interface HeroOverlayProps {
  progress: number | null;
  opacity: number;
  onOpenControls: () => void;
  tone: SceneTone;
}

export default function HeroOverlay({ progress, opacity, onOpenControls, tone }: HeroOverlayProps) {
  const safeProgress = progress ?? 0;
  const scrollCueOpacity = Math.max(0, 1 - safeProgress * 1.4);
  const titleOpacity = Math.max(0, 1 - safeProgress * 1.2);

  const toneLabelMap: Record<SceneTone, string> = {
    dawn: "DAWN",
    day: "DAY",
    dusk: "DUSK",
    night: "NIGHT",
  };

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ opacity, transition: "opacity 0.35s ease", pointerEvents: "none" }}
    >
      <div className="flex-1 flex items-center justify-center px-16">
        <div
          className="text-left"
          style={{
            opacity: titleOpacity,
            transform: `translateY(${safeProgress * -40}px)`,
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          <svg
            width="132"
            height="132"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-12"
          >
            <circle cx="24" cy="24" r="1.5" fill="white" />
            <circle cx="24" cy="20" r="1.5" fill="white" />
            <circle cx="27.46" cy="22" r="1.5" fill="white" />
            <circle cx="27.46" cy="26" r="1.5" fill="white" />
            <circle cx="24" cy="28" r="1.5" fill="white" />
            <circle cx="20.54" cy="26" r="1.5" fill="white" />
            <circle cx="20.54" cy="22" r="1.5" fill="white" />
            <circle cx="24" cy="16" r="1.5" fill="white" />
            <circle cx="27.46" cy="18" r="1.5" fill="white" />
            <circle cx="30.93" cy="20" r="1.5" fill="white" />
            <circle cx="30.93" cy="24" r="1.5" fill="white" />
            <circle cx="30.93" cy="28" r="1.5" fill="white" />
            <circle cx="27.46" cy="30" r="1.5" fill="white" />
            <circle cx="24" cy="32" r="1.5" fill="white" />
            <circle cx="20.54" cy="30" r="1.5" fill="white" />
            <circle cx="17.07" cy="28" r="1.5" fill="white" />
            <circle cx="17.07" cy="24" r="1.5" fill="white" />
            <circle cx="17.07" cy="20" r="1.5" fill="white" />
            <circle cx="20.54" cy="18" r="1.5" fill="white" />
            <circle cx="24" cy="12" r="1.5" fill="white" />
            <circle cx="27.46" cy="14" r="1.5" fill="white" />
            <circle cx="30.93" cy="16" r="1.5" fill="white" />
            <circle cx="34.39" cy="18" r="1.5" fill="white" />
            <circle cx="34.39" cy="22" r="1.5" fill="white" />
            <circle cx="34.39" cy="26" r="1.5" fill="white" />
            <circle cx="34.39" cy="30" r="1.5" fill="white" />
            <circle cx="30.93" cy="32" r="1.5" fill="white" />
            <circle cx="27.46" cy="34" r="1.5" fill="white" />
            <circle cx="24" cy="36" r="1.5" fill="white" />
            <circle cx="20.54" cy="34" r="1.5" fill="white" />
            <circle cx="17.07" cy="32" r="1.5" fill="white" />
            <circle cx="13.61" cy="30" r="1.5" fill="white" />
            <circle cx="13.61" cy="26" r="1.5" fill="white" />
            <circle cx="13.61" cy="22" r="1.5" fill="white" />
            <circle cx="13.61" cy="18" r="1.5" fill="white" />
            <circle cx="17.07" cy="16" r="1.5" fill="white" />
            <circle cx="20.54" cy="14" r="1.5" fill="white" />
          </svg>

          <h1
            className="text-white text-[72px] tracking-[0.32em] font-extralight"
            style={{
              fontFamily: '"Josefin Sans", sans-serif',
              letterSpacing: "0.32em",
              textShadow: "0 18px 58px rgba(0,0,0,0.64)",
            }}
          >
            MONTFORT
          </h1>
        </div>
      </div>

      <div className="absolute top-10 right-10 flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs tracking-[0.5em] uppercase border border-white/20 backdrop-blur">
          <span>{toneLabelMap[tone]}</span>
        </div>
        <button
          onClick={onOpenControls}
          className="px-5 py-3 rounded-full text-xs tracking-[0.45em] uppercase text-white bg-white/12 border border-white/25 backdrop-blur hover:bg-white/18 transition-colors"
        >
          Scene Controls
        </button>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center" style={{ opacity: scrollCueOpacity }}>
        <p className="text-white text-[11px] tracking-[0.8em] uppercase">
          Scroll Down To Discover
        </p>
      </div>

      <div className="absolute bottom-10 left-12" style={{ opacity: scrollCueOpacity }}>
        <svg
          width="44"
          height="44"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="white"
            strokeWidth="1.5"
            fill="rgba(0, 0, 0, 0.35)"
          />
          <text
            x="20"
            y="12"
            fontSize="8"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            N
          </text>
          <path d="M20 20 L18 12 L20 10 L22 12 Z" fill="#82b3c9" opacity="0.9" />
          <path d="M20 20 L18 28 L20 30 L22 28 Z" fill="white" opacity="0.6" />
          <circle cx="20" cy="20" r="2" fill="white" />
        </svg>
      </div>
    </div>
  );
}
