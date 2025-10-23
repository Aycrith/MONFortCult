'use client';

import { useMemo } from 'react';

interface TextMorphSceneProps {
  progress: number;
  opacity: number;
  isVisible: boolean;
}

const DIVISIONS = ['TRADING', 'CAPITAL', 'MARITIME', 'FORT ENERGY'] as const;

const lightBeamBlueprint = Array.from({ length: 6 }, (_, index) => ({
  baseLeft: 12 + index * 14,
  delay: index * 0.18,
}));

export default function TextMorphScene({ progress, opacity, isVisible }: TextMorphSceneProps) {
  const beams = useMemo(() => lightBeamBlueprint, []);

  const stages = DIVISIONS.length;
  const rawStage = progress * stages;
  const stageIndex = Math.min(stages - 1, Math.floor(rawStage));
  const stageProgress = rawStage - stageIndex;

  const montfortTranslateX = -(stageIndex + stageProgress) * 280;
  const divisionTranslateX = 280 - stageProgress * 560;

  const showMontfort = stageIndex !== stages - 1;

  const maritimeLogoOpacity = stageIndex === 2
    ? Math.min(1, Math.max(0, (stageProgress - 0.2) / 0.4))
    : 0;

  const whiteOverlayOpacity = progress > 0.92 ? (progress - 0.92) / 0.08 : 0;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ visibility: isVisible ? 'visible' : 'hidden', opacity, transition: 'opacity 0.35s ease' }}
    >
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        {beams.map((beam, index) => {
          const loopingProgress = (progress * 3 + beam.delay) % 1;
          const opacityValue = Math.max(0, Math.sin(loopingProgress * Math.PI));
          const horizontalDrift = Math.sin(progress * Math.PI * 2 + index * 0.35) * 4;

          return (
            <span
              key={index}
              className="absolute top-0 w-px h-full"
              style={{
                left: `${beam.baseLeft + horizontalDrift}%`,
                opacity: opacityValue * 0.8,
                background:
                  'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.2) 15%, rgba(255,255,255,0.8) 45%, rgba(255,255,255,0.2) 75%, transparent 100%)',
                boxShadow: '0 0 24px rgba(255,255,255,0.45)',
                transform: `translateY(${(loopingProgress - 0.5) * 40}%)`,
              }}
            />
          );
        })}
      </div>

      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 6 }}>
        <div className="flex items-center gap-14 text-white" style={{ filter: 'drop-shadow(0 24px 45px rgba(0,0,0,0.35))' }}>
          <div
            className="transition-opacity duration-200"
            style={{
              opacity: showMontfort ? 1 : 0,
              transform: `translateX(${montfortTranslateX}px)`,
            }}
          >
            <h2
              className="text-[48px] md:text-[64px] lg:text-[72px] tracking-[0.35em] font-light"
              style={{ fontFamily: '"Josefin Sans", sans-serif' }}
            >
              MONTFORT
            </h2>
          </div>

          <div
            style={{ transform: `translateX(${divisionTranslateX}px)` }}
            className="transition-transform duration-200"
          >
            <h2
              className="text-[48px] md:text-[64px] lg:text-[72px] tracking-[0.35em] font-light"
              style={{ fontFamily: '"Josefin Sans", sans-serif' }}
            >
              {DIVISIONS[stageIndex]}
            </h2>
          </div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-[180px]"
          style={{ opacity: maritimeLogoOpacity }}
        >
          <svg width="92" height="92" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M60 12L24 32v32c0 26 18 48 36 54 18-6 36-28 36-54V32L60 12Z"
              stroke="white"
              strokeWidth="3"
              fill="rgba(255,255,255,0.08)"
            />
            <path
              d="M36 70c12-10 36-10 48 0"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M36 58c12-10 36-10 48 0"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>
      </div>

      <div
        className="absolute inset-0 bg-white"
        style={{ opacity: whiteOverlayOpacity, zIndex: 10 }}
      />
    </div>
  );
}
