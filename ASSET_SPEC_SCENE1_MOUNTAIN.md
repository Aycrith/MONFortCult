# Asset Specification: Scene 1 - Mountain Hero View

## Overview
This is the opening hero scene of the Montfort landing page. It establishes a dark, cinematic, immense mountain environment that immediately immerses the user. This scene serves two purposes:
1. **Static Hero View** (0-1% scroll): Initial impression, establishes brand presence
2. **Animated Rotation Sequence** (1-30% scroll): Camera orbits mountain while text morphs

---

## Technical Specifications

### Option A: Pre-rendered Video Sequence (Recommended)
- **Resolution**: 3840 x 2160 (4K)
- **Aspect Ratio**: 16:9
- **Frame Rate**: 30 FPS minimum (60 FPS preferred for smooth scrubbing)
- **Duration**: 20-30 seconds
- **Format**: MP4 (H.264 codec) or WebM (VP9 codec)
- **File Size Target**: 15-25 MB (with aggressive compression for web)
- **Looping**: Seamless loop capability (first and last frames should match)
- **Alpha Channel**: Not required (full opaque background)

### Option B: Three.js 3D Model
- **Model Format**: .glb or .gltf
- **Polygon Count**: 50K-150K triangles (optimized for real-time)
- **Textures**: 4K diffuse map, 2K normal map, 2K roughness map
- **Lighting**: Baked lighting preferred for performance
- **File Size Target**: 10-20 MB total (model + textures)

---

## Visual Composition Requirements

### Camera Specifications

#### Starting Position (Hero View - 0% scroll)
- **Camera Position**: Frontal view of mountain peaks
- **Angle**: Slightly tilted upward (looking up at peaks from mid-mountain perspective)
- **Focal Point**: Main peak centered, occupying upper 60% of frame
- **Horizon Line**: Lower third of frame
- **Field of View**: 45-50° (cinematic, not too wide)

#### Ending Position (30% scroll - transition to island)
- **Camera Position**: Orbital movement completed, ~30° left rotation from start
- **Vertical Tilt**: Slightly higher angle (additional 10-15° upward tilt)
- **Reveal**: New mountain facets visible on right side of frame
- **Smooth Motion**: Constant angular velocity (no easing in video, will be controlled by scroll)

### Camera Movement Characteristics
- **Type**: Orbital rotation (camera moves around static mountain geometry)
- **Axis**: Primary rotation around vertical Y-axis (left-to-right)
- **Secondary Motion**: Subtle upward tilt (pitch increase)
- **Distance**: Camera distance from mountain should remain constant (no zoom)
- **Path**: Smooth arc, no sudden direction changes

---

## Lighting Requirements

### Primary Light Source
- **Type**: Single directional light (simulates full moon or early dawn)
- **Position**: Upper left, slightly behind camera (10 o'clock position)
- **Intensity**: High contrast - creates dramatic shadows
- **Color Temperature**: Cool white (5500-6500K), slight blue tint acceptable

### Shadow Characteristics
- **Snow Highlights**: Extremely bright, almost white (#f0f5f8 to #ffffff)
- **Crevice Shadows**: Deep, dark blue/navy (#0a1220 to #1a2530)
- **Mid-tones**: Blue-grey transition (#3a4a5a to #6a7a8a)
- **Contrast Ratio**: High (8:1 or greater between highlights and shadows)

### Atmospheric Lighting
- **Ambient Occlusion**: Strong in crevices and overhangs
- **Subsurface Scattering**: Minimal (snow is mostly opaque)
- **Specular Highlights**: Sharp on ice/snow surfaces
- **Rim Lighting**: Subtle edge lighting on mountain ridges

---

## Environment & Atmosphere

### Skybox
- **Base Color**: Deep navy blue (#0d1a2e to #1a2840)
- **NOT Pure Black**: Must have visible texture and variation
- **Gradient**: Subtle gradient from darker at top to slightly lighter at horizon
- **Stars**: Optional - sparse, subtle star field acceptable (not required)

### Cloud Layers
- **Quantity**: 3-5 distinct cloud layers
- **Appearance**: Soft-edged, wispy, dark grey/navy clouds
- **Opacity**: Semi-transparent (30-60% opacity)
- **Movement**: Independent parallax motion from right to left
  - **Layer 1 (Farthest)**: Speed 0.3x (slowest)
  - **Layer 2 (Mid)**: Speed 0.6x
  - **Layer 3 (Nearest)**: Speed 1.0x (fastest)
- **Position**: Concentrated in upper 40% of frame, some wisps at mid-height
- **Scale**: Large, atmospheric clouds (not small puffs)

### Depth & Atmospheric Perspective
- **Foreground Mountains**: Sharp detail, high contrast
- **Mid-ground**: Slightly softer, reduced contrast
- **Background Peaks**: Atmospheric haze, blue tint, lower contrast
- **Depth Cue**: Atmospheric scattering increases with distance

---

## Mountain Geometry Details

### Peak Characteristics
- **Style**: Photorealistic alpine peaks (reference: Matterhorn, Mont Blanc, K2)
- **Texture**: Heavy snow coverage with exposed rock on steep faces
- **Jaggedness**: High detail, complex silhouette, sharp ridgelines
- **Scale**: Massive, imposing presence (viewer should feel small)

### Surface Details
- **Snow Texture**: Varied - smooth snowfields, windswept cornices, crevasses
- **Rock Exposure**: Dark grey/black rock visible on vertical faces (20-30% of surface)
- **Ice Features**: Blue ice in crevasses, seracs, ice cliffs
- **Micro-detail**: Snow ripples, sastrugi patterns, avalanche debris

### Geometry Complexity
- **Silhouette**: Complex, irregular outline against sky
- **Multi-peak Composition**: 2-3 major peaks visible, multiple sub-peaks
- **Layering**: Clear foreground, mid-ground, background mountain separation

---

## Color Palette

### Primary Colors
- **Snow Highlights**: `#f0f5f8`, `#ffffff` (cool white)
- **Snow Mid-tones**: `#c5d5e0`, `#a8b8c8` (blue-grey)
- **Deep Shadows**: `#0a1220`, `#1a2530`, `#2a3540` (navy to dark blue-grey)
- **Skybox**: `#0d1a2e`, `#1a2840` (deep navy)
- **Clouds**: `#2a3a4a`, `#3a4a5a` (dark grey with blue tint)
- **Exposed Rock**: `#1a1a1a`, `#2a2a2a` (dark grey/black)

### Accent Colors
- **Ice Blue**: `#4a6a8a` (in crevasses and ice features)
- **Atmospheric Haze**: `#3a4a5a` with low opacity (distance fog)

---

## Additional Elements

### Light Beam Scanning Effect (Optional)
If possible to include in video, otherwise will be added as separate layer:
- **Type**: Vertical beam of white light
- **Width**: 100-200px at 4K resolution
- **Height**: Full screen height
- **Opacity**: 20-30% (subtle, ethereal)
- **Animation**: Sweeps from left to right across mountain surface during scroll (10-30% range)
- **Blur**: Heavy blur/soft edges (50-100px feather)
- **Color**: Pure white `#ffffff`

### Particle Effects (Optional)
- **Snow Drift**: Sparse, slow-moving snow particles in foreground
- **Quantity**: 20-50 particles visible at any time
- **Size**: 2-5px
- **Opacity**: 30-60%
- **Movement**: Gentle downward drift with horizontal sway

---

## Camera Animation Timing (For Video Option)

### Keyframe Breakdown (30-second video)

| Time | Scroll % | Camera Rotation | Camera Tilt | Notes |
|------|----------|-----------------|-------------|-------|
| 0:00 | 0% | 0° | 0° | Hero view - static composition |
| 0:03 | 1% | 1° | 0.3° | Animation begins (scroll start) |
| 0:10 | 10% | 10° | 3° | Text morph: MONTFORT → TRADING |
| 0:15 | 15% | 15° | 5° | Mid-transition |
| 0:20 | 20% | 20° | 8° | Text morph: TRADING → CAPITAL |
| 0:25 | 25% | 25° | 12° | Approaching island morph |
| 0:30 | 30% | 30° | 15° | Final position, ready for island transition |

**Important**: Video should have **NO easing** - constant velocity throughout. Easing will be controlled by scroll interpolation in code.

---

## Reference Materials

### Visual References
- **Mont Blanc at Night**: Dark, dramatic mountain photography
- **Matterhorn Winter**: Sharp peak silhouette examples
- **Cinematic Mountain Scenes**: "The Revenant", "Everest" (2015 film)
- **Skybox Reference**: Clear winter night sky, deep blue tones

### Existing Asset (If Applicable)
Check project: `C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\mountains`
- Evaluate existing mountain assets for potential upscaling/enhancement
- Maintain visual consistency with any existing approved imagery

---

## Export Settings

### For Video Format
```
Codec: H.264
Container: MP4
Resolution: 3840x2160
Frame Rate: 60 FPS
Bitrate: 20-30 Mbps (VBR, 2-pass encoding)
Color Space: sRGB
Chroma Subsampling: 4:2:0
Profile: High
Level: 5.1
```

### For 3D Model Format
```
Format: .glb (binary GLTF)
Textures: Embedded in .glb file
Compression: Draco mesh compression enabled
Normal Maps: OpenGL format (Y+)
Texture Resolution: 4096x4096 (diffuse), 2048x2048 (normal/roughness)
```

---

## Quality Checklist

Before submitting final asset, verify:
- [ ] Resolution is exactly 3840x2160 pixels
- [ ] Camera movement is smooth with no juddering
- [ ] Lighting creates strong highlights and deep shadows
- [ ] Cloud layers have independent motion (if video)
- [ ] Skybox is navy blue, NOT pure black
- [ ] Mountain silhouette is complex and detailed
- [ ] Color palette matches specifications
- [ ] File size is under 25 MB
- [ ] First and last frames are similar (for potential looping)
- [ ] No visible compression artifacts in shadows or highlights
- [ ] Aspect ratio is exactly 16:9

---

## Delivery
Place final asset in:
```
C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\scenes\
```

**Filename**: `mountain-hero-4k.mp4` (video) or `mountain-hero.glb` (3D model)

**Notification**: Ping when asset is ready for integration testing.

---

## Notes for Implementation
Once asset is delivered, it will be integrated into:
1. `MountainScene.tsx` component
2. Scroll-linked playback (scroll position maps to video time or camera rotation)
3. WebGL shader system (if 3D model) for advanced effects
4. Text overlay system (MONTFORT branding centered over scene)

**Estimated integration time**: 2-4 hours after asset delivery
