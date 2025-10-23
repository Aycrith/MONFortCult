# Persistent Canvas 3D Asset & Shader Specification

This document defines the deliverables required to replace the video fallbacks with a single scroll-driven WebGL timeline. Assets should be delivered in a way that allows us to interpolate between states in real time (morphs, opacity fades, material swaps) while staying performant in the browser.

---

## 1. Packaging & General Requirements

- **Delivery format**: glTF (`.glb`) preferred, with embedded or separate `.ktx2` textures. If multiple scenes are easier to manage, deliver as separate GLBs per scene (Hero, Maritime, Globe, Forest) while re-using shared assets (e.g., mountain base mesh).
- **Scale**: Use meters as units. Centre the world at origin with Y up. Camera rig and animation reference should assume a `PerspectiveCamera` with 45° FOV.
- **Orientation**: Positive Z forward, positive X to the right. Ensure forward-facing normals.
- **Mesh budgets**:
  - Mountain / Island: 120–180k tris (primary hero asset).
  - Ocean plane: ≤20k tris with higher tessellation near the shoreline for displacement.
  - Ship: ≤80k tris (hero asset but only visible mid-sequence).
  - Globe: ≤60k tris, keep pole topology clean for rotation.
  - Forest façades: ≤50k tris combined, can be cards with baked parallax occlusion.
- **Texture budgets**:
  - Use 4k for hero materials (mountain diffuse/normal/roughness), 2k for secondary elements.
  - Texture sets should be authored for PBR (BaseColor, Normal, Roughness, Metallic as needed). Packable channels should be combined (e.g., ORM maps).
  - Supply both high-quality source textures (EXR/PNG) and optimised web-ready versions (KTX2).
- **Animation**: Provide skeletal or morph animations only where specified. Otherwise the camera and object transforms will be driven from JavaScript/GSAP.
- **Shading pipeline assumption**: We will render in Three.js using custom `ShaderMaterial` or `MeshStandardMaterial` with shader overrides. Please expose named attributes/uniforms exactly as defined below.

---

## 2. Scene 1–2: Mountain → Island Morph

### Geometry
- Provide a **single mesh** with two vertex positions baked as morph targets:
  - `morphTarget0`: Snowy mountain (Scene 1).
  - `morphTarget1`: Exposed rocky island (Scene 2).
- Topology between morph targets must match exactly (identical vertex count & order).
- Include a surrounding **low-poly base**/platform that can remain hidden during Scene 1 but visible once the ocean rises.

### Materials & Textures
- Material name: `MountainBlendMaterial`.
- Texture inputs (4k):
  - `baseColor_snow.png`, `normal_snow.png`, `roughness_snow.png`.
  - `baseColor_rock.png`, `normal_rock.png`, `roughness_rock.png`.
- Optional: curvature or height masks to help blend detail in the shader.

### Shader Uniforms (to be animated via GSAP)
| Uniform | Type | Description |
|---------|------|-------------|
| `u_morphProgress` | float (0 → 1) | Blends vertex positions & interpolates texture sets. |
| `u_snowBlendMap` | sampler2D | Optional mask to keep snow in crevices during morph. |
| `u_lightDirection` | vec3 | Directional light for rim highlights (default: normalized). |
| `u_time` | float | For subtle breathing/noise (optional). |

### Additional Deliverables
- Provide an **ambient occlusion map** for both states to maintain depth after morphing.
- Include an `EnvironmentCapture` (HDR 4k lat-long) matching the misty daylight look.

---

## 3. Environment Transition: Mist Plane → Ocean Surface

### Mist / Fog Plane
- Geometry: Large quad with soft, noise-based alpha (tileable 2048 map).
- Material: `MistMaterial` using additive blending.
- Textures: `mist_noise.png` (greyscale), optional normal map for light streaks.
- Uniforms:
  - `u_opacity` (float 0 → 1).
  - `u_scrollNoiseOffset` (vec2) to animate subtle drift.

### Ocean Surface
- Geometry: Plane subdivided (minimum 200×200 grid near shoreline) to support displacement.
- Material: Custom shader with:
  - `u_waveTime` (float) for Gerstner/displacement animation.
  - `u_morphProgress` (float) to fade in from 0 → 1 matching the mountain morph.
  - `u_reflectionMap` (samplerCube) using the same HDRI.
  - `u_foamMask` (sampler2D) to highlight shore interaction.
- Textures: base color, normal (tileable 2048), foam mask.

---

## 4. Scene 4: Maritime Ship Pass

### Geometry & Rig
- Provide the ship as a separate GLB (`Ship.glb`) with:
  - Clean UVs, 2x 4k texture sets (Hull & Superstructure).
  - One level of detail variant (LOD1: 25k tris) to help on mobile.
- Pivot point centred for straightforward translation.
- Optional emissive map for running lights.

### Materials
- `ShipMaterial_Hull`, `ShipMaterial_Superstructure`.
- Maps: BaseColor, Normal, Roughness, Metallic, AmbientOcclusion.
- Support rim-emissive highlights (provide mask for windows/lighting).

### Animation Hooks
- No baked animation required. The ship will be moved along a curve in Three.js.
- Provide a **bounding box** reference so we can scale to viewport correctly.

---

## 5. Scene 5: Globe

### Geometry
- Sphere mesh with evenly distributed quad topology (avoid elongated poles).
- Optional secondary mesh for atmosphere halo.
- Provide location marker meshes/cards positioned at:
  - Geneva (`46.2044° N, 6.1432° E`)
  - Dubai (`25.2048° N, 55.2708° E`)
  - Singapore (`1.3521° N, 103.8198° E`)
- Alternatively, provide lat/long positions in a JSON metadata file if easier.

### Materials
- `GlobeSurfaceMaterial`:
  - Textures: `earth_albedo_4k`, `earth_normal_4k`, `earth_roughness_4k`.
  - Uniforms:
    - `u_dayNightMix` (float) to adjust lighting intensity.
    - `u_markerHighlight` (vec3) to control glow intensity per hub.
- `GlobeAtmosphereMaterial` (optional):
  - Uses additive blending with `u_opacity` and `u_glowStrength`.

---

## 6. Scene 6: Forest / Sustainability Environment

### Geometry
- Supply a layered forest composition:
  - Foreground tree cards with alpha.
  - Mid-ground volumetric fog card.
  - Background matte (can be still image projected onto card).
- Provide an optional **god-ray volume** (cone or box) to animate.

### Materials
- `ForestCardMaterial`: uses BaseColor + Alpha + Normal (2k).
- `GodRayMaterial`: vertex-colored mesh for light shafts with `u_opacity` and `u_time` noise.
- Dust particles can be provided as a sprite sheet (512px tileable) for GPU instancing.

---

## 7. Camera & Lighting Reference

To ensure we can match the MP4 timing:

- Supply a simple **camera path JSON** per scene (keyframe positions & look-at targets). This is optional but helpful for reusing your exact cinematography.
- Provide the **directional light vector** and intensity values used during look-dev.
- Include a **lookbook** (JPG/PNG) with annotated frames to validate morph transition moments (e.g., 0%, 50%, 100% scroll equivalents).

---

## 8. Validation Checklist

Before handing off the assets, please verify:

1. Morph target blend operates smoothly without popping or texture stretching.
2. Material names and uniform expectations match this document.
3. Textures are power-of-two, pre-converted to KTX2 (BasisU) in addition to source files.
4. Individual GLBs stay below ~30 MB after KTX2 compression (target <15 MB ideally).
5. Assets load correctly in https://gltf.report/ and https://sandbox.babylonjs.com/ with expected morphs/materials.

---

### Questions?
If any part of the spec conflicts with your asset pipeline or if additional passes are needed (e.g., particle sims, height map baking), let me know so we can adjust before you invest time in production.

