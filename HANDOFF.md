# ENGINE SCENE REDESIGN - Complete Overhaul 2025-10-23

## Status: ✅ ENGINE SCENE REDESIGNED - INDUSTRIAL AESTHETIC

**File**: `src/components/scenes/ShipScene.tsx`
**Issue**: Previous version was washed out, flat, and poorly composed
**Solution**: Complete redesign with industrial/gritty aesthetic, animation-driven camera
**Target**: Dramatic assembly sequence with workshop lighting and cinematic presentation

---

## Design Direction (User-Approved)
1. **Aesthetic**: Industrial/Gritty - Dark workshop vibe with dramatic shadows and rim lighting
2. **Presentation**: Floating/Isolated - Engine suspended in dramatic void with no platform
3. **Animation Focus**: Assembly/disassembly animations are the HERO feature

---

## Complete Redesign Implementation

### 1. Scene Environment & Atmosphere ✅
- Pure black background (`0x000000`) for dramatic industrial void
- Added subtle exponential fog (`FogExp2`, density 0.015) for volumetric light rays
- Removed all platform geometry - engine floats in pure space
- Added DOM gradients: warm industrial vignette + bottom workshop glow

### 2. Industrial Dramatic Lighting System ✅
**Replaced 3 basic lights with 5-light industrial setup:**
- **Ambient**: Very low (0.15 intensity) for deep blacks and high contrast
- **Warm Key Light**: Orange industrial lamp (`0xff9955`, 3.5 intensity) from top-left
- **Cool Rim Light**: Cyan edge definition (`0x4da6ff`, 2.0 intensity) from behind-right
- **Accent Spotlight**: Warm white underlight (`0xfff5e6`, 2.5 intensity) for chrome reflections
- **Fill Light**: Subtle cool fill (`0x88aacc`, 0.4 intensity) for shadow detail

### 3. Animation-Driven Camera System ✅
**Three distinct phases synchronized with assembly:**
- **Phase 1 (0.0-0.3)**: Wide establishing shot
  - Orbit: 10.0-9.0 units radius
  - Height: 5.5-5.0 units (high angle)
  - FOV: 52-50° (wide view to see disassembled parts)
- **Phase 2 (0.3-0.7)**: DRAMATIC PUSH-IN during assembly
  - Orbit: 9.0→4.5 units (smooth ease)
  - Height: 5.0→2.5 units (descending)
  - FOV: 50→42° (tightening)
- **Phase 3 (0.7-1.0)**: Hero angle on completed engine
  - Orbit: 4.5-3.8 units (very close)
  - Height: 1.8 units (low angle looking up)
  - FOV: 40° (tight, dramatic)

### 4. Material Enhancements ✅
- **Metalness**: Increased to 0.85-0.9 range (raw industrial metal)
- **Roughness**: 0.35-0.65 range (varied for worn/polished areas)
- **EnvMapIntensity**: 1.8 (strong reflections)
- **Emissive**: Subtle hot metal glow (`0x331100`, 0.08 intensity) on metal parts

### 5. Post-Processing Overhaul ✅
- **Bloom Restored**: Threshold 0.6, strength 0.7-0.9 (selective highlights only)
- **Dynamic Exposure**: Lerps from 0.7 (dark at start) → 1.45 (bright at assembly)
- **Dynamic Bloom Strength**: Increases during assembly for drama
- **Vignette**: Warm-tinted (`rgba(20,10,5,0.45)`) at 50% opacity
- **Bottom Gradient**: Warm workshop glow from below

### 6. Scale & Positioning ✅
- Engine scale: 24.0 units (up from 18.0)
- Centered positioning with minimal Y offset
- Camera orbit dramatically closer (3.8-10.0 units vs previous 8.0-12.0)

### 7. Overlay Adjustments ✅
**File**: `src/components/overlays/ShipOverlay.tsx`
- Reduced background darkness: `rgba(5,8,15,0.25)` → `transparent` gradient
- Allows industrial 3D scene to shine through
- Text remains readable with shadows

---

## Technical Details

### Engine Model
- Path: `/assets/3dmodel/Engine/v8_motorbike_engine_optimized.glb`
- Baked animations: Assembly/disassembly controlled by scroll progress
- Animation mixer: `setTime()` driven by smoothed scroll progress
- Fallback: Simple Y-rotation if animations fail to load

### Camera Behavior
- Dynamic FOV updates every frame (`updateProjectionMatrix()`)
- Subtle breathing motion (drift: 0.05-0.08 units)
- Smooth easing during Phase 2 push-in for cinematic feel
- Looks at engine center with minimal vertical drift

### Performance
- Pixel ratio capped at 1.6 for high-performance, 1.1 for low-end devices
- Shadow map: 2048x2048 with PCF soft shadows
- Bloom optimized: Only catches highlights above 0.6 threshold
- Fog density kept very low to minimize performance impact

---

## Files Modified (This Session)
```
src/components/scenes/ShipScene.tsx           # Complete redesign
src/components/overlays/ShipOverlay.tsx       # Reduced overlay darkness
```

---

## Expected Results

### Visual Quality
- ✅ **Dramatic industrial aesthetic** with warm/cool lighting contrast
- ✅ **Clear engine visibility** with metallic shine and depth
- ✅ **Hero assembly sequence** - parts float → assemble → hero shot
- ✅ **Professional cinematic quality** matching Montfort brand

### User Experience
- **Scroll 0-30%**: See engine parts floating in void, wide camera view
- **Scroll 30-70%**: Watch parts dramatically assemble as camera pushes in
- **Scroll 70-100%**: Completed engine from low dramatic angle with glow

---

## Testing Checklist
- [ ] Verify engine is clearly visible (not washed out)
- [ ] Check assembly animation plays smoothly with scroll
- [ ] Confirm camera phases transition smoothly
- [ ] Validate industrial lighting creates depth and contrast
- [ ] Test on both high-performance and low-performance devices
- [ ] Verify text overlay remains readable
- [ ] Check FPS performance (should maintain 60fps on modern hardware)

---

## Dev Server
- Running on: `http://localhost:3000`
- Hot reload: Enabled (changes auto-refresh)
- FPS counter: Top-left corner for performance monitoring
