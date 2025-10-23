# Testing Checklist | Cinematic Enhancements

## 🧪 Quick Test Guide

### Start Dev Server
```powershell
npm run dev
```
Open: http://localhost:3000

---

## ✅ Scene 1: Camera Orbit + Clouds

### Camera Orbit Animation
**What to look for:**
- [ ] Camera rotates smoothly during initial scroll (0-30% progress)
- [ ] Mountain reveals new angles on the right side
- [ ] Camera tilts upward slightly as it rotates
- [ ] Motion is smooth and continuous (no jerking)
- [ ] Distance from mountain remains constant

**How to test:**
1. Scroll slowly through Scene 1
2. Watch the mountain edges - new peaks should appear on right
3. Verify smooth 60 FPS (check DevTools Performance)

**Expected behavior:**
- Start: Frontal mountain view
- Middle: Partial rotation visible
- End (30%): 30° rotated, new facets visible

### Multi-Layer Clouds
**What to look for:**
- [ ] Clouds move at 3 different speeds (visible parallax)
- [ ] Clouds are dark grey/navy (not bright white)
- [ ] Clouds concentrated in upper portion of screen
- [ ] Clear depth perception (foreground/mid/background)
- [ ] Smooth opacity transitions

**How to test:**
1. Focus on individual cloud formations
2. Notice different movement speeds during scroll
3. Verify darkened appearance matches stormy atmosphere

**Expected behavior:**
- Farthest clouds: Slowest movement (0.3x)
- Mid clouds: Medium movement (0.6x)
- Nearest clouds: Fastest movement (1.0x)

---

## ✅ Scene 4: Ship Wake Effects

### Water Foam Trail
**What to look for:**
- [ ] V-shaped wake pattern behind ship
- [ ] 8 foam particles visible
- [ ] Progressive fade from bright (near ship) to dim (far back)
- [ ] Subtle pulsing animation
- [ ] Blue-white glow effect

**How to test:**
1. Scroll to Scene 4 (ship scene)
2. Look behind cargo ship for foam trail
3. Notice V-pattern spreading out
4. Verify smooth 60 FPS maintained

**Expected behavior:**
- Wake appears immediately behind ship
- Forms realistic V-pattern
- Particles fade progressively
- Subtle animation (not distracting)

---

## 🔍 Performance Checks

### Frame Rate
**Target:** 60 FPS sustained

**How to check:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Start recording
4. Scroll through all scenes slowly
5. Stop recording
6. Check FPS graph (should be flat at 60)

**Acceptable:**
- Sustained 60 FPS during scroll
- Brief dips to 55-58 FPS acceptable
- No prolonged drops below 50 FPS

### Memory Usage
**How to check:**
1. DevTools → Performance Monitor
2. Watch "JS Heap Size" during scroll
3. Should be stable (no continuous growth)

**Red flags:**
- ❌ Heap size continuously growing
- ❌ Sudden memory spikes
- ❌ Memory not releasing after scroll

---

## 🐛 Common Issues

### Issue: Camera rotation not visible
**Possible causes:**
- Cache not cleared
- Dev server needs restart
- Browser extension interference

**Solution:**
```powershell
# Kill dev server (Ctrl+C)
npm run dev
# Hard refresh browser (Ctrl+Shift+R)
```

### Issue: Clouds too bright
**Expected:** Dark grey/navy (#2a3a4a to #3a4a5a)
**Check:** CSS filter should include `brightness(0.6)`

### Issue: No ship wake
**Possible causes:**
- Scene 4 not reached (scroll further)
- Wake opacity too low for display
- Ship image not loaded

**Solution:**
- Verify ship image loads: `/assets/Scenes/Asset_4_Ship_sprite2.png`
- Check browser console for errors

---

## 📊 Browser Testing

### Recommended Browsers
1. **Chrome/Edge** (Primary) - Best WebGL support
2. **Firefox** - Verify shader compatibility
3. **Safari** - Test on macOS (if available)

### Per-Browser Checklist
- [ ] Camera orbit smooth
- [ ] Clouds render correctly
- [ ] Ship wake visible
- [ ] 60 FPS maintained
- [ ] No console errors

---

## 🎯 Quality Benchmarks

### Excellent ⭐⭐⭐⭐⭐
- Smooth 60 FPS throughout
- All effects visible and working
- No visual glitches
- Professional polish evident

### Good ⭐⭐⭐⭐
- 55-60 FPS (minor drops)
- All effects working
- Rare visual glitches
- Quality acceptable

### Needs Work ⭐⭐⭐
- Below 50 FPS sustained
- Effects not visible
- Frequent glitches
- Performance issues

---

## 🚀 Quick Commands

### Development
```powershell
npm run dev          # Start dev server
npm run build        # Production build test
```

### Browser
```
F12                  # Open DevTools
Ctrl+Shift+R         # Hard refresh
Ctrl+Shift+C         # Inspect element
```

### Verification
```powershell
# Check for errors
npm run build

# Should output:
# ✓ Compiled successfully
# ✓ Checking validity of types
# Route (app)  Size  First Load JS
# ○ /          165 kB    317 kB
```

---

## 📝 Test Report Template

```markdown
## Test Date: [DATE]
## Browser: [Chrome/Firefox/Safari] [Version]
## Device: [Desktop/Laptop] [Specs]

### Scene 1 - Camera Orbit
- Camera rotation: [✅/❌]
- Smooth motion: [✅/❌]
- New angles revealed: [✅/❌]
- FPS: [60/55/50]

### Scene 1 - Clouds
- Multi-layer parallax: [✅/❌]
- Dark appearance: [✅/❌]
- Depth perception: [✅/❌]
- FPS: [60/55/50]

### Scene 4 - Ship Wake
- Wake visible: [✅/❌]
- V-pattern formed: [✅/❌]
- Progressive fade: [✅/❌]
- FPS: [60/55/50]

### Performance
- Overall FPS: [60/55/50]
- Memory stable: [✅/❌]
- No errors: [✅/❌]

### Issues Found
[List any issues]

### Overall Rating
[⭐⭐⭐⭐⭐ / ⭐⭐⭐⭐ / ⭐⭐⭐]
```

---

## ✅ Sign-Off Criteria

**Ready for production if:**
- ✅ All 3 enhancements visible and working
- ✅ 55+ FPS sustained across scenes
- ✅ No console errors or warnings
- ✅ Visual quality matches expectations
- ✅ No memory leaks during extended use

**Needs attention if:**
- ❌ Any enhancement not working
- ❌ FPS below 50 for extended periods
- ❌ Console errors present
- ❌ Visual glitches or artifacts
- ❌ Memory continuously growing

---

## 🎬 Expected Results Summary

### Scene 1
- **Camera:** Smooth 30° orbit with 15° upward tilt
- **Clouds:** 3 distinct layers with dark navy appearance
- **Performance:** 60 FPS sustained

### Scene 4
- **Wake:** 8-particle V-pattern foam trail
- **Appearance:** Blue-white glow with progressive fade
- **Performance:** 60 FPS sustained

### Overall
- **Quality:** Cinematic, professional polish
- **Performance:** No degradation from enhancements
- **Experience:** Enhanced immersion and visual appeal

---

**Happy Testing!** 🧪✨

If all checks pass, the landing page is ready for production deployment! 🚀
