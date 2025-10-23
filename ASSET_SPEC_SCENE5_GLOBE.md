# Asset Specification: Scene 5 - Global Presence (Earth Globe)

## Overview
This scene showcases Montfort's global footprint (scroll range: 60-75% of total 1000vh). It features:
- **Primary Element**: Realistic 3D Earth viewed from space
- **Focus Region**: Europe, Middle East, and North Africa (EMEA)
- **Animation**: Slow clockwise rotation
- **Atmosphere**: Professional, global, aspirational
- **Overlays**: Location markers with city labels (added via code, not in asset)

**Visual Mood**: Expansive, interconnected, sophisticated - conveying global reach and strategic positioning

---

## Implementation Approach

**Recommended**: Three.js sphere with texture maps (most flexible for web)
**Alternative**: Pre-rendered 4K video of rotating globe

This specification covers **both approaches** - choose based on your rendering capabilities.

---

## APPROACH A: Three.js Texture Maps (Recommended)

### Asset Requirements

You will create **THREE separate texture maps**:
1. **Earth Surface Texture** (Day map)
2. **Cloud Layer Texture** (Semi-transparent clouds)
3. **Optional: Normal Map** (Surface detail enhancement)

---

### TEXTURE 1: Earth Surface (Day Map)

#### Technical Specifications
- **Resolution**: 8192 x 4096 pixels (8K equirectangular)
- **Aspect Ratio**: 2:1 (for sphere UV mapping)
- **Format**: JPEG (high quality)
- **File Size Target**: 5-12 MB
- **Color Space**: sRGB
- **Projection**: Equirectangular (latitude/longitude grid)

#### Visual Requirements

##### Geographic Focus
- **Primary View**: Europe, North Africa, Middle East centered
- **Rotation Start**: 15°E longitude centered (shows Mediterranean, Western Europe, North Africa)
- **Visible Regions**:
  - Western Europe: UK, France, Spain, Germany, Italy
  - Eastern Europe: Poland, Greece, Turkey
  - North Africa: Morocco, Algeria, Egypt
  - Middle East: Saudi Arabia, UAE, Qatar
  - Partial Asia: Western Asia, Caucasus

##### Color Scheme & Styling
- **Oceans**: Deep navy blue (#0a1a3a to #1a2a4a) - darker than typical Earth maps
- **Continents**: Realistic Earth tones with moderate saturation
  - Land Base: Browns, greens, tans (#4a5a3a, #6a7a5a, #8a7a5a)
  - Deserts: Tan/beige (#9a8a6a, #aa9a7a)
  - Forests: Dark green (#3a4a2a, #4a5a3a)
  - Mountains: Grey/brown (#7a7a7a, #8a8a8a)
- **Ice Caps**: White/light grey (#d8e8f8, #e8f8ff)
- **Atmosphere**: Subtle blue atmospheric glow at horizon (added via shader, not texture)

##### Detail Level
- **Coastlines**: Highly detailed, accurate geography
- **Major Rivers**: Nile, Danube, Rhine visible
- **Mountain Ranges**: Alps, Atlas, Caucasus with elevation shading
- **Cities**: NOT marked on texture (will be added as overlays via code)
- **Political Borders**: Optional subtle lines (very low contrast, #5a6a7a)

##### Lighting (Baked into Texture)
- **Style**: Slight directional shading from upper-left
- **Contrast**: Moderate (not flat, but not overly dramatic)
- **Highlights**: Subtle highlights on mountain peaks
- **Shadows**: Gentle valley shadows
- **Overall**: Balanced lighting for consistent appearance during rotation

#### Geographic Accuracy
- Use NASA Blue Marble, Natural Earth, or similar authoritative base data
- Accurate country shapes and coastlines
- Realistic terrain elevation representation
- NO fictional landmasses or significant geographic distortions

---

### TEXTURE 2: Cloud Layer

#### Technical Specifications
- **Resolution**: 4096 x 2048 pixels (4K equirectangular)
- **Aspect Ratio**: 2:1 (for sphere UV mapping)
- **Format**: PNG with alpha channel
- **File Size Target**: 2-5 MB
- **Alpha Channel**: Required (semi-transparent clouds)
- **Projection**: Equirectangular (matches Earth texture)

#### Visual Requirements

##### Cloud Characteristics
- **Type**: Realistic Earth cloud formations (cumulus, cirrus, storm systems)
- **Coverage**: 30-50% of globe (not too sparse, not overcast)
- **Distribution**: Concentrated in:
  - Equatorial regions (ITCZ - Intertropical Convergence Zone)
  - Mid-latitude storm tracks (over Atlantic, Mediterranean)
  - Scattered formations elsewhere
- **Scale**: Varied - large storm systems, small cloud clusters

##### Cloud Appearance
- **Color**: White to light grey (#f0f8ff to #d8e8f8)
- **Opacity**: Variable per pixel (alpha channel)
  - Dense clouds: 70-90% opacity
  - Wispy clouds: 20-40% opacity
  - Clear areas: 0% opacity (fully transparent)
- **Edge Quality**: Soft, natural edges (not hard cutouts)
- **Texture**: Subtle internal texture variation (not flat white)

##### Geographic Distribution (EMEA Focus)
Since rotation shows Europe/MENA, include:
- Atlantic storm systems west of Europe
- Mediterranean scattered cumulus
- African Saharan dust patterns (subtle, low opacity)
- Arabian Peninsula clear areas (minimal clouds)

##### Animation Notes
This static texture will be rotated **independently** from Earth surface:
- Earth rotation speed: 1.0x
- Cloud rotation speed: 1.1x (slightly faster, creates relative motion)
- Creates realistic atmospheric movement

---

### TEXTURE 3: Normal Map (Optional)

#### Technical Specifications
- **Resolution**: 4096 x 2048 pixels
- **Aspect Ratio**: 2:1 (for sphere UV mapping)
- **Format**: PNG or JPEG
- **File Size Target**: 2-4 MB
- **Color Space**: Linear (normal map standard)
- **Type**: Tangent-space normal map (OpenGL format, Y+)

#### Visual Requirements
- **Purpose**: Adds surface detail bump mapping (mountains, valleys)
- **Intensity**: Subtle (not exaggerated)
- **Features**: Mountain ranges, ocean floor trenches (subtle), ice cap texture
- **Color**: Normal map blue/purple base (#8080ff standard neutral)

---

## APPROACH B: Pre-rendered Video (Alternative)

### Technical Specifications
- **Resolution**: 3840 x 2160 (4K)
- **Aspect Ratio**: 16:9
- **Format**: MP4 (H.264) or WebM (VP9)
- **Duration**: 30-40 seconds (full rotation)
- **Frame Rate**: 30 FPS
- **File Size Target**: 15-25 MB
- **Alpha Channel**: Not required

### Visual Requirements

#### Composition
- **Globe Size**: Earth occupies ~70% of frame height (centered)
- **Background**: Deep space black (#000000) with subtle star field
- **Camera**: Static position (globe rotates, camera does not move)
- **Angle**: Slight tilt (15-20° from pure equatorial view) to show both hemispheres

#### Rotation
- **Axis**: Earth's actual rotation axis (23.5° tilt from vertical)
- **Direction**: Clockwise when viewed from space (east to west)
- **Speed**: Slow, smooth (360° over 30-40 seconds)
- **Starting Position**: 15°E longitude centered (Europe/MENA)
- **Ending Position**: Returns to starting position (seamless loop)

#### Lighting
- **Sun Position**: From right side of frame (3 o'clock position)
- **Terminator Line**: Day/night line visible on left-center of globe
- **Dayside**: Brightly lit, Earth tones visible
- **Nightside**: Subtle city lights (optional, very subtle)
- **Atmosphere**: Blue atmospheric glow around limb (edge of planet)

#### Cloud Layer
- **Included**: Animated clouds drifting over surface
- **Movement**: Independent from surface rotation (slight differential speed)
- **Opacity**: 50-70% (Earth surface visible beneath)
- **Realism**: Based on actual satellite cloud patterns

---

## Color Palette (Both Approaches)

### Earth Surface Colors
- **Ocean Deep**: `#0a1a3a`, `#1a2a4a` (dark navy)
- **Ocean Shallow**: `#2a3a5a`, `#3a4a6a` (lighter near coasts)
- **Land Temperate**: `#4a5a3a`, `#5a6a4a` (green/brown)
- **Land Desert**: `#9a8a6a`, `#aa9a7a` (tan/beige)
- **Land Forest**: `#3a4a2a`, `#4a5a3a` (dark green)
- **Mountains**: `#7a7a7a`, `#8a8a8a` (grey)
- **Ice Caps**: `#d8e8f8`, `#e8f8ff` (white/light blue)

### Atmosphere & Space
- **Atmospheric Glow**: `#4a6a9a` with gradient to transparent
- **Space Background**: `#000000` (pure black)
- **Stars** (if video): `#ffffff` at 20-40% opacity, very small (1-2px)

### Clouds
- **Cloud White**: `#f0f8ff`, `#ffffff`
- **Cloud Grey**: `#d8e8f8`, `#e0e8f0` (denser clouds)

---

## Rotation & Animation Specifications

### For Three.js Texture Approach

#### Earth Rotation
```typescript
// Rotation speed (degrees per second)
const earthRotationSpeed = 0.5 // Slow, majestic rotation
const cloudRotationSpeed = 0.55 // Slightly faster than Earth

// Scroll-linked rotation (optional)
const rotationAngle = scrollProgress * 60 // Rotates 60° over scene duration
```

#### Camera Position
```typescript
const cameraDistance = 2.5 // Units from sphere center (radius = 1.0)
const cameraAngle = { x: -0.3, y: 0, z: 0 } // Slight downward tilt
```

### For Video Approach

#### Timeline
| Time | Rotation | Visible Region |
|------|----------|----------------|
| 0:00 | 0° | Europe/MENA centered |
| 0:10 | 90° | Middle East/Asia |
| 0:20 | 180° | Asia/Pacific (Europe rotating out of view) |
| 0:30 | 270° | Americas |
| 0:40 | 360° | Returns to Europe/MENA (seamless loop) |

---

## Location Markers (Added via Code)

The following cities will have **glowing markers** added as overlays (not in texture):

### Primary Hubs (Large Markers)
- **Geneva, Switzerland** (46.2°N, 6.15°E) - Headquarters
- **Dubai, UAE** (25.2°N, 55.27°E) - Maritime Hub
- **Singapore** (1.35°N, 103.82°E) - Trading Hub

### Secondary Locations (Small Markers)
- London, UK
- New York, USA
- Hong Kong
- Doha, Qatar
- Mumbai, India

**Marker Style**: White glowing dots with city name labels (added via HTML/CSS overlay, not in 3D asset)

---

## Quality Checklist

### For Texture Maps
- [ ] Earth texture is exactly 8192x4096 pixels (8K equirectangular)
- [ ] Cloud texture is exactly 4096x2048 pixels (4K equirectangular)
- [ ] Both textures use equirectangular projection (2:1 aspect ratio)
- [ ] Cloud texture has proper alpha channel (semi-transparent)
- [ ] Geographic features are accurate (coastlines, major rivers, mountains)
- [ ] Europe/MENA region is centered at 15°E longitude
- [ ] Ocean colors are dark navy (#0a1a3a to #1a2a4a)
- [ ] No visible seams or distortions at texture edges (0° and 360° longitude)
- [ ] File sizes are optimized (Earth: <12MB, Clouds: <5MB)
- [ ] Normal map (if included) uses OpenGL format (Y+)

### For Video
- [ ] Resolution is exactly 3840x2160 pixels
- [ ] Globe rotates smoothly with no juddering
- [ ] Rotation is seamless loop (first frame = last frame)
- [ ] Earth occupies ~70% of frame height (centered)
- [ ] Starting position shows Europe/MENA clearly
- [ ] Atmospheric glow is visible around planet limb
- [ ] Cloud layer is semi-transparent (Earth surface visible beneath)
- [ ] File size is under 25 MB
- [ ] No compression artifacts in space or on Earth surface

---

## Export Settings

### Earth Surface Texture (JPEG)
```
Format: JPEG
Resolution: 8192x4096
Quality: 90-95%
Color Space: sRGB
Chroma Subsampling: 4:4:4 (highest quality)
Progressive: Yes
```

### Cloud Layer Texture (PNG)
```
Format: PNG
Resolution: 4096x2048
Color Mode: RGBA (with alpha channel)
Bit Depth: 8-bit per channel
Compression: PNG-24 with alpha
Interlacing: Adam7 (optional)
```

### Normal Map (PNG or JPEG)
```
Format: PNG (preferred) or JPEG
Resolution: 4096x2048
Color Mode: RGB (no alpha needed)
Color Space: Linear (not sRGB for normal maps)
```

### Video (If Using Pre-rendered Approach)
```
Codec: H.264
Container: MP4
Resolution: 3840x2160
Frame Rate: 30 FPS
Bitrate: 20-25 Mbps (VBR, 2-pass encoding)
Color Space: sRGB
Chroma Subsampling: 4:2:0
Profile: High
Level: 5.1
Loop: Seamless (first frame = last frame)
```

---

## Delivery

Place final assets in:
```
C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\scenes\
```

### For Texture Approach
**Filenames**:
- `earth-surface-8k.jpg` (Earth day map texture)
- `earth-clouds-4k.png` (Cloud layer with alpha)
- `earth-normal-4k.png` (Normal map, if included)

### For Video Approach
**Filename**:
- `globe-rotation-4k.mp4`

---

## Integration Notes

### Three.js Implementation (Texture Approach)
```typescript
// Sphere geometry
const sphereGeometry = new THREE.SphereGeometry(1, 64, 64)

// Earth material with textures
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture, // earth-surface-8k.jpg
  normalMap: normalTexture, // earth-normal-4k.png (optional)
})

// Cloud layer (separate sphere, slightly larger radius)
const cloudMaterial = new THREE.MeshStandardMaterial({
  map: cloudTexture, // earth-clouds-4k.png
  transparent: true,
  opacity: 0.7,
})

// Rotation animation
earthMesh.rotation.y += 0.0005 // Slow rotation
cloudMesh.rotation.y += 0.00055 // Slightly faster
```

### Text Overlay Content
The following text will appear over the globe scene:
- **Headline**: "ESTABLISHED IN THE WORLD'S LEADING MARKETS"
- **Subheading**: "Operating across 50+ countries with strategic hubs in key financial centers"
- **Location Markers**: Glowing dots with city labels

### Scroll Range
- **60% scroll**: Scene fades in, globe begins rotating
- **67.5% scroll**: Midpoint, location markers animate in
- **75% scroll**: Scene fades out, transitions to forest scene

**Estimated integration time**: 3-4 hours after asset delivery (Three.js setup, lighting, location markers)

---

## Reference Materials

### Visual References
- **NASA Blue Marble**: High-resolution Earth imagery
- **Google Earth**: 3D globe rendering style
- **Earth from ISS**: Realistic atmospheric glow references
- **Satellite Imagery**: Cloud patterns and formations

### Tone
- Professional, aspirational, expansive
- Sophisticated global brand presence
- Not overly sci-fi or futuristic (grounded, realistic)
- Conveys interconnectedness and strategic positioning

---

## Technical Notes

### Equirectangular Projection
- Latitude/longitude grid maps to rectangular image
- Top edge = 90°N (North Pole), Bottom edge = 90°S (South Pole)
- Left edge = -180°W, Right edge = +180°E (wraps around)
- Distortion is natural at poles (stretched), minimal at equator

### UV Mapping
- U (horizontal): Longitude (-180° to +180°)
- V (vertical): Latitude (-90° to +90°)
- Sphere will automatically map texture using UV coordinates

### File Optimization
- Use progressive JPEG for Earth texture (faster web loading)
- Compress PNG cloud layer with tools like TinyPNG or pngquant
- Test texture load times on typical connections (target: <3 seconds for all textures)
