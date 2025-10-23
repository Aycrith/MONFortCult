# Asset Optimization Status — Oct 22

## Summary
- V8 engine GLB reduced from 69.1 MB → 3.4 MB via `gltf-transform optimize` (meshopt + WebP textures). Optimized copy lives at `public/assets/3dmodel/Engine/v8_motorbike_engine_optimized.glb` and is now referenced by the ship/engine scene.
- WebGL mountain scene now adapts particle counts and texture sampling quality to device capabilities, reuses cached textures, and caps anisotropy to keep GPU uploads predictable on low-power hardware.
- Engine showcase scene gained ACES tone mapping tweaks, per-frame exposure smoothing, and composer-based bloom for higher-quality highlights without excessive overdraw.

## Delivery Guidance
- **High tier (desktop / GPU ≥ 4 GB):**
  - Use optimized GLB as-is; renderer pixel ratio up to 1.8×.
  - Bloom strength ramps to ~1.9 during highlight beats for cinematic sheen.
- **Mid tier (laptops, tablets):**
  - Pixel ratio clamped ~1.4×; bloom strength eased to ~1.3.
  - Cloud particle count trimmed (~6–8), anisotropy ≤ 4.
- **Low tier / fallback (mobile, iGPU with ≤4 threads):**
  - Pixel ratio pinned ≤1.2×, bloom softens to ≤1.0.
  - Cloud textures limited to first 80 PNG cards, opacity reduced to lessen overdraw.
  - Renderer requests `powerPreference: 'low-power'`.
  - Engine animation falls back to slow pivot if GLB clips missing playback channels.

## Next Conversion Targets
- Batch convert `public/assets/clouds` and `public/assets/atmosphere` plates to `.webp` or `.ktx2` (Basis Universal) in a build step to trim transfer size by 40–60 %.
- Generate 1024px/2048px mip chains for hero atmosphere cards and load variants based on media queries.
- Add `navigator.connection?.effectiveType` heuristics if further bandwidth gating is required.

## Operational Notes
- Original (unoptimized) engine GLB retained for reference; swap back by reverting `MODEL_PATH` if needed.
- Texture cache persists across re-mounts to avoid repeat downloads; cache clear handled automatically on hard reload.
- Existing lint warnings (`react-hooks/exhaustive-deps`) remain unchanged and should be triaged separately.
