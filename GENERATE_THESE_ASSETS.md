# 🎯 Assets to Generate (16:9 4K Priority List)

## Quick Reference: What to Generate Next

---

## ✅ COMPLETED

### 1. Forest Background ✓
- **Source:** Asset_6_Forest_Background.png
- **Output:** `Asset_6_Forest_Background16x9_Upscale.png` ✅ DONE
- **Status:** Implemented in ForestScene
- **Resolution:** 4K (3840x2160) 16:9

---

## 🔴 PRIORITY 1: CRITICAL - Generate Immediately

### 2. Cargo Ship (Scene 4)
- **Source File:** `Asset_spec_2_GTP_IMAGE_upscale.png`
- **Output Filename:** `Asset_spec_2_GTP_IMAGE_16x9_4K_Upscale.png`
- **Target Resolution:** 3840x2160 (4K UHD) or 2560x1440 (QHD)
- **Aspect Ratio:** 16:9
- **Format:** PNG with transparency (if possible)
- **Usage:** ShipScene cargo ship image
- **Notes:**
  - Center the ship in frame
  - Maintain stormy atmosphere
  - Ensure high detail on ship structure
  - Dark, moody colors (matching storm scene)

**Where to Place:**
```
Source: C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\Scenes\
Output: Asset_spec_2_GTP_IMAGE_16x9_4K_Upscale.png
```

**After Generation:**
```bash
# Copy to production directory
Copy to: public/assets/ship/cargo-ship-4k.png

# Update component
File: src/components/scenes/ShipScene.tsx
Line 270: Change path to "/assets/ship/cargo-ship-4k.png"
```

---

## 🟡 PRIORITY 2: IMPORTANT - Generate Second

### 3. Atmospheric Background (Scene 2)
- **Source File:** `Asset_4_cloudybackground2_upscaled.png`
- **Output Filename:** `Asset_4_cloudybackground2_16x9_4K_Upscale.png`
- **Target Resolution:** 3840x2160 (4K UHD)
- **Aspect Ratio:** 16:9 (wide cinematic)
- **Format:** PNG
- **Usage:** TextMorphScene atmospheric background
- **Notes:**
  - Wide panoramic cloudy atmosphere
  - Stormy, moody aesthetic
  - Suitable for full-screen background
  - Smooth gradient, no harsh edges

**Where to Place:**
```
Source: C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\Scenes\
Output: Asset_4_cloudybackground2_16x9_4K_Upscale.png
```

**After Generation:**
```bash
# Copy to production directory
Copy to: public/assets/backgrounds/cloudy-atmosphere-4k.png

# Update component
File: src/components/scenes/TextMorphScene.tsx
Line 283: Change path to 'url(/assets/backgrounds/cloudy-atmosphere-4k.png)'
```

---

### 4. Maritime Transformation Video (Scene 2)
- **Source File:** `Asset_2_IslandMountainHeroView2Upsacled.mp4`
- **Output Filename:** `Asset_2_IslandMountainHeroView2_16x9_4K_Upscale.mp4`
- **Target Resolution:** 3840x2160 (4K UHD) or 2560x1440 (QHD)
- **Aspect Ratio:** 16:9
- **Format:** MP4 (H.264 or H.265)
- **Usage:** TextMorphScene island transformation video
- **Notes:**
  - **FIRST CHECK:** Verify if current video is already 4K
  - Only re-generate if current version is lower than 2560x1440
  - Smooth island/mountain transformation
  - Ocean/water elements visible
  - Cinematic quality

**Where to Place:**
```
Source: C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\Scenes\
Output: Asset_2_IslandMountainHeroView2_16x9_4K_Upscale.mp4
```

**After Generation (if needed):**
```bash
# Copy to production directory
Copy to: public/assets/backgrounds/island-transformation-4k.mp4

# Update component
File: src/components/scenes/TextMorphScene.tsx
Line 298: Change path to "/assets/backgrounds/island-transformation-4k.mp4"
```

---

## ⚪ PRIORITY 3: OPTIONAL - Generate if Time Permits

### 5. Globe Earth Texture (Scene 5)
- **Source File:** `Asset_5_WorldMapTexture.png`
- **Output Filename:** `Asset_5_WorldMapTexture_8K_Equirectangular.png`
- **Target Resolution:** 8192x4096 (8K equirectangular)
- **Aspect Ratio:** 2:1 (NOT 16:9 - required for sphere mapping)
- **Format:** PNG
- **Usage:** GlobeScene Earth surface texture
- **Notes:**
  - **NOT 16:9** - Must be 2:1 equirectangular projection
  - Only generate if current texture appears low-res
  - Ensure proper equirectangular UV mapping
  - Preserve world geography accuracy

**Only Generate If:** Current globe appears pixelated or low-detail

---

## 📋 Generation Checklist

### Before Generation:
- [ ] Identify source file in `/Scenes/` directory
- [ ] Confirm target resolution (3840x2160 or 2560x1440)
- [ ] Verify aspect ratio (16:9 for backgrounds, 2:1 for globe)
- [ ] Check if transparency needed

### During Generation:
- [ ] Use highest quality upscaling model
- [ ] Preserve original colors and atmosphere
- [ ] Maintain composition and focal points
- [ ] Ensure no artifacts or blurriness

### After Generation:
- [ ] Verify file size (<50 MB for images, <200 MB for videos)
- [ ] Confirm resolution matches target
- [ ] Check aspect ratio is correct
- [ ] Preview on large display
- [ ] Save to `/Scenes/` directory with proper naming

### Deployment:
- [ ] Copy to production directory (ship/globe/backgrounds)
- [ ] Update component import path
- [ ] Test with `npm run dev`
- [ ] Build with `npm run build`
- [ ] Verify quality on 4K display

---

## 🎬 Video Generation Settings (if applicable)

### For Maritime Transformation Video:
```
Resolution: 3840x2160 (4K UHD)
Aspect Ratio: 16:9
Frame Rate: 30 fps (or 60 fps for ultra-smooth)
Codec: H.264 or H.265 (HEVC)
Bitrate: 20-40 Mbps
Format: MP4
Audio: None (muted)
```

---

## 📏 Resolution Reference

### Standard 4K Resolutions:
- **4K UHD:** 3840x2160 (16:9) - Recommended for all backgrounds
- **4K DCI:** 4096x2160 (17:9) - Cinema standard, not needed
- **QHD:** 2560x1440 (16:9) - Acceptable fallback if file size concerns

### Special Cases:
- **Globe textures:** 8192x4096 (2:1 equirectangular) - NOT 16:9
- **Vertical content:** 2160x3840 (9:16) - Not needed for this project

---

## 🚀 Quick Deployment Commands

### After generating each asset:

```bash
# 1. Verify file exists in Scenes directory
dir "C:\Users\camer\Desktop\JulesLandingPage\MONFortCult\public\assets\Scenes\Asset_spec_2_GTP_IMAGE_16x9_4K_Upscale.png"

# 2. Copy to production directory (use PowerShell)
Copy-Item "public/assets/Scenes/Asset_spec_2_GTP_IMAGE_16x9_4K_Upscale.png" "public/assets/ship/cargo-ship-4k.png"

# 3. Update component (see specific instructions above)

# 4. Test
npm run dev

# 5. Build
npm run build
```

---

## 📊 Summary

### **To Generate:**
1. ✅ Forest background - **DONE**
2. 🔴 Cargo ship image - **NEEDED** (Priority 1)
3. 🟡 Atmospheric background - **NEEDED** (Priority 2)
4. 🟡 Maritime video - **CHECK FIRST, then generate if needed** (Priority 2)
5. ⚪ Globe texture - **OPTIONAL** (Priority 3)

### **Target:**
- **2-3 assets** need immediate generation
- **1 asset** needs verification (may not need regeneration)
- **1 asset** already complete

### **Expected Time:**
- Cargo ship: ~30-60 minutes
- Atmospheric background: ~30-60 minutes
- Maritime video: ~1-2 hours (if needed)

**Total:** 1-3.5 hours of generation time

---

## ✅ Success Criteria

After generating and implementing 4K assets:
- [ ] No pixelation on 4K displays
- [ ] Consistent quality across all scenes
- [ ] Fast load times (<3s per scene)
- [ ] Professional cinematic quality
- [ ] All backgrounds are 16:9 aspect ratio
- [ ] Build completes successfully
- [ ] File sizes are reasonable

---

**Document Created:** 2025-10-20
**Last Updated:** After forest background implementation
**Status:** Ready for asset generation batch
