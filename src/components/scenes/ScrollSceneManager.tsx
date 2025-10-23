'use client';

import { ReactNode } from 'react';

interface ScrollSceneManagerProps {
  children: ReactNode;
}

/**
 * ScrollSceneManager
 *
 * Orchestrates the multi-scene scroll experience for the Montfort landing page.
 * Manages z-index layering, scene transitions, and scroll flow coordination.
 *
 * Scene Order:
 * 1. Hero (WebGL Mountains) - Initial view with logo
 * 2. Text Morph - MONTFORT → TRADING → CAPITAL → MARITIME → ENERGY
 * 3. Informational - Who We Are, What We Do sections
 * 4. Ship - Cargo ship with business division overlays
 * 5. Globe - Earth with trade hub markers
 * 6. Forest - Sustainability content with ESG tabs
 * 7. Footer
 */
export default function ScrollSceneManager({ children }: ScrollSceneManagerProps) {
  return (
    <div className="scroll-scene-container relative">
      {/*
        All scenes are rendered as children. Each scene component manages:
        - Its own ScrollTrigger setup
        - Pin/unpin behavior
        - Fade in/out transitions
        - Content animations

        The manager simply provides consistent structure and ensures
        proper stacking context for scene layering.
      */}
      {children}
    </div>
  );
}
