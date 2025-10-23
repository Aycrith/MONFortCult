# Asset Specification: Scene 4 - Ship Journey Through Stormy Skies

## Overview
This scene represents the operational strength of Montfort's divisions (scroll range: 40-60% of total 1000vh). It features:
- **Background**: Dark, dramatic, stormy cloudscape (animated)
- **Foreground**: Large cargo container ship moving diagonally across screen
- **Interaction**: Ship position is 100% controlled by scroll position (top-right at 40% → bottom-left at 60%)
- **Text Overlays**: Four division taglines fade in/out sequentially over the scene

**Visual Mood**: Urgent, powerful, industrial - conveying maritime commerce in challenging conditions

---

## Asset Requirements Summary

You will create **TWO separate assets**:
1. **Background Cloudscape** (full-screen animated canvas)
2. **Ship Sprite** (transparent PNG with ship only)

These are separate because the ship needs independent positioning control via scroll.

---

## ASSET 1: Stormy Cloudscape Background

### Technical Specifications
- **Resolution**: 3840 x 2160 (4K)
- **Aspect Ratio**: 16:9
- **Format**: MP4 (H.264) or WebM (VP9)
- **Duration**: 15-20 seconds seamless loop
- **Frame Rate**: 30 FPS
- **File Size Target**: 12-18 MB
- **Alpha Channel**: Not required (opaque background)

### Visual Description

#### Cloud Characteristics
- **Type**: Cumulonimbus and stratocumulus (storm clouds)
- **Coverage**: 100% (no clear sky visible)
- **Density**: Thick, multi-layered, volumetric
- **Depth**: Multiple distinct cloud layers at different depths
- **Scale**: Large, imposing formations (viewer is below/within cloud layer)

#### Color Palette
- **Dark Greys**: `#2a3a4a`, `#3a4a5a` (majority of cloud mass)
- **Mid Greys**: `#4a5a6a`, `#5a6a7a` (areas with indirect light)
- **Highlights**: `#7a8a9a`, `#8a9aaa` (where diffused light breaks through)
- **Deep Shadows**: `#1a2a3a`, `#0a1a2a` (darkest recesses)
- **Accent Blue**: `#3a4a5a` with slight blue tint (atmospheric depth)

**Overall Tone**: Dark, moody, but NOT pitch black - must have visible detail and texture

#### Lighting
- **Type**: Diffused storm light from above
- **Direction**: No single source (overcast, scattered light)
- **Quality**: Soft, low-contrast within clouds
- **Intensity**: Low-moderate (stormy day, not night)
- **Flashes**: Optional very subtle lightning flashes (1-2 per loop, low intensity)

#### Composition
- **Upper 50%**: Darker, denser cloud ceiling
- **Lower 50%**: Slightly lighter, more movement (wind-swept bases)
- **Horizon Line**: Not visible (viewer is within cloud layer)
- **Gradient**: Subtle darkening toward top of frame

### Animation Requirements

#### Cloud Movement
- **Direction**: Multi-directional (creates chaos/turbulence)
  - **Layer 1 (Top)**: Drift right-to-left at 1.0x speed
  - **Layer 2 (Mid)**: Drift left-to-right at 0.6x speed (opposing layer 1)
  - **Layer 3 (Bottom)**: Drift right-to-left at 1.3x speed (fastest)
- **Speed**: Moderate-fast (wind-swept, urgent feeling)
- **Variation**: Clouds should churn and evolve, not just translate

#### Atmospheric Effects
- **Mist/Fog**: Subtle wisps drifting through mid-frame
- **Depth Parallax**: Closer clouds move faster than distant clouds
- **Turbulence**: Organic, swirling motion (not linear drift)
- **Lightning** (Optional):
  - 1-2 flashes per 15-second loop
  - Distant (within clouds, not foreground bolts)
  - Subtle glow behind cloud mass (no harsh flashes)
  - Duration: 0.2-0.3 seconds per flash

#### Loop Requirements
- **Seamless Loop**: First and last frames must match
- **Cloud Continuity**: No sudden cloud appearance/disappearance at loop point
- **Motion Continuity**: Cloud movement should not "skip" when looping

### Composition Considerations

#### Ship Path Clearance
The ship travels diagonally from top-right to bottom-left. Ensure:
- **Cloud Density**: Uniform across this diagonal path (no empty patches)
- **Contrast**: Sufficient contrast for light-colored ship to remain visible
- **Highlights**: Avoid bright highlights directly in ship path (prevents legibility)
- **Preferred Background**: Mid-grey (#4a5a6a) along diagonal path for optimal ship visibility

#### Text Overlay Areas
Division taglines will appear in center of frame. Ensure:
- **Center Frame**: Moderate contrast, not too dark or too light
- **Texture**: Subtle texture (not too busy) for text legibility
- **Preferred Background**: Dark-mid grey (#3a4a5a to #4a5a6a) in center 30% of frame

---

## ASSET 2: Cargo Ship Sprite

### Technical Specifications
- **Resolution**: 1400 x 600 pixels (ship only, not full scene)
- **Format**: PNG with transparency
- **Alpha Channel**: Required (transparent background)
- **File Size Target**: 500 KB - 1.5 MB
- **Orientation**: Ship facing left (bow on left, stern on right)
- **Angle**: Side profile view with slight 3/4 angle (5-10° from pure side view)

### Ship Characteristics

#### Ship Type
- **Type**: Large container cargo ship (not cruise ship, not tanker)
- **Length**: Represents ~300-400 meter vessel (Panamax or Post-Panamax class)
- **Containers**: Stacked containers visible on deck
- **Details**: Cranes, bridge superstructure, funnel, radar equipment

#### Visual Style
- **Realism**: Photorealistic or high-quality illustration
- **Lighting**: Consistent with stormy cloudscape (overcast daylight, no direct sun)
- **Weathering**: Industrial appearance, some weathering/rust acceptable
- **Scale Indicators**: Windows on bridge, container size, railings (for realism)

#### Color Scheme
- **Hull**: Dark grey or navy blue (`#2a3a4a` to `#3a4a5a`)
- **Containers**: Mixed colors (reds `#8a3a3a`, blues `#3a5a6a`, yellows `#8a7a3a`, greens `#3a5a3a`, whites `#d8e8f8`)
  - Variation creates visual interest
  - Avoid all-white or all-black containers (need mid-tone variation)
- **Superstructure**: White or light grey (`#d8e8f8` to `#e8f8ff`)
- **Deck**: Dark grey (`#3a4a4a`)
- **Accent Colors**: Red/orange safety features, blue lettering on containers

#### Lighting & Shading
- **Light Source**: Diffused overhead (consistent with cloudscape)
- **Shadows**: Soft, minimal contrast (overcast day)
- **Highlights**: Subtle highlights on upper surfaces (bridge, container tops)
- **No Direct Sun**: No harsh shadows or bright specular highlights
- **Ambient Occlusion**: Subtle shadows between containers and under crane overhangs

### Detail Level

#### Essential Details (Must Include)
- Bridge superstructure with visible windows
- Container stacks (4-6 containers high)
- Ship funnel/smokestack
- Cargo cranes (at least 2 visible)
- Railings on deck edges
- Waterline (ship hull meets water)

#### Optional Details (Nice to Have)
- Radar/communication equipment on bridge
- Lifeboat housings
- Anchor visible on bow
- Company markings/logos on containers or hull
- Rust streaks or weathering for realism

### Transparency & Alpha Channel

#### Background
- **Fully Transparent**: All pixels outside ship silhouette must be 100% transparent (alpha = 0)
- **No Halos**: Ensure no white or colored halos around ship edges
- **Clean Edges**: Anti-aliased edges with smooth alpha transition

#### Spray/Wake
- **Optional**: Subtle bow wave or spray at waterline
- **If Included**: Should have soft alpha falloff (gradual transparency)
- **Color**: White/grey foam with 30-60% opacity

### Size & Positioning

#### Ship Dimensions
- **Width**: 1200-1400 pixels (full length of ship)
- **Height**: 400-600 pixels (hull + superstructure + containers)
- **Aspect Ratio**: Approximately 2.5:1 (length : height)

#### Canvas Size
- **Total Canvas**: 1400 x 600 pixels
- **Ship Placement**: Centered within canvas
- **Padding**: 50-100 pixels transparent padding on all sides (allows for rotation without clipping)

#### Orientation
- **Bow (Front)**: Left side of image
- **Stern (Back)**: Right side of image
- **Angle**: Slight 3/4 view (5-10° rotation from pure side view) to show some depth

---

## Ship Movement Specifications (For Implementation)

### Scroll-Driven Path
The ship will be positioned via JavaScript based on scroll position:

| Scroll % | Ship Position X | Ship Position Y | Notes |
|----------|-----------------|-----------------|-------|
| 40% | Right: 10% | Top: 15% | Ship enters top-right |
| 45% | Right: 30% | Top: 28% | Quarter progress |
| 50% | Right: 50% | Top: 42% | Midpoint (center screen) |
| 55% | Right: 70% | Top: 56% | Three-quarter progress |
| 60% | Right: 90% | Top: 70% | Ship exits bottom-left |

**Path**: Linear diagonal from top-right (10%, 15%) to bottom-left (90%, 70%)

**Rotation**: Optional -5° to -10° rotation to align ship with diagonal path (bow points toward bottom-left)

### Ship Scale
- **Starting Size**: 800-1000px width on 4K screen (40% scroll)
- **Ending Size**: Same (no scaling during movement)
- **Constant**: Ship does not grow or shrink, only translates

---

## Quality Checklist

### Cloudscape Background
- [ ] Resolution is exactly 3840x2160 pixels
- [ ] Clouds are dark and stormy but with visible detail (not pure black)
- [ ] Multiple cloud layers with parallax movement
- [ ] Seamless loop with no visible seam at loop point
- [ ] Diagonal ship path area has mid-grey background for contrast
- [ ] Center frame is suitable for text overlay (not too busy)
- [ ] File size is under 18 MB
- [ ] No compression artifacts in cloud details

### Ship Sprite
- [ ] Resolution is 1400x600 pixels (or similar aspect ratio)
- [ ] Background is fully transparent (alpha channel)
- [ ] No color halos around ship edges
- [ ] Ship is facing left (bow on left, stern on right)
- [ ] Photorealistic or high-quality illustration style
- [ ] Lighting matches overcast cloudscape (no direct sun)
- [ ] Container colors are varied (not monochrome)
- [ ] Superstructure is light-colored for contrast against dark clouds
- [ ] File size is under 1.5 MB
- [ ] PNG compression is optimized

---

## Export Settings

### Cloudscape Background Video
```
Codec: H.264
Container: MP4
Resolution: 3840x2160
Frame Rate: 30 FPS
Bitrate: 18-22 Mbps (VBR, 2-pass encoding)
Color Space: sRGB
Chroma Subsampling: 4:2:0
Profile: High
Level: 5.1
Loop: Seamless (first frame = last frame)
```

### Ship Sprite PNG
```
Format: PNG
Resolution: 1400x600 (or proportional)
Color Mode: RGBA (with alpha channel)
Bit Depth: 8-bit per channel
Compression: PNG-8 or PNG-24 with alpha
Transparency: Full alpha channel (not indexed transparency)
```

---

## Delivery

Place final assets in:
```
C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\scenes\
```

**Filenames**:
- `ship-cloudscape-4k.mp4` (background storm clouds)
- `cargo-ship-sprite.png` (ship with transparency)

---

## Integration Notes

These assets will be used in:

1. **Background Video Canvas**: Looping cloudscape as pinned background layer
2. **Ship Positioning**: JavaScript calculates ship X/Y position based on scroll percentage (40-60%)
3. **Text Overlays**: Four division taglines fade in/out sequentially:
   - 40-45% scroll: "MONTFORT TRADING - Operating efficiently..."
   - 45-50% scroll: "MONTFORT CAPITAL - Providing liquidity..."
   - 50-55% scroll: "MONTFORT MARITIME - Connecting markets..."
   - 55-60% scroll: "MONTFORT GROUP - Integrated excellence..."
4. **Exit Transition**: At 60% scroll, ship fades out and entire scene crossfades to next (globe)

**Implementation Code Sample**:
```typescript
const scrollProgress = (currentScroll - 0.40) / (0.60 - 0.40) // 0.0 to 1.0
const shipX = lerp(10, 90, scrollProgress) // Right: 10% → 90%
const shipY = lerp(15, 70, scrollProgress) // Top: 15% → 70%
const shipOpacity = scrollProgress < 0.9 ? 1.0 : (1.0 - (scrollProgress - 0.9) / 0.1)
```

**Estimated integration time**: 2-3 hours after asset delivery

---

## Reference Materials

### Visual References
- **Storm Cloudscapes**: Time-lapse storm photography (not tornado/hurricane extremes)
- **Container Ships**: Maersk Triple-E class, CMA CGM megamax ships (side view photography)
- **Atmospheric Mood**: "The Perfect Storm" film, maritime documentary footage
- **Cloud Movement**: Underbelly views of storm systems (viewer below clouds)

### Tone
- Powerful, industrial, unstoppable
- Not catastrophic or disaster-oriented (operational strength, not survival)
- Professional maritime commerce in challenging conditions
