'use client';

import { useEffect, useRef, ReactNode, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MasterScrollContainerProps {
  children: (progress: number) => ReactNode;
}

/**
 * MasterScrollContainer
 *
 * The core architectural component that implements the "Persistent Canvas" principle.
 *
 * Key Responsibilities:
 * 1. Pins the entire experience for 3000vh (single continuous scroll)
 * 2. Provides global scroll progress (0-1) to all child scenes
 * 3. Controls scene crossfades and timing coordination
 * 4. Ensures scroll scrubbing (animations tied directly to scroll position)
 *
 * Architecture:
 * - This is the ONLY component that uses pin: true
 * - All scenes are children that receive progress props
 * - No child component should create its own ScrollTrigger with pin
 */
export default function MasterScrollContainer({ children }: MasterScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const rafIdRef = useRef<number | null>(null);
  const pendingProgressRef = useRef<number | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      (window as typeof window & { __MASTER_PROGRESS?: number }).__MASTER_PROGRESS = currentProgress;
    }
  }, [currentProgress]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Calculate total scroll distance based on reference video timing
    // Reference: 88 seconds total video = ~8000vh for comfortable, deliberate scroll pace
    // This creates ~90vh per second of content, preventing users from rushing through scenes
    const TOTAL_SCROLL_HEIGHT = 8000;

    // RAF-throttled progress update to prevent excessive re-renders
    const updateProgress = (progress: number) => {
      pendingProgressRef.current = progress;

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (pendingProgressRef.current !== null) {
            setCurrentProgress(pendingProgressRef.current);
            pendingProgressRef.current = null;
          }
          rafIdRef.current = null;
        });
      }
    };

    // Single master ScrollTrigger that controls EVERYTHING
    const masterScrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: `+=${TOTAL_SCROLL_HEIGHT}vh`,
      pin: true, // This is the ONLY pin in the entire experience
      scrub: 2.8, // Smooth scroll-linked animation (2.8s delay for cinematic smoothness)
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Global progress (0-1 across entire pinned journey)
        // Use RAF throttling to prevent 60+ re-renders per second
        updateProgress(self.progress);
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      (window as typeof window & { __MASTER_TRIGGER?: ScrollTrigger }).__MASTER_TRIGGER = masterScrollTrigger;
    }

    // Cleanup
    return () => {
      masterScrollTrigger.kill();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-master-scroll
      data-progress={currentProgress.toFixed(5)}
      className="relative w-full h-screen overflow-hidden"
      style={{
        willChange: 'transform',
        isolation: 'isolate', // Create stacking context
      }}
    >
      {/* Render children with current progress */}
      {children(currentProgress)}
    </div>
  );
}

/**
 * Scene Timing Calculator
 *
 * Based on reference video (mont-fort.com):
 * Total: 88 seconds, 8000vh scroll height
 *
 * Scene 1 (Hero/Mountain): 0-3s = 3.4% = 272vh
 * Scene 2 (Text Morph): 3-18s = 17% = 1360vh
 * Scene 3 (Info Sections): 18-50s = 36.4% = 2912vh
 * Scene 4 (Ship): 50-60s = 11.4% = 912vh
 * Scene 5 (Globe): 60-72s = 13.6% = 1088vh
 * Scene 6 (Forest): 72-88s = 18.2% = 1456vh
 */
export const SCENE_TIMING = {
  hero: {
    start: 0,
    end: 0.045,
    duration: 0.045,
  },
  textMorph: {
    start: 0.045,
    end: 0.24, // 0.045 + 0.195
    duration: 0.195,
  },
  infoSections: {
    start: 0.24,
    end: 0.61, // 0.24 + 0.37
    duration: 0.37,
  },
  ship: {
    start: 0.61,
    end: 0.74, // 0.61 + 0.13
    duration: 0.13,
  },
  globe: {
    start: 0.74,
    end: 0.88, // 0.74 + 0.14
    duration: 0.14,
  },
  forest: {
    start: 0.88,
    end: 1.0, // 0.88 + 0.12
    duration: 0.12,
  },
} as const;

/**
 * Utility: Calculate scene-local progress
 *
 * Converts global progress (0-1) to scene-local progress (0-1)
 *
 * @param globalProgress - Progress across entire journey (0-1)
 * @param sceneStart - Scene start point (0-1)
 * @param sceneEnd - Scene end point (0-1)
 * @returns Scene-local progress (0-1), or null if not in scene
 */
export function getSceneProgress(
  globalProgress: number,
  sceneStart: number,
  sceneEnd: number
): number | null {
  if (globalProgress < sceneStart || globalProgress > sceneEnd) {
    return null; // Not in this scene
  }

  const sceneDuration = sceneEnd - sceneStart;
  const sceneProgress = (globalProgress - sceneStart) / sceneDuration;

  return Math.max(0, Math.min(1, sceneProgress)); // Clamp 0-1
}

/**
 * Utility: Calculate crossfade opacity
 *
 * Creates smooth crossfades between scenes with configurable overlap
 *
 * @param globalProgress - Progress across entire journey (0-1)
 * @param sceneStart - Scene start point (0-1)
 * @param sceneEnd - Scene end point (0-1)
 * @param fadeDistance - Fade in/out distance (default: 0.02 = 2% overlap)
 * @returns Opacity value (0-1)
 */
export function getSceneOpacity(
  globalProgress: number,
  sceneStart: number,
  sceneEnd: number,
  fadeDistance: number = 0.02
): number {
  // Before scene starts
  if (globalProgress < sceneStart) return 0;

  // After scene ends
  if (globalProgress > sceneEnd) return 0;

  // Fade in at start
  if (globalProgress < sceneStart + fadeDistance) {
    const fadeInProgress = (globalProgress - sceneStart) / fadeDistance;
    return Math.max(0, Math.min(1, fadeInProgress));
  }

  // Fade out at end
  if (globalProgress > sceneEnd - fadeDistance) {
    const fadeOutProgress = (sceneEnd - globalProgress) / fadeDistance;
    return Math.max(0, Math.min(1, fadeOutProgress));
  }

  // Full opacity in middle
  return 1;
}
