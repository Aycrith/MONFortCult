'use client';

import { useState } from 'react';
import MasterScrollContainer, {
  SCENE_TIMING,
  getSceneOpacity,
  getSceneProgress,
} from '@/components/MasterScrollContainer';
import PersistentBackground from '@/components/PersistentBackground';
import SnowOverlay from '@/components/SnowOverlay';
import TextMorphScene from '@/components/scenes/TextMorphScene';
import ShipScene from '@/components/scenes/ShipScene';
import { useMenu } from '@/context/MenuContext';
import MenuPanel, { type SceneTone } from '@/components/MenuPanel';
import HeroOverlay from '@/components/overlays/HeroOverlay';
import InfoOverlay from '@/components/overlays/InfoOverlay';
import ShipOverlay from '@/components/overlays/ShipOverlay';
import GlobeOverlay from '@/components/overlays/GlobeOverlay';
import ForestOverlay from '@/components/overlays/ForestOverlay';
import { useScroll } from '@/components/smoothscroll';
import DevTimelineHud from '@/components/DevTimelineHud';
import AtmosphereOverlay from '@/components/overlays/AtmosphereOverlay';
import CloudOverlay from '@/components/CloudOverlay';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// ✨ Simple FPS Counter Component - Always visible for performance monitoring
function FPSCounter() {
  const { metrics } = usePerformanceMonitor(true);
  
  return (
    <div 
      className="fixed top-4 left-4 bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-mono text-sm z-[9998] border border-white/20 shadow-xl"
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-white/60">FPS:</span>
        <span 
          className={`text-lg font-bold ${
            metrics.fps < 30 ? 'text-red-400' : 
            metrics.fps < 50 ? 'text-yellow-400' : 
            'text-green-400'
          }`}
        >
          {metrics.fps}
        </span>
      </div>
    </div>
  );
}

export default function Homepage() {
  // ✨ Changed default from 'day' to 'dusk' for dramatic, cinematic lighting
  // Fixes whitewashed appearance with better contrast and atmospheric depth
  const [tone, setTone] = useState<SceneTone>('dusk');
  const [snowEnabled, setSnowEnabled] = useState(false);
  const { menuOpen, setMenuOpen } = useMenu();
  const { lenis } = useScroll();

  const handleCinematicTour = () => {
    const target = document.documentElement.scrollHeight;
    if (lenis) {
      lenis.scrollTo(target, {
        duration: 28,
        easing: (t: number) => t,
      });
      return;
    }
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* ✨ FPS Performance Monitor - Always visible */}
      <FPSCounter />
      
      <MasterScrollContainer>
        {(globalProgress) => {
          const heroProgress = getSceneProgress(globalProgress, SCENE_TIMING.hero.start, SCENE_TIMING.hero.end);
          const heroOpacity = getSceneOpacity(globalProgress, SCENE_TIMING.hero.start, SCENE_TIMING.hero.end, 0.015);

          const morphProgress = getSceneProgress(
            globalProgress,
            SCENE_TIMING.textMorph.start,
            SCENE_TIMING.textMorph.end
          );
          const morphOpacity = getSceneOpacity(
            globalProgress,
            SCENE_TIMING.textMorph.start,
            SCENE_TIMING.textMorph.end,
            0.025
          );

          const infoProgress = getSceneProgress(
            globalProgress,
            SCENE_TIMING.infoSections.start,
            SCENE_TIMING.infoSections.end
          );
          const infoOpacity = getSceneOpacity(
            globalProgress,
            SCENE_TIMING.infoSections.start,
            SCENE_TIMING.infoSections.end,
            0.04
          );

          const shipProgress = getSceneProgress(globalProgress, SCENE_TIMING.ship.start, SCENE_TIMING.ship.end);
          const shipOpacity = getSceneOpacity(globalProgress, SCENE_TIMING.ship.start, SCENE_TIMING.ship.end, 0.035);

          const globeProgress = getSceneProgress(globalProgress, SCENE_TIMING.globe.start, SCENE_TIMING.globe.end);
          const globeOpacity = getSceneOpacity(globalProgress, SCENE_TIMING.globe.start, SCENE_TIMING.globe.end, 0.035);

          const forestProgress = getSceneProgress(globalProgress, SCENE_TIMING.forest.start, SCENE_TIMING.forest.end);
          const forestOpacity = getSceneOpacity(globalProgress, SCENE_TIMING.forest.start, SCENE_TIMING.forest.end, 0.045);

          const islandBlend = (() => {
            const morphStart = 0.1509;
            const morphEnd = 0.1913;
            const infoStart = SCENE_TIMING.infoSections.start;
            const mountainRestoreComplete = 0.3584;

            if (globalProgress < morphStart) return 0;
            if (globalProgress <= morphEnd) {
              return clamp((globalProgress - morphStart) / (morphEnd - morphStart));
            }
            if (globalProgress < infoStart) return 1;
            if (globalProgress <= mountainRestoreComplete) {
              return clamp(1 - (globalProgress - infoStart) / (mountainRestoreComplete - infoStart));
            }
            return 0;
          })();

          const shipBlend = shipProgress === null ? 0 : clamp(shipProgress);
          const globeBlend = globeProgress === null ? 0 : clamp(globeProgress);
          const forestBlend = forestProgress === null ? 0 : clamp(forestProgress);

          const footerFade = forestProgress === null ? 0 : clamp((forestProgress - 0.88) / 0.12);

          return (
            <div className="absolute inset-0">
              <DevTimelineHud progress={globalProgress} />
              <PersistentBackground
                progress={globalProgress}
                tone={tone}
                islandBlend={islandBlend}
                shipBlend={shipBlend}
                globeBlend={globeBlend}
                forestBlend={forestBlend}
              />

              <AtmosphereOverlay progress={globalProgress} />

              {/* ✨ Multi-Layer Cloud System - Scene 1 atmospheric depth */}
              {heroProgress !== null && (
                <div className="absolute inset-0" style={{ zIndex: 2 }}>
                  <CloudOverlay 
                    scrollProgress={heroProgress} 
                    cloudCount={5}
                    cloudsPath="/assets/clouds"
                  />
                </div>
              )}

              {shipProgress !== null && (
                <ShipScene progress={shipProgress} opacity={shipOpacity} isVisible={shipProgress !== null} />
              )}

              <SnowOverlay active={snowEnabled} />

              <div
                className="absolute inset-0 bg-white pointer-events-none"
                style={{ opacity: clamp(footerFade), transition: 'opacity 0.4s ease', zIndex: 9 }}
              />

              <div className="absolute inset-0" style={{ zIndex: 10 }}>
                <HeroOverlay
                  progress={heroProgress}
                  opacity={heroOpacity}
                  onOpenControls={() => setMenuOpen(true)}
                  tone={tone}
                />

                <TextMorphScene progress={morphProgress ?? 0} opacity={morphOpacity} isVisible={morphProgress !== null} />

                <InfoOverlay progress={infoProgress} opacity={infoOpacity} isVisible={infoProgress !== null} />

                <ShipOverlay progress={shipProgress} opacity={shipOpacity} isVisible={shipProgress !== null} />

                <GlobeOverlay progress={globeProgress} opacity={globeOpacity} isVisible={globeProgress !== null} />

                <ForestOverlay progress={forestProgress} opacity={forestOpacity} isVisible={forestProgress !== null} />
              </div>

              <MenuPanel
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                tone={tone}
                onToneChange={setTone}
                snowEnabled={snowEnabled}
                onSnowToggle={() => setSnowEnabled((value) => !value)}
                onCinematicTour={handleCinematicTour}
              />
            </div>
          );
        }}
      </MasterScrollContainer>
    </div>
  );
}
