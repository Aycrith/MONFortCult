# Asset Specification: Scene 6 - Sustainability & CSR (Forest Scene)

## Overview
This scene represents Montfort's commitment to environmental and social responsibility (scroll range: 75-90% of total 1000vh). It features:
- **Primary Element**: Lush green forest viewed from ground level, looking upward toward canopy
- **Key Visual Feature**: Volumetric light rays ("god rays") streaming through canopy
- **Atmosphere**: Serene, organic, hopeful
- **Depth Effect**: Shallow depth of field (sharp foreground, blurred background)
- **Overlays**: Sustainability content (Ethics, ESG tabs, initiatives) added via code

**Visual Mood**: Peaceful, natural, responsible - conveying environmental stewardship and organic growth

---

## Asset Requirements Summary

You will create **TWO assets**:
1. **Forest Background Image** (4K static photograph or render)
2. **Optional: Dust Particle Sprite** (small PNG, can be generated via code if not provided)

**Note**: Volumetric light rays (god rays) can be baked into the background image OR generated separately via WebGL shader. Recommendation: **bake into background** for guaranteed quality.

---

## ASSET 1: Forest Background Image

### Technical Specifications
- **Resolution**: 3840 x 2160 (4K)
- **Aspect Ratio**: 16:9
- **Format**: JPEG (high quality)
- **File Size Target**: 4-8 MB
- **Depth of Field**: Shallow (sharp foreground, blurred background)
- **Orientation**: Portrait perspective looking upward through forest canopy

### Visual Composition

#### Camera Angle & Framing
- **Viewpoint**: Ground level, human perspective (5-6 feet above ground)
- **Direction**: Looking upward at 45-60° angle toward canopy
- **Focal Depth**: Sharp focus in mid-ground (tree trunks 10-20 feet away)
- **Background**: Canopy and sky heavily blurred (bokeh effect)
- **Foreground**: Slightly soft (shallow depth of field)

#### Forest Characteristics
- **Forest Type**: Temperate deciduous or mixed forest (NOT tropical rainforest, NOT coniferous)
- **Season**: Late spring or summer (lush, vibrant green)
- **Tree Species**: Varied - oak, beech, maple, or similar (recognizable broad-leaf trees)
- **Canopy Coverage**: 70-80% (allows light to penetrate, not completely dense)
- **Undergrowth**: Minimal visible at this angle (mostly tree trunks and canopy)

#### Lighting - Volumetric Light Rays (God Rays)

**Critical Feature**: This is the defining visual element of the scene.

##### Ray Characteristics
- **Quantity**: 5-8 distinct light beams visible
- **Source**: Sun breaking through canopy gaps above
- **Direction**: Diagonal, from upper-left or upper-center downward
- **Angle**: 30-45° from vertical (not straight down)
- **Visibility**: Strong, clearly defined rays (high atmospheric particulate visibility)

##### Ray Appearance
- **Color**: Warm golden white (#f8f4e8 to #fff8e0)
- **Intensity**: Bright but not overblown (visible detail within rays)
- **Edge Definition**: Soft edges with visible volume (not laser-sharp)
- **Internal Detail**: Visible dust/particulate swirling within rays
- **Falloff**: Rays fade naturally into surrounding forest (gradual opacity decrease)

##### Ray Distribution
- **Primary Ray**: One dominant, thick beam in upper-right quadrant (strongest focal point)
- **Secondary Rays**: 2-3 medium beams in left and center areas
- **Tertiary Rays**: 2-4 subtle beams in background (adds depth)
- **Spacing**: Varied spacing (not evenly distributed - natural, organic placement)

##### Atmospheric Effect
- **Visibility**: Strong visible light scattering (dusty/misty forest air)
- **Haze**: Subtle atmospheric haze throughout scene (not thick fog)
- **Glow**: Soft glow where rays hit tree trunks and leaves
- **Particles**: Visible dust motes suspended in light beams (can be subtle in static image)

#### Tree & Foliage Details

##### Tree Trunks
- **Quantity**: 3-5 major tree trunks visible
- **Position**: Scattered throughout frame (not symmetrical)
- **Size**: Varied diameters (300mm - 800mm / 12-32 inches)
- **Texture**: Realistic bark texture - rough, detailed
- **Color**: Dark brown to grey-brown (#3a2a1a to #4a3a2a)
- **Lighting**: Catch light from god rays on one side (rim lighting effect)

##### Canopy & Leaves
- **Density**: Moderate-dense (allows light penetration)
- **Leaf Color**: Vibrant green spectrum:
  - Highlight leaves (in sun): `#8aaa5a`, `#9aba6a` (yellow-green)
  - Mid-tone leaves: `#5a7a3a`, `#6a8a4a` (medium green)
  - Shadow leaves: `#3a4a2a`, `#4a5a3a` (dark green)
- **Leaf Detail**: Individual leaves visible in focus areas (not flat mass)
- **Backlighting**: Leaves hit by sun should have translucent glow (light passing through)
- **Blur**: Background canopy heavily blurred with bokeh effect

##### Depth Layers
- **Layer 1 (Foreground - Soft Focus)**: Lower 20% of frame, subtle blur
- **Layer 2 (Mid-ground - Sharp Focus)**: Middle 40% of frame, highest detail
- **Layer 3 (Background - Heavy Blur)**: Upper 40% of frame, strong bokeh

#### Sky/Canopy Background
- **Visibility**: Sky partially visible through canopy gaps
- **Sky Color**: Soft blue-white (#d8e8f8 to #e8f8ff) - heavily blurred
- **Brightness**: Very bright (source of light rays)
- **Bokeh**: Circular or hexagonal bokeh highlights where sky shows through leaves
- **Coverage**: 20-30% of upper frame shows sky through gaps

---

### Color Palette

#### Greens (Primary Palette)
- **Sunlit Leaves**: `#8aaa5a`, `#9aba6a`, `#aaca7a` (yellow-green, vibrant)
- **Mid-tone Foliage**: `#5a7a3a`, `#6a8a4a`, `#7a9a5a` (medium green)
- **Shadow Foliage**: `#3a4a2a`, `#4a5a3a`, `#5a6a4a` (dark green)
- **Mossy Understory**: `#4a5a2a`, `#5a6a3a` (olive green)

#### Browns (Tree Trunks & Bark)
- **Bark Highlights**: `#6a5a4a`, `#7a6a5a` (light brown, where light hits)
- **Bark Mid-tones**: `#4a3a2a`, `#5a4a3a` (medium brown)
- **Bark Shadows**: `#2a1a0a`, `#3a2a1a` (dark brown/black)

#### Light Rays (God Rays)
- **Ray Core**: `#fff8e0`, `#fffae8` (warm white, brightest)
- **Ray Mid**: `#f8f4e8`, `#f0eca0` (golden white)
- **Ray Edge**: `#e8e0c8` (soft beige, fading)

#### Sky & Background
- **Sky**: `#d8e8f8`, `#e8f8ff` (soft blue-white, blurred)
- **Atmospheric Haze**: `#c8d8c8` with low opacity (green-tinted mist)

#### Accent Colors
- **Sunlit Bark**: `#8a7a6a` (warm brown where light hits)
- **Bokeh Highlights**: `#ffffff` at 50-70% opacity (bright spots)

---

### Depth of Field Specifications

#### Focus Zone
- **Sharp Focus**: 10-20 feet from camera (mid-ground tree trunks)
- **Aperture Simulation**: f/2.8 to f/4 (shallow depth of field)
- **Bokeh Style**: Smooth, circular or slightly hexagonal (natural lens bokeh)

#### Blur Zones
- **Foreground Blur**: Subtle blur on nearest elements (0-10 feet)
- **Background Blur**: Heavy blur on canopy and sky (20+ feet)
- **Bokeh Highlights**: Out-of-focus sky patches create bright circular bokeh spots

---

### Lighting Specifications

#### Primary Light Source (Sun)
- **Position**: Upper-left or upper-center, above canopy
- **Quality**: Directional, hard light (creates defined shadows)
- **Color Temperature**: Warm daylight (5000-5500K with slight warm bias)
- **Intensity**: Bright (creates high contrast between rays and shadows)

#### Secondary Light (Ambient)
- **Source**: Diffused light bouncing through canopy
- **Quality**: Soft, scattered light
- **Intensity**: Low-moderate (prevents pure black shadows)
- **Color**: Green-tinted (light filtered through leaves)

#### Lighting Ratios
- **God Ray Core**: 100% (brightest element)
- **Sunlit Leaves**: 70-80%
- **Sunlit Bark**: 50-60%
- **Mid-tone Foliage**: 30-40%
- **Shadow Areas**: 10-20%
- **Deep Shadows**: 5-10% (not pure black)

---

### Atmospheric Effects

#### God Ray Volume
- **Scattering**: Strong Mie scattering (visible light shafts)
- **Particulate Matter**: Visible dust, pollen, mist within rays
- **Density**: High enough for strong ray visibility, not foggy
- **Falloff**: Natural decay along ray length

#### Atmospheric Haze
- **Type**: Subtle forest mist/humidity
- **Visibility**: Light haze in mid-ground, stronger in background
- **Color**: Slight green tint from chlorophyll (#c8d8c8)
- **Density**: 10-20% opacity overlay (subtle, not thick fog)

#### Dust Motes/Particles
- **Visibility**: Visible within god rays (optional in static image)
- **Quantity**: Sparse (20-50 particles visible)
- **Size**: Very small (1-3 pixels at 4K)
- **Movement**: N/A (static image - will be animated via code if needed)

---

### Composition Guidelines

#### Rule of Thirds
- **Primary God Ray**: Positioned along right vertical third line
- **Major Tree Trunk**: Positioned along left vertical third line
- **Canopy Gap (brightest)**: Upper horizontal third (creates visual interest)

#### Negative Space
- **Center Frame**: Relatively open (allows for text overlay)
- **Center-left Quadrant**: Preferred text overlay area (less detail, more uniform lighting)

#### Visual Flow
- **Eye Path**: God rays lead eye upward from mid-ground to canopy
- **Depth Cues**: Overlapping tree trunks create depth perception
- **Focal Point**: Primary god ray is strongest visual element

---

### Text Overlay Considerations

The following content will be overlaid on this scene:
- **Headlines**: "Ethics & Compliance", "Sustainable Energy Solutions", "Commitment to Equality"
- **ESG Tabs**: "Environmental", "Social", "Governance" (interactive buttons)
- **Icon Grids**: Multiple icon sets with descriptions
- **Photo Strip**: 3 photographs at bottom of scene

**Asset Requirement**: Ensure center and center-left areas have:
- Moderate contrast (not too bright or too dark)
- Subtle texture (not overly busy)
- Preferred background: Mid-tone green (#5a7a3a to #6a8a4a) with soft lighting
- Avoid: Bright god ray core, dark shadow areas, complex bark textures

---

## ASSET 2: Dust Particle Sprite (Optional)

### Technical Specifications
- **Resolution**: 64 x 64 pixels (single particle)
- **Format**: PNG with alpha channel
- **File Size**: <10 KB
- **Use Case**: Animated particles within god rays (added via Three.js)

### Visual Requirements
- **Shape**: Soft circular gradient (no hard edges)
- **Color**: White `#ffffff`
- **Opacity**: Radial gradient from 60% center to 0% edge
- **Size**: Fills 64x64 canvas with soft falloff
- **Style**: Simple, subtle (not distracting)

**Note**: If not provided, can be generated via code using radial gradient canvas.

---

## Quality Checklist

- [ ] Resolution is exactly 3840x2160 pixels
- [ ] Depth of field is present (sharp mid-ground, blurred background)
- [ ] God rays are clearly visible with strong atmospheric scattering
- [ ] 5-8 distinct light rays from canopy gaps
- [ ] Ray color is warm golden white (#f8f4e8 to #fff8e0)
- [ ] Tree trunks are realistic with detailed bark texture
- [ ] Foliage is vibrant green (late spring/summer tones)
- [ ] Canopy is 70-80% coverage (not too dense)
- [ ] Sky is visible through canopy gaps with bokeh effect
- [ ] Center-left area is suitable for text overlay (moderate contrast)
- [ ] Lighting creates rim lighting on tree trunks where rays hit
- [ ] Atmospheric haze is subtle (not thick fog)
- [ ] Color palette matches specifications (greens, browns, warm light)
- [ ] File size is under 8 MB
- [ ] No compression artifacts in bokeh or gradient areas

---

## Export Settings

### Forest Background Image
```
Format: JPEG
Resolution: 3840x2160
Quality: 92-95%
Color Space: sRGB
Chroma Subsampling: 4:2:0 (standard) or 4:4:4 (higher quality)
Progressive: Yes (faster web loading)
```

### Dust Particle Sprite (If Created)
```
Format: PNG
Resolution: 64x64
Color Mode: RGBA (with alpha channel)
Bit Depth: 8-bit per channel
Compression: PNG-8 or PNG-24 with alpha
```

---

## Delivery

Place final asset(s) in:
```
C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\scenes\
```

**Filenames**:
- `forest-godray-4k.jpg` (main forest background)
- `dust-particle.png` (optional particle sprite)

---

## Integration Notes

### Background Implementation
- **Static Image**: Forest background is pinned full-screen
- **Scroll Duration**: Visible during 75-90% scroll range (15% of total journey)
- **Transition In**: Crossfade from globe scene (3% scroll fade duration)
- **Transition Out**: Fade to white for footer (1% scroll fade duration)

### Particle System (Three.js)
If dust particles are animated via code:
```typescript
// Particle system configuration
const particleCount = 200
const particleSize = 3-8px (varied)
const particleColor = #ffffff (white)
const particleOpacity = 0.3-0.7 (varied)
const particleSpeed = 0.5-1.5 units/sec (slow upward drift)
const particleArea = Concentrated within god ray volumes
```

### Text Content Overlay
- **Ethics Section**: Top third of scene
- **ESG Tabs**: Center of scene (clickable tabs switch icon grids)
- **Initiative Cards**: Lower-center of scene
- **Photo Strip**: Bottom of scene (overlaps forest background slightly)

### Scroll-Linked Animations
- **Particles**: Slow upward drift (continuous, not scroll-linked)
- **Text Fade-ins**: Sequential appearance based on scroll position:
  - 75-77%: Ethics content fades in
  - 77-79%: ESG tabs and first icon set fade in
  - 79-82%: Initiative cards fade in
  - 82-85%: Photo strip slides up into view
  - 85-90%: All content remains visible

**Estimated integration time**: 2-3 hours after asset delivery (particle system, text overlays, scroll triggers)

---

## Reference Materials

### Visual References
- **God Ray Photography**: Search "forest god rays," "crepuscular rays in forest"
- **Depth of Field**: Search "bokeh forest photography," "shallow depth of field trees"
- **Lighting Style**: "Morning light through forest canopy," "volumetric lighting forest"
- **Color Grading**: Warm, natural green tones (not oversaturated, not desaturated)

### Example Search Terms
- "Sunbeams through forest canopy"
- "Volumetric light rays in woods"
- "Bokeh forest upward view"
- "God rays temperate forest"

### Tone
- Peaceful, serene, meditative
- Natural, organic, authentic
- Hopeful, growth-oriented
- Not dark or ominous (avoid "enchanted forest" or "mysterious woods" aesthetics)
- Conveys environmental stewardship and responsibility

---

## Technical Notes

### Bokeh Quality
- Use circular or slightly hexagonal bokeh (natural lens characteristic)
- Bokeh highlights should be smooth gradients, not hard circles
- Vary bokeh size based on distance (farther = larger bokeh)

### God Ray Rendering
If rendering in 3D software:
- Use volumetric lighting with participating media
- Enable atmospheric scattering (fog/mist with directional light)
- Adjust scattering density for strong ray visibility
- Add subtle noise to ray volume (prevents flat, artificial look)

If photographing:
- Shoot during morning (1-2 hours after sunrise) or late afternoon
- Increase atmospheric particulate with fog machine or natural mist
- Use long lens (85-135mm) for compression and strong bokeh
- Shoot at f/2.8-f/4 for shallow depth of field

### File Optimization
- Export at 92-95% JPEG quality (balances quality and file size)
- Use progressive JPEG encoding for faster web loading
- Test compression at different quality levels to find optimal balance
- Ensure no banding in sky/bokeh gradient areas
