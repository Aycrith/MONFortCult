# Asset Generation & Implementation Workflow

## Overview

This document outlines the complete workflow for generating visual assets and implementing the scroll-driven persistent canvas architecture for the Montfort landing page.

---

## Phase 1: Asset Generation (YOUR TASK) ✅ READY TO START

You have **5 detailed specification documents** that provide exact requirements for generating all scene assets:

### 📄 Asset Specification Documents

1. **ASSET_SPEC_SCENE1_MOUNTAIN.md**
   - Scene: Hero mountain view with camera rotation
   - Assets: 4K video (20-30 sec) OR 3D model (.glb)
   - Key Features: Dark cinematic mountain, orbital camera, moving clouds
   - Deliverable: `mountain-hero-4k.mp4` or `mountain-hero.glb`

2. **ASSET_SPEC_SCENE2_ISLAND.md**
   - Scene: Maritime island transformation (destination for WebGL morph)
   - Assets: 4K image/video of rocky island in ocean
   - Key Features: Daytime skybox, animated water, compositional alignment with mountain
   - Deliverable: `island-maritime-4k.jpg` or `island-maritime-4k.mp4`

3. **ASSET_SPEC_SCENE4_SHIP.md**
   - Scene: Cargo ship traveling through stormy sky
   - Assets: TWO separate assets
     - Stormy cloudscape background (4K video, 15-20 sec loop)
     - Cargo ship sprite (1400x600px PNG with transparency)
   - Deliverables: `ship-cloudscape-4k.mp4` + `cargo-ship-sprite.png`

4. **ASSET_SPEC_SCENE5_GLOBE.md**
   - Scene: Rotating Earth from space (Europe/MENA focus)
   - Assets: Either THREE textures OR one video
     - Option A: `earth-surface-8k.jpg` (8K equirectangular) + `earth-clouds-4k.png` (with alpha) + optional normal map
     - Option B: `globe-rotation-4k.mp4` (30-40 sec rotation)
   - Deliverables: See options above

5. **ASSET_SPEC_SCENE6_FOREST.md**
   - Scene: Forest with volumetric god rays (sustainability theme)
   - Assets: 4K static image with depth of field
   - Key Features: Upward view through canopy, 5-8 visible light beams, bokeh effect
   - Deliverable: `forest-godray-4k.jpg`

### 📁 Asset Delivery Location

All assets should be placed in:
```
C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\scenes\
```

### ⏱️ Estimated Generation Time

- **Scene 1 (Mountain)**: 4-8 hours (if 3D rendering) OR 2-4 hours (if video editing/compositing)
- **Scene 2 (Island)**: 2-4 hours
- **Scene 4 (Ship)**: 4-6 hours (cloudscape + ship sprite)
- **Scene 5 (Globe)**: 3-5 hours (texture creation) OR 4-6 hours (video rendering)
- **Scene 6 (Forest)**: 2-4 hours (photography/rendering + post-processing)

**Total**: 15-30 hours depending on approach and tools used

### 🎯 Priority Order

**Recommended Generation Sequence**:
1. **Start with Scene 1 (Mountain)** - Most complex, sets the visual tone
2. **Scene 2 (Island)** - Must align compositionally with Scene 1 final frame
3. **Scene 6 (Forest)** - Simpler, can be done while testing Scenes 1-2
4. **Scene 4 (Ship)** - Two separate assets, moderately complex
5. **Scene 5 (Globe)** - Choose approach based on available tools

---

## Phase 2: Code Implementation (CLAUDE'S TASK) ⏳ PENDING ASSETS

Once assets are delivered, implementation will proceed in this order:

### Stage 1: Core Infrastructure (4-6 hours)
- [ ] Build `ScrollOrchestrator.tsx` - Pins viewport, manages 1000vh scroll
- [ ] Create `SceneCanvas.tsx` - WebGL canvas layer for 3D scenes
- [ ] Create `OverlayManager.tsx` - UI layer for text/content overlays
- [ ] Test basic pinned scroll with placeholder content

### Stage 2: Scene 1 & 2 - Mountain Morph (8-12 hours)
- [ ] Implement `MountainScene.tsx` - Video/3D model rendering with camera control
- [ ] Create WebGL shader morphing system for mountain → island transition
- [ ] Implement text overlay morphing (MONTFORT → TRADING → CAPITAL → MARITIME)
- [ ] Map scroll position (0-30%) to camera rotation and morph progress
- [ ] Test reversible scroll-driven animation

### Stage 3: Scene 3 - Info Section (2-3 hours)
- [ ] Create white background transition from island scene
- [ ] Implement "Who We Are" and "What We Do" content fades
- [ ] Scroll-linked opacity and position animations

### Stage 4: Scene 4 - Ship Journey (4-6 hours)
- [ ] Implement `ShipScene.tsx` - Cloudscape background + ship positioning
- [ ] Map scroll position (40-60%) to ship diagonal movement
- [ ] Create division tagline sequencing system
- [ ] Test ship path and tagline timing

### Stage 5: Scenes 5 & 6 - Globe & Forest (6-8 hours)
- [ ] Implement `GlobeScene.tsx` - Three.js sphere or video playback
- [ ] Add location marker overlays (Geneva, Dubai, Singapore, etc.)
- [ ] Implement `ForestScene.tsx` - Static background with particle system
- [ ] Create dust mote particle system for forest god rays
- [ ] Test all content overlays for sustainability section

### Stage 6: Integration & Polish (4-6 hours)
- [ ] Integrate all scenes into `ScrollOrchestrator` with crossfade transitions
- [ ] Update `homepage.tsx` to use new architecture (replace current parallax)
- [ ] Implement scene-to-scene transition timing and curves
- [ ] Test complete scroll journey (0-100%)

### Stage 7: Optimization & Testing (3-4 hours)
- [ ] Lazy loading for video assets (load on scroll approach)
- [ ] Texture compression and format optimization
- [ ] GPU performance monitoring and throttling
- [ ] Test scroll behavior: forward/reverse scrubbing, smooth transitions
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Run build and fix any errors

**Total Implementation Time**: 31-45 hours

---

## Scroll Position Map (Reference)

Complete scroll journey across 1000vh:

| Scroll Range | Scene | Description |
|--------------|-------|-------------|
| 0-1% (0-10vh) | Scene 1A | Hero mountain view (static) |
| 1-30% (10-300vh) | Scene 1B-2 | Mountain rotation + text morph + island transformation |
| 30-40% (300-400vh) | Scene 3 | White background info section (Who We Are / What We Do) |
| 40-60% (400-600vh) | Scene 4 | Ship diagonal movement + division taglines |
| 60-75% (600-750vh) | Scene 5 | Rotating globe + location markers |
| 75-90% (750-900vh) | Scene 6 | Forest + CSR content |
| 90-100% (900-1000vh) | Scene 7 | Footer (white background, static) |

---

## Technical Architecture Summary

### Component Hierarchy
```
App
└── SmoothScroll (Lenis wrapper)
    └── Layout
        └── ClientBody
            └── Homepage
                └── ScrollOrchestrator (NEW - pins viewport, manages 1000vh)
                    ├── SceneCanvas (Layer 0 - z-index: 0)
                    │   ├── MountainScene (0-30%)
                    │   ├── IslandScene (25-30% morph)
                    │   ├── ShipScene (40-60%)
                    │   ├── GlobeScene (60-75%)
                    │   └── ForestScene (75-90%)
                    │
                    └── OverlayManager (Layer 1 - z-index: 10)
                        ├── Header (fixed)
                        ├── TextMorphOverlay (0-30%)
                        ├── InfoSection (30-40%)
                        ├── DivisionTaglines (40-60%)
                        ├── LocationMarkers (60-75%)
                        ├── CSRContent (75-90%)
                        └── Footer (90-100%)
```

### Key Technologies
- **GSAP ScrollTrigger**: Pinning, scroll progress tracking
- **Three.js**: 3D scenes (globe, particles, optional mountain)
- **WebGL Shaders**: Custom fragment shader for mountain → island morph
- **Lenis**: Smooth scrolling (already implemented)
- **Video Playback**: HTML5 video with scroll-linked currentTime control

### Scroll-Driven Animation Pattern
```typescript
// Example: Map scroll to video playback time
const scrollProgress = (currentScroll - sceneStart) / (sceneEnd - sceneStart)
videoElement.currentTime = scrollProgress * videoDuration

// Example: Map scroll to 3D camera rotation
const rotationAngle = scrollProgress * 30 // 30° rotation over scene
camera.rotation.y = rotationAngle * (Math.PI / 180)

// Example: Map scroll to WebGL shader morph
shaderMaterial.uniforms.morphProgress.value = clamp(scrollProgress, 0, 1)
```

---

## Quality Standards

### Performance Targets
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Frame Rate**: Maintain 60 FPS during scroll on modern hardware
- **GPU Memory**: < 500 MB total texture/video memory
- **Total Asset Size**: < 100 MB (all scenes combined)

### Visual Fidelity
- All scene transitions must be smooth crossfades (no hard cuts)
- Scroll animation must be reversible (scroll up = animation reverses)
- Text overlays must be legible over all backgrounds
- No visible seams, pops, or glitches during scene transitions

### Browser Compatibility
- **Primary**: Chrome 120+, Safari 17+, Firefox 120+, Edge 120+
- **Mobile**: iOS Safari 17+, Chrome Android 120+
- **Fallback**: Graceful degradation for older browsers (static images instead of video)

---

## Next Steps

### For You (Asset Generation)

1. **Choose Your Approach**:
   - Scene 1: Video or 3D model?
   - Scene 5: Texture maps or pre-rendered video?

2. **Review Specifications**:
   - Read each `ASSET_SPEC_SCENE*.md` file thoroughly
   - Note quality checklists at end of each spec
   - Understand compositional requirements (especially Scene 2 alignment)

3. **Set Up Workflow**:
   - 3D software: Blender, Cinema 4D, Houdini, etc.
   - Video editing: After Effects, Premiere Pro, DaVinci Resolve, etc.
   - Photo editing: Photoshop, GIMP, etc.

4. **Generate Assets in Priority Order**:
   - Start with Scene 1 (mountain)
   - Test Scene 1 before moving to Scene 2
   - Scene 2 MUST align with Scene 1 final frame

5. **Deliver Assets**:
   - Place in `public/assets/scenes/` folder
   - Use exact filenames from specifications
   - Run quality checklist for each asset
   - Notify when ready for integration

### For Claude (Code Implementation)

**Waiting State**: Asset generation in progress

**Trigger to Start**: User confirms "Assets are ready" or places files in delivery folder

**First Task**: Build ScrollOrchestrator infrastructure and test with Scene 1 asset

**Incremental Integration**: Test each scene individually before moving to next

**Final Delivery**: Complete scroll-driven experience matching reference video

---

## Success Criteria

The implementation is successful when:

✅ User can scroll through entire page with viewport pinned
✅ Scroll position directly controls all animations (scrub forward/backward)
✅ Mountain scene rotates and morphs into island based on scroll
✅ Ship moves diagonally across stormy sky based on scroll
✅ All text overlays fade in/out at correct scroll positions
✅ Scene transitions are smooth crossfades (no hard cuts)
✅ Performance maintains 60 FPS on modern hardware
✅ Experience matches the visual breakdown document expectations
✅ Build completes with no errors

---

## Contact Points

**Questions During Asset Generation?**
- Refer to quality checklists in each spec document
- Check reference materials section for visual guidance
- Ask for clarification on any ambiguous requirements

**Asset Review Before Full Implementation?**
- Submit Scene 1 first for approval
- Get feedback before generating remaining scenes
- Iterate on quality/style before bulk generation

**Ready to Proceed?**
- Confirm: "Assets for Scene X are ready for integration"
- Claude will begin implementation on that scene
- Incremental delivery is acceptable (don't wait for all assets)

---

## Estimated Total Timeline

**Best Case** (parallel work + efficient workflow):
- Asset Generation: 15-20 hours (you)
- Code Implementation: 35-40 hours (Claude, after assets ready)
- **Total**: 50-60 hours

**Realistic Case** (sequential work + iterations):
- Asset Generation: 25-30 hours (you, with revisions)
- Code Implementation: 40-45 hours (Claude, with testing/refinement)
- **Total**: 65-75 hours

**Conservative Case** (learning curve + quality iterations):
- Asset Generation: 30-40 hours (you)
- Code Implementation: 45-50 hours (Claude)
- **Total**: 75-90 hours

---

## Current Status: Phase 1 - Asset Generation Ready ✅

All specification documents are complete. You have everything needed to begin generating visual assets.

**Recommended**: Start with Scene 1 (Mountain) and deliver it for integration testing before generating the remaining scenes. This allows for early feedback on visual quality and technical approach.

**When you're ready**: Place `mountain-hero-4k.mp4` (or `.glb`) in the delivery folder and notify for integration to begin.
