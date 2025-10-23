# Asset Specification: Scene 2 - Island/Maritime Transformation

## Overview
This is the **destination scene** of the mountain-to-island WebGL shader morph (scroll range: 25-30%). This transformation is the climax of Scene 2's scroll-driven narrative, where:
- Snowy mountain texture dissolves into rocky island texture
- Dark navy skybox brightens to overcast daylight
- Ocean water surface fades in at base
- Text overlay completes morph to "MONTFORT MARITIME"

**Critical Requirement**: This scene must be **compositionally aligned** with the final frame of the mountain scene (30° rotated camera position) to enable seamless WebGL texture morphing.

---

## Technical Specifications

### Primary Asset: Island Texture/Video
- **Resolution**: 3840 x 2160 (4K)
- **Aspect Ratio**: 16:9
- **Format Option 1**: Static image (PNG or JPEG) for WebGL texture
  - **Use Case**: If water animation is handled separately via shader
  - **File Size**: 2-5 MB (optimized JPEG at 90% quality)
- **Format Option 2**: Video loop (MP4 or WebM)
  - **Use Case**: If water animation is baked into video
  - **Duration**: 10-15 second seamless loop
  - **Frame Rate**: 30 FPS minimum
  - **File Size**: 8-15 MB
- **Alpha Channel**: Not required (opaque background)

### Secondary Asset: Water Surface (If Separate)
- **Resolution**: 3840 x 1080 (lower half of frame)
- **Format**: Video with alpha channel (WebM with VP9 codec)
- **Duration**: 10-15 second seamless loop
- **Transparency**: Alpha mask for blending with island
- **File Size**: 5-10 MB

---

## Visual Composition Requirements

### Camera Alignment (CRITICAL)
This scene's camera position MUST match the **final frame** of the mountain scene:

- **Horizontal Rotation**: 30° left from starting hero view
- **Vertical Tilt**: 10-15° upward from horizon
- **Field of View**: 45-50° (match mountain scene)
- **Focal Point**: Island centered, occupying similar screen space as mountain peaks
- **Horizon Line**: Lower third of frame (same as mountain scene)

**Compositional Overlap**:
- Island silhouette should roughly align with mountain peak silhouette
- Sky area should overlap smoothly (no sudden empty spaces appearing during morph)
- Water at base should align with mountain base mist/clouds

---

## Island Characteristics

### Geological Features
- **Type**: Rocky coastal island (not tropical, not sandy)
- **Scale**: Large, imposing presence (similar visual weight to mountain)
- **Texture**: Rugged grey/brown rock formations
- **Vegetation**: Minimal - some green/brown grasses on upper surfaces (not lush)
- **Coastline**: Irregular, with rock outcroppings and small cliffs
- **Erosion**: Weathered, natural-looking coastal erosion patterns

### Rock Textures
- **Primary Color**: Medium-dark grey (#5a6a7a to #7a8a9a)
- **Variation**: Brown tones (#6a5a4a), green moss patches (#4a5a3a)
- **Surface Detail**: Cracks, stratification layers, lichen patches
- **Weathering**: Smooth on exposed faces, rough in protected areas
- **Highlight Tone**: Lighter grey (#9aaaba) where light hits
- **Shadow Tone**: Dark grey (#3a4a5a) in crevices

### Silhouette & Shape
- **Complexity**: Moderately complex (not as jagged as mountain, but not simple dome)
- **Peak Count**: 1-2 prominent high points
- **Profile**: Irregular but rounded (erosion-smoothed edges)
- **Scale Indicators**: Visible rock stratification, size relative to waves

---

## Skybox Requirements

### Base Characteristics
- **Type**: Overcast daylight (marine climate)
- **Base Color**: Light blue-grey (#b8c8d8 to #d8e8f8)
- **Cloud Coverage**: 60-80% cloud cover (mostly cloudy, not completely overcast)
- **Brightness**: Moderate-bright (daylight, but diffused through clouds)

### Cloud Details
- **Type**: Stratocumulus and stratus layers
- **Color**: Light grey (#c8d8e8) to white (#f0f8ff)
- **Edge Definition**: Soft edges, some defined cloud masses
- **Distribution**: More clouds in upper frame, lighter toward horizon
- **Movement** (if video): Slow drift right-to-left (consistent with mountain scene)

### Atmospheric Perspective
- **Horizon Haze**: Light atmospheric haze where sky meets water
- **Color Shift**: Slight warm tint near horizon (#d8e0e8)
- **Depth**: Multiple cloud layers at different depths (parallax effect if video)

---

## Ocean/Water Surface

### Water Appearance
- **State**: Moderate sea state (not calm, not stormy)
- **Wave Height**: 0.5-1.5 meters (visible but not dramatic)
- **Color Base**: Dark blue-green (#3a5a6a)
- **Highlights**: White foam on wave crests (#e8f8ff)
- **Reflections**: Island and sky reflected with moderate clarity
- **Transparency**: Opaque (deep ocean, not shallow water)

### Water Animation (If Video)
- **Wave Direction**: Toward shore (island base)
- **Wave Speed**: Natural (1.5-2 second period between crests)
- **Foam Trails**: White foam dispersing behind wave crests
- **Reflections**: Distorted reflections of island and sky that shift with waves
- **Movement**: Continuous, organic motion (no unnatural repeating patterns)

### Water Surface Coverage
- **Frame Coverage**: Lower 40-50% of frame
- **Shoreline**: Water meets island base naturally (no hard edge)
- **Spray**: Optional subtle spray/mist at coastline contact points
- **Whitecaps**: Scattered across water surface (10-20% coverage)

---

## Lighting Specifications

### Primary Light Source
- **Type**: Diffused daylight (sun behind clouds)
- **Direction**: Upper left, approximately 45° above horizon
- **Quality**: Soft shadows (no hard edges)
- **Intensity**: Moderate (overcast day, not bright sun)
- **Color Temperature**: Cool daylight (6000-6500K)

### Island Lighting
- **Highlights**: Light grey (#9aaaba) on upper facing surfaces
- **Mid-tones**: Medium grey (#7a8a9a) on vertical faces
- **Shadows**: Dark grey (#4a5a6a) in recesses and north-facing areas
- **Contrast**: Moderate (3:1 to 5:1, much less than mountain scene's 8:1)
- **Ambient Light**: Strong ambient fill from overcast sky (minimal pure shadows)

### Water Lighting
- **Specular Highlights**: Diffused highlights on wave crests (not sharp sun reflections)
- **Subsurface**: Dark blue-green in troughs (#2a4a5a)
- **Foam**: Bright white (#f0f8ff) but not pure white
- **Reflection Intensity**: 30-50% of sky brightness in calm areas

---

## Color Palette

### Island Colors
- **Rock Base**: `#5a6a7a`, `#6a7a8a`, `#7a8a9a` (grey spectrum)
- **Rock Variation**: `#6a5a4a` (brown), `#4a5a3a` (green moss)
- **Highlights**: `#9aaaba`, `#aabaca` (light grey)
- **Shadows**: `#3a4a5a`, `#4a5a6a` (dark grey)

### Sky Colors
- **Sky Base**: `#b8c8d8`, `#c8d8e8`, `#d8e8f8` (light blue-grey)
- **Clouds**: `#c8d8e8`, `#e0e8f0`, `#f0f8ff` (light grey to white)
- **Horizon**: `#d8e0e8` (warm tint)

### Water Colors
- **Deep Water**: `#2a4a5a`, `#3a5a6a` (dark blue-green)
- **Wave Crests**: `#5a7a8a`, `#6a8a9a` (lighter blue)
- **Foam**: `#e8f8ff`, `#f0f8ff` (white with blue tint)
- **Reflections**: Muted versions of sky/island colors at 50% saturation

---

## Compositional Alignment Guide

### Overlay Grid for WebGL Morphing
To ensure seamless morphing from mountain to island:

**Vertical Alignment**:
- **Top 20%**: Sky only (both scenes)
- **20-40%**: Upper island peaks align with mountain peaks
- **40-60%**: Mid-island body aligns with lower mountain faces
- **60-100%**: Water surface aligns with mountain base mist/clouds

**Horizontal Alignment**:
- **Left 30%**: Sky/water (negative space in both scenes)
- **30-70%**: Primary island mass (aligns with mountain mass)
- **Right 30%**: Sky/water with distant island features (aligns with distant peaks)

### Critical Alignment Points
1. **Highest point** of island should align with highest visible mountain peak
2. **Waterline** position should match mountain cloud base vertical position
3. **Overall mass distribution** should be similar (left-heavy, right taper)
4. **Negative space** (sky/water) should overlap to prevent "holes" during morph

---

## WebGL Morphing Considerations

### Texture Requirements
- **Same Resolution**: Must be exactly 3840x2160 (match mountain scene)
- **Same Aspect Ratio**: 16:9 (no cropping or distortion during morph)
- **Color Space**: sRGB (match mountain scene)
- **Orientation**: Match mountain scene camera angle precisely

### Morphing Compatibility
- **Edge Handling**: Island silhouette edges should have similar complexity to mountain edges
- **Contrast Distribution**: Avoid extreme contrast differences in same spatial areas
- **Color Shift**: Greys/browns should overlap with mountain's grey/blue palette
- **Brightness**: Similar overall exposure (avoid drastic brightness jumps)

### Testing Checkpoint
Before finalizing, create a 50/50 blend preview:
```
blended_image = (mountain_final_frame × 0.5) + (island_frame × 0.5)
```
The result should look like a coherent image, not chaotic noise. If it looks jarring, adjust island composition.

---

## Animation Details (If Video)

### Water Animation Timing
- **Loop Duration**: 10-15 seconds
- **Seamless Loop**: First and last frames must match exactly
- **Wave Continuity**: No sudden wave appearance/disappearance at loop point
- **Reflection Stability**: Reflections should not "jump" at loop

### Cloud Animation (Optional)
- **Movement**: Slow right-to-left drift (match mountain scene cloud direction)
- **Speed**: 20-30 pixels per second at 4K resolution
- **Parallax**: Closer clouds move faster than distant clouds
- **Opacity Variation**: Subtle opacity shifts as clouds overlap

---

## Maritime Logo Integration Area

### Logo Placement (For Reference)
The white wave-themed Montfort Maritime logo will be overlaid at:
- **Position**: Left of "MONTFORT MARITIME" text
- **Vertical**: Centered with text (middle 20% of frame)
- **Horizontal**: Left 30% of frame

**Asset Consideration**: Ensure this area has moderate contrast and isn't too busy:
- Background in logo area should be: diffused sky or calm water
- Avoid: Complex rock textures, bright highlights, or dark shadows directly behind logo
- Preferred: Neutral blue-grey background (#b8c8d8 to #d8e8f8)

---

## Quality Checklist

Before submitting final asset, verify:
- [ ] Resolution is exactly 3840x2160 pixels
- [ ] Camera angle matches mountain scene final frame (30° rotation, 10-15° tilt)
- [ ] Island silhouette aligns compositionally with mountain peaks
- [ ] Water surface is animated smoothly (if video) with no loop seams
- [ ] Skybox is bright overcast daylight (contrast to mountain's dark navy)
- [ ] Color palette matches specifications (greys, blues, greens)
- [ ] Overall brightness is moderate (daylight, not sunset/sunrise)
- [ ] No compression artifacts in water reflections or rock details
- [ ] File size is under 15 MB (video) or 5 MB (static image)
- [ ] 50/50 blend test with mountain scene looks coherent
- [ ] Logo placement area (left-center) has clean background

---

## Export Settings

### For Static Image
```
Format: JPEG or PNG
Resolution: 3840x2160
Color Space: sRGB
JPEG Quality: 90% (if JPEG)
PNG Compression: 9 (if PNG)
```

### For Video Format
```
Codec: H.264
Container: MP4
Resolution: 3840x2160
Frame Rate: 30 FPS
Bitrate: 15-20 Mbps (VBR, 2-pass encoding)
Color Space: sRGB
Chroma Subsampling: 4:2:0
Profile: High
Level: 5.1
```

### For Water Layer (Separate Alpha Video)
```
Codec: VP9
Container: WebM
Resolution: 3840x1080
Frame Rate: 30 FPS
Alpha Channel: Enabled
Bitrate: 10-15 Mbps
```

---

## Delivery

Place final asset(s) in:
```
C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\scenes\
```

**Filenames**:
- `island-maritime-4k.jpg` (static image) OR
- `island-maritime-4k.mp4` (video with baked water) OR
- `island-maritime-base-4k.jpg` + `water-surface-4k.webm` (split assets)

---

## Integration Notes

This asset will be used in:
1. **WebGL Shader Morphing**: Fragment shader blend from mountain texture to island texture
2. **Skybox Crossfade**: Simultaneous sky color shift from navy (#0d1a2e) to daylight (#b8c8d8)
3. **Text Overlay**: "MONTFORT MARITIME" centered with wave logo on left
4. **Scroll Mapping**: Morph occurs during 25-30% scroll range (smooth transition over 5% scroll)

**Shader Uniform Timeline** (for reference):
```
Scroll 25%: morphProgress = 0.0 (100% mountain)
Scroll 26%: morphProgress = 0.2 (80% mountain, 20% island)
Scroll 27%: morphProgress = 0.4 (60% mountain, 40% island)
Scroll 28%: morphProgress = 0.6 (40% mountain, 60% island)
Scroll 29%: morphProgress = 0.8 (20% mountain, 80% island)
Scroll 30%: morphProgress = 1.0 (100% island)
```

**Estimated integration time**: 3-5 hours after asset delivery (includes shader development and testing)
