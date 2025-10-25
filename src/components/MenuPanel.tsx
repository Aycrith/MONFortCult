'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export type SceneTone = 'dawn' | 'day' | 'dusk' | 'night';

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tone: SceneTone;
  onToneChange: (tone: SceneTone) => void;
  snowEnabled: boolean;
  onSnowToggle: () => void;
  onCinematicTour: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  soundNotice: string | null;
  soundLocked: boolean;
}

const toneLabels: Record<SceneTone, string> = {
  dawn: 'DAWN',
  day: 'DAY',
  dusk: 'DUSK',
  night: 'NIGHT',
};

export default function MenuPanel({
  isOpen,
  onClose,
  tone,
  onToneChange,
  snowEnabled,
  onSnowToggle,
  onCinematicTour,
  soundEnabled,
  onSoundToggle,
  soundNotice,
  soundLocked,
}: MenuPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { xPercent: 20, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-[320px] md:w-[360px] z-[70] bg-[#0f1a2e]/95 backdrop-blur-xl text-white px-8 py-10 overflow-y-auto border-l border-white/10"
      >
        <div className="flex items-center justify-between mb-10">
          <span className="text-xs tracking-[0.65em] text-white/60">
            SCENE CONTROLS
          </span>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-10">
          <section>
            <h3 className="text-[11px] tracking-[0.5em] uppercase text-white/50 mb-4">
              Time Of Day
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(toneLabels) as SceneTone[]).map((value) => {
                const isActive = value === tone;
                return (
                  <button
                    key={value}
                    onClick={() => onToneChange(value)}
                    className={`py-3 rounded-md text-xs tracking-[0.45em] uppercase transition-all duration-300 ${
                      isActive
                        ? 'bg-white text-[#0f1a2e] shadow-[0_12px_30px_rgba(12,24,38,0.35)]'
                        : 'bg-white/10 text-white/70 hover:bg-white/18 hover:text-white'
                    }`}
                    style={{ border: isActive ? '1px solid rgba(15,26,46,0.15)' : '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {toneLabels[value]}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] tracking-[0.5em] uppercase text-white/50 mb-4">
              Weather Layer
            </h3>
            <button
              onClick={onSnowToggle}
              className={`w-full py-3 rounded-md text-xs tracking-[0.45em] uppercase flex items-center justify-between transition-colors ${
                snowEnabled
                  ? 'bg-[#5da8ff] text-[#0f1a2e] shadow-[0_12px_30px_rgba(93,168,255,0.28)]'
                  : 'bg-white/10 text-white/70 hover:bg-white/18 hover:text-white'
              }`}
            >
              <span>Snow Overlay</span>
              <span>{snowEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </section>

          <section>
            <h3 className="text-[11px] tracking-[0.5em] uppercase text-white/50 mb-4">
              Adaptive Soundscape
            </h3>
            <button
              onClick={onSoundToggle}
              disabled={soundLocked}
              className={`w-full py-3 rounded-md text-xs tracking-[0.45em] uppercase flex items-center justify-between transition-colors ${
                soundEnabled
                  ? 'bg-[#8bd6ff] text-[#082038] shadow-[0_12px_30px_rgba(139,214,255,0.25)]'
                  : 'bg-white/10 text-white/70 hover:bg-white/18 hover:text-white'
              } ${soundLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>Soundscape</span>
              <span>{soundEnabled ? 'ON' : 'OFF'}</span>
            </button>
            {soundNotice && (
              <p className="text-[11px] text-white/55 leading-relaxed mt-3">
                {soundNotice}
              </p>
            )}
          </section>

          <section>
            <h3 className="text-[11px] tracking-[0.5em] uppercase text-white/50 mb-4">
              Guided Tour
            </h3>
            <button
              onClick={onCinematicTour}
              className="w-full py-3 rounded-md text-xs tracking-[0.45em] uppercase bg-white/10 text-white/80 hover:bg-white/18 hover:text-white transition-all"
            >
              Start Cinematic Scroll
            </button>
            <p className="text-[11px] text-white/50 leading-relaxed mt-3">
              Experience the landing page as an uninterrupted cinematic sequence. The
              viewport will glide through each environment with deliberate pacing.
            </p>
          </section>

          <section>
            <h3 className="text-[11px] tracking-[0.5em] uppercase text-white/50 mb-4">
              Navigation
            </h3>
            <ul className="space-y-3 text-xs tracking-[0.4em] text-white/70">
              <li>MONTFORT GROUP</li>
              <li>MONTFORT TRADING</li>
              <li>MONTFORT CAPITAL</li>
              <li>MONTFORT MARITIME</li>
              <li>FORT ENERGY</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
