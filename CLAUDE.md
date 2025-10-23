# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 application for Montfort - a landing page featuring advanced parallax scrolling effects with layered mountain imagery, smooth scroll interactions using Lenis, and GSAP-powered animations. The project includes 3D Three.js scenes with atmospheric effects.

## Essential Commands

### Development
```bash
npm run dev           # Start dev server on 0.0.0.0 (accessible on network)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run TypeScript check + ESLint
npm run format        # Format code with Biome
```

Note: Uses Bun as package manager (bun.lock present), but npm commands work.

## Architecture

### Scroll & Animation System

The app uses a synchronized scroll/animation stack:
1. **SmoothScroll** (src/components/smoothscroll.tsx) - Root wrapper that initializes Lenis smooth scrolling and connects it to GSAP's ScrollTrigger
2. **ParallaxScene** (src/components/parallax/ParallaxScene.tsx) - Container that pins the viewport while user scrolls through 300vh of content
3. **ParallaxLayer** (src/components/parallax/ParallaxLayer.tsx) - Individual image layers that move at different speeds based on their `speed` prop

Critical timing: ParallaxScene waits 100ms before initializing to ensure Lenis is ready. All ScrollTriggers must use `invalidateOnRefresh: true` for proper recalculation.

### Component Structure

```
src/app/
├── layout.tsx          # Root layout with SmoothScroll wrapper
├── ClientBody.tsx      # Client-side body wrapper
├── page.tsx            # Entry point (renders Homepage)
└── homepage.tsx        # Main landing page composition

src/components/
├── parallax/
│   ├── ParallaxScene.tsx       # Viewport-pinning container
│   ├── ParallaxLayer.tsx       # Individual parallax layers
│   ├── HeroContent.tsx         # Text overlay
│   ├── AtmosphericEffects.tsx  # Visual effects layer
│   └── GradientLayer.tsx       # Background gradients
├── 3d/
│   ├── BaseScene.tsx           # Three.js base setup
│   └── MountainScene.tsx       # 3D mountain geometry scene
├── Header.tsx
├── Footer.tsx
└── smoothscroll.tsx            # Lenis initialization
```

### Key Dependencies

- **next**: 15.3.2 (App Router)
- **three**: 0.169.0 (3D scenes)
- **gsap**: 3.13.0 (animations, ScrollTrigger)
- **lenis**: 1.3.11 (smooth scrolling)
- **tailwindcss**: 3.4.17 (styling)

### Path Aliases

- `@/*` maps to `./src/*`

### Parallax Implementation Details

Layers in homepage.tsx are organized by:
- **speed**: Lower values (0.2) = far/slow, higher values (1.8) = close/fast
- **zIndex**: Controls visual stacking order
- **opacity**: Used for atmospheric depth
- **scale**: Subtle scaling for depth perception

The parallax effect moves layers downward (positive Y) as user scrolls, creating depth illusion where far mountains (low speed) move slower than close mountains (high speed).

### Styling Approach

- Tailwind CSS for utility classes
- Custom inline styles for parallax positioning
- `object-bottom` className for bottom-aligned mountain layers
- Color palette: Blues/grays (#a8b8c4 to #d8e0e8) for atmospheric mountain aesthetic

### Configuration Notes

- TypeScript strict mode enabled
- ESLint configured with Next.js rules, some disabled (@typescript-eslint/no-unused-vars, no-img-element, jsx-a11y/alt-text)
- Biome configured for formatting with space indentation and double quotes
- Images unoptimized in next.config.js (images.unoptimized: true)
- jsxImportSource set to "same-runtime/dist" (for same-runtime package integration)
