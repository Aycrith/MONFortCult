'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import WebGLMountainScene from '@/components/WebGLMountainScene';
import TextMorphScene from '@/components/scenes/TextMorphScene';
import InfoSectionsOverlay from '@/components/scenes/InfoSectionsOverlay';
import ShipScene from '@/components/scenes/ShipScene';
import { GlobeSceneWrapper, ForestSceneWrapper } from '@/components/scenes/SceneWrappers';
import MasterScrollContainer, {
  SCENE_TIMING,
  getSceneProgress,
  getSceneOpacity,
} from '@/components/MasterScrollContainer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Homepage - Rebuilt with Persistent Canvas Architecture
 *
 * This is the NEW implementation that fixes the scroll-driven animation system.
 *
 * Key Changes:
 * 1. Single MasterScrollContainer pins for entire journey (3000vh)
 * 2. All scenes are layered absolutely (canvas layers + overlays)
 * 3. Progress controlled by parent, passed to children
 * 4. Smooth crossfades between scenes
 * 5. Scroll scrubbing (forward/backward animation)
 *
 * Architecture:
 * - Canvas Layer (z-index: 0): WebGL Mountains, Ship, Globe, Forest
 * - Overlay Layer (z-index: 10): Text, Hero Content, Info Sections
 */
export default function Homepage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Hero fade-in animation (runs once on mount)
  useEffect(() => {
    if (heroRef.current && logoRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'linear' }
      );

      gsap.fromTo(
        logoRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div className="homepage relative">
      <Header />

      {/* Master Scroll Container - Single pin for entire journey */}
      <MasterScrollContainer>
        {(globalProgress) => {
          // Calculate scene-specific progress and opacity values
          const heroProgress = getSceneProgress(
            globalProgress,
            SCENE_TIMING.hero.start,
            SCENE_TIMING.hero.end
          );
          const heroOpacity = getSceneOpacity(
            globalProgress,
            SCENE_TIMING.hero.start,
            SCENE_TIMING.hero.end
          );

          const textMorphProgress = getSceneProgress(
            globalProgress,
            SCENE_TIMING.textMorph.start,
            SCENE_TIMING.textMorph.end
          );
          const textMorphOpacity = getSceneOpacity(
            globalProgress,
            SCENE_TIMING.textMorph.start,
            SCENE_TIMING.textMorph.end
          );

          const infoProgress = getSceneProgress(
            globalProgress,
            SCENE_TIMING.infoSections.start,
            SCENE_TIMING.infoSections.end
          );
          const infoOpacity = getSceneOpacity(
            globalProgress,
            SCENE_TIMING.infoSections.start,
            SCENE_TIMING.infoSections.end
          );

          const shipProgress = getSceneProgress(
            globalProgress,
            SCENE_TIMING.ship.start,
            SCENE_TIMING.ship.end
          );
          const shipOpacity = getSceneOpacity(
            globalProgress,
            SCENE_TIMING.ship.start,
            SCENE_TIMING.ship.end
          );

          const globeProgress = getSceneProgress(
            globalProgress,
            SCENE_TIMING.globe.start,
            SCENE_TIMING.globe.end
          );
          const globeOpacity = getSceneOpacity(
            globalProgress,
            SCENE_TIMING.globe.start,
            SCENE_TIMING.globe.end
          );

          const forestProgress = getSceneProgress(
            globalProgress,
            SCENE_TIMING.forest.start,
            SCENE_TIMING.forest.end
          );
          const forestOpacity = getSceneOpacity(
            globalProgress,
            SCENE_TIMING.forest.start,
            SCENE_TIMING.forest.end
          );

          // Determine which canvas should be visible (crossfade logic)
          // Mountains visible during hero + textMorph + early info
          const mountainsVisible = globalProgress < SCENE_TIMING.infoSections.end + 0.05;
          const mountainsOpacity =
            globalProgress < SCENE_TIMING.infoSections.end - 0.05
              ? 1
              : getSceneOpacity(
                  globalProgress,
                  SCENE_TIMING.infoSections.end - 0.05,
                  SCENE_TIMING.infoSections.end + 0.05,
                  0.05
                );

          // Calculate mountain camera progress (zoom out during hero scene)
          const mountainProgress = heroProgress ?? 0;

          return (
            <>
              {/* ============ CANVAS LAYER (z-index: 0) ============ */}
              {/* Persistent animated backgrounds that crossfade */}

              {/* Mountain Canvas - Visible during scenes 1-3 */}
              <div className="absolute inset-0" style={{ zIndex: 0 }}>
                <WebGLMountainScene
                  progress={mountainProgress}
                  opacity={mountainsOpacity}
                  isVisible={mountainsVisible}
                >
                  {/* Hero Content Overlay - Only visible during hero scene */}
                  {heroProgress !== null && (
                    <section
                      ref={heroRef}
                      className="flex items-center justify-start h-full relative px-16"
                      style={{
                        opacity: heroOpacity,
                        pointerEvents: heroProgress > 0 ? 'auto' : 'none',
                      }}
                    >
                      <div ref={logoRef} className="text-left">
                        {/* Montfort Geometric Logo - 37 dots in hexagonal pattern */}
                        <svg
                          width="120"
                          height="120"
                          viewBox="0 0 48 48"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mb-12"
                        >
                          {/* Center dot */}
                          <circle cx="24" cy="24" r="1.5" fill="white" />

                          {/* Ring 1 - 6 dots at radius 4 */}
                          <circle cx="24" cy="20" r="1.5" fill="white" />
                          <circle cx="27.46" cy="22" r="1.5" fill="white" />
                          <circle cx="27.46" cy="26" r="1.5" fill="white" />
                          <circle cx="24" cy="28" r="1.5" fill="white" />
                          <circle cx="20.54" cy="26" r="1.5" fill="white" />
                          <circle cx="20.54" cy="22" r="1.5" fill="white" />

                          {/* Ring 2 - 12 dots at radius 8 */}
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

                          {/* Ring 3 - 18 dots at radius 12 */}
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
                          className="text-white text-5xl md:text-6xl lg:text-7xl tracking-[0.3em] font-light"
                          style={{
                            fontFamily: '"Josefin Sans", sans-serif',
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                          }}
                        >
                          MONTFORT
                        </h1>
                      </div>

                      {/* Compass Icon - Bottom Left */}
                      <div className="absolute bottom-8 left-8">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="opacity-70"
                        >
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            stroke="white"
                            strokeWidth="1.5"
                            fill="rgba(0, 0, 0, 0.4)"
                          />
                          <circle cx="20" cy="5" r="1" fill="white" />
                          <circle cx="35" cy="20" r="1" fill="white" />
                          <circle cx="20" cy="35" r="1" fill="white" />
                          <circle cx="5" cy="20" r="1" fill="white" />
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
                          <path
                            d="M 20 20 L 18 12 L 20 10 L 22 12 Z"
                            fill="#6194b0"
                            opacity="0.9"
                          />
                          <path
                            d="M 20 20 L 18 28 L 20 30 L 22 28 Z"
                            fill="white"
                            opacity="0.6"
                          />
                          <circle cx="20" cy="20" r="2" fill="white" />
                        </svg>
                      </div>

                      {/* Scroll Prompt - Bottom Center */}
                      <p className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs tracking-widest uppercase">
                        SCROLL DOWN TO DISCOVER
                      </p>
                    </section>
                  )}
                </WebGLMountainScene>
              </div>

              {/* Ship Canvas - Visible during ship scene */}
              {shipProgress !== null && (
                <ShipScene
                  progress={shipProgress}
                  opacity={shipOpacity}
                  isVisible={shipProgress !== null}
                />
              )}

              {/* Globe Canvas - Visible during globe scene */}
              {globeProgress !== null && (
                <GlobeSceneWrapper
                  progress={globeProgress}
                  opacity={globeOpacity}
                  isVisible={globeProgress !== null}
                />
              )}

              {/* Forest Canvas - Visible during forest scene */}
              {forestProgress !== null && (
                <ForestSceneWrapper
                  progress={forestProgress}
                  opacity={forestOpacity}
                  isVisible={forestProgress !== null}
                />
              )}

              {/* ============ OVERLAY LAYER (z-index: 10+) ============ */}
              {/* Text, UI elements that float above canvas */}

              {/* Text Morph Overlay - Scene 2 */}
              {textMorphProgress !== null && (
                <div style={{ zIndex: 10, position: 'absolute', inset: 0 }}>
                  <TextMorphScene
                    progress={textMorphProgress}
                    opacity={textMorphOpacity}
                    isVisible={textMorphProgress !== null}
                  />
                </div>
              )}

              {/* Info Sections Overlay - Scene 3 */}
              {infoProgress !== null && (
                <div style={{ zIndex: 11, position: 'absolute', inset: 0 }}>
                  <InfoSectionsOverlay
                    progress={infoProgress}
                    opacity={infoOpacity}
                    isVisible={infoProgress !== null}
                  />
                </div>
              )}
            </>
          );
        }}
      </MasterScrollContainer>

      {/* Footer - Traditional scroll after master container unpins */}
      <Footer />
    </div>
  );
}
