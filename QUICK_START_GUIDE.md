# ⚡ QUICK START IMPLEMENTATION GUIDE

## 🚀 Start Here - Immediate Actions

### Step 1: Install Dependencies (5 minutes)
```bash
cd c:/Users/camer/Desktop/JulesLandingPage/MONFortCult
npm install three-nebula@10.0.3 splitting@1.0.6 postprocessing@6.35.3
```

### Step 2: Copy Code Templates (Choose Priority)

#### 🔴 HIGH PRIORITY: Fix Cloud System (Solves Dark Blobs)
**File:** src/components/effects/VolumetricCloudLayer.tsx (new file)  
**Code:** See HERO_ENGINE_SCENE_ENHANCEMENTS.md lines 180-320  
**Time:** 30 minutes  
**Impact:** Restores atmospheric depth to hero scene

#### 🔴 HIGH PRIORITY: Hero Camera Keyframes
**File:** src/components/PersistentBackground.tsx (modify existing)  
**Code:** See HERO_ENGINE_SCENE_ENHANCEMENTS.md lines 50-150  
**Time:** 45 minutes  
**Impact:** Dramatic cinematic storytelling

#### 🟠 MEDIUM PRIORITY: Snow Particle System
**File:** src/components/effects/SnowParticleSystem.tsx (new file)  
**Code:** See COMPREHENSIVE_ANIMATION_ENHANCEMENT_PLAN.md lines 220-360  
**Time:** 60 minutes  
**Impact:** Immersive hero atmosphere

#### 🟠 MEDIUM PRIORITY: Engine Sparks
**File:** src/components/effects/SparkParticleSystem.tsx (new file)  
**Code:** See COMPREHENSIVE_ANIMATION_ENHANCEMENT_PLAN.md lines 450-550  
**Time:** 40 minutes  
**Impact:** Industrial realism for engine scene

---

## ⚡ Three Recommended Paths

### Path A: Hero Visual Blitz (Week 1)
**Goal:** Max impact on first impression  
**Time:** 8 hours

1. ✅ Fix cloud system (30 min)
2. ✅ Implement hero camera keyframes (45 min)
3. ✅ Add snow particle system (60 min)
4. ✅ Refresh lighting passes (45 min)
5. ✅ Tune color grading / post effects (60 min)
6. ✅ Run desktop + mobile performance spot check (60 min)

**Result:** Hero scene feels cinematic and alive

### Path B: Engine Immersion Push (Week 1)
**Goal:** Sell craftsmanship and industrial depth  
**Time:** 9 hours

1. ✅ Implement engine spark system (40 min)
2. ✅ Add haptic feedback trigger (30 min)
3. ✅ Layer steam/heat shader (60 min)
4. ✅ Sequence assembly highlights (75 min)
5. ✅ Wire tooltips + copy (45 min)
6. ✅ Capture scroll performance metrics (60 min)

**Result:** Engine scene tells a high-energy fabrication story

### Path C: Balanced Experience Stack (Week 1)
**Goal:** Blend hero drama with engine immersion  
**Time:** 9 hours

1. ✅ Fix cloud system (30 min)
2. ✅ Hero camera keyframes (45 min)
3. ✅ Snow particle system (60 min)
4. ✅ Engine spark system (40 min)
5. ✅ Haptic feedback sync (30 min)
6. ✅ Lightweight QA pass (performance + visual) (60 min)

**Result:** Cohesive end-to-end narrative with tactile payoffs

## 🎯 Priority Matrix

| Feature | Impact | Effort | Priority | Time |
|---------|--------|--------|----------|------|
| Fix Cloud System | Very High | Low | 🔴 Critical | 30 min |
| Hero Camera Keyframes | High | Medium | 🔴 High | 45 min |
| Snow Particles | High | Medium | 🔴 High | 60 min |
| Engine Sparks | High | Medium | 🔴 High | 40 min |
| Haptic Feedback | Medium | Low | 🟠 Medium | 30 min |
| Assembly Choreography | High | High | 🟠 Medium | 2 hours |
| Adaptive Quality System | Medium | Medium | 🟠 Medium | 90 min |
| Kinetic Typography | Medium | High | 🟡 Optional | 90 min |
| Steam / Heat FX | Medium | Medium | 🟡 Optional | 75 min |
| Micro-Interactions | Low | Medium | 🟡 Optional | 60 min |
| God Rays | Medium | High | 🟡 Optional | 90 min |
| Weather System | Low | High | 🔵 Later | 2 hours |

---

## 🔧 Essential Code Snippets

### Fix Cloud System (30 minutes)
```tsx
// 1. Create: src/components/effects/VolumetricCloudLayer.tsx
// Copy code from HERO_ENGINE_SCENE_ENHANCEMENTS.md (lines 180-320)

// 2. Update: src/components/PersistentBackground.tsx
// Add after scene setup (around line 800):
useEffect(() => {
  if (!sceneRef.current || !cameraRef.current) return;
  
  const layer1 = new VolumetricCloudLayer({
    scene: sceneRef.current,
    camera: cameraRef.current,
    texture: '/assets/clouds/35.png',
    position: new THREE.Vector3(0, 35, -55),
    scale: new THREE.Vector2(180, 80),
    opacity: 0.25,
    speed: new THREE.Vector2(0.008, 0.003),
    height: 35
  });
}, []);

// 3. Test: Scroll to hero scene, verify no dark blobs
```

### Add Haptic Feedback (30 minutes)
```tsx
// 1. Create: src/hooks/useHapticFeedback.ts
export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!navigator.vibrate) return;
    const patterns = { light: [10], medium: [20], heavy: [30] };
    navigator.vibrate(patterns[type]);
  }, []);
  
  return { triggerHaptic };
}

// 2. Update: src/components/MasterScrollContainer.tsx
const { triggerHaptic } = useHapticFeedback();
const lastSceneRef = useRef<number>(0);

// In onUpdate:
const currentScene = Math.floor(progress * 6);
if (currentScene !== lastSceneRef.current) {
  triggerHaptic('light');
  lastSceneRef.current = currentScene;
}

// 3. Test: Use mobile device, feel vibration on scene transitions
```

---

## ⚙️ Testing Checklist

### After Each Change:
- [ ] FPS counter still shows 55+ FPS
- [ ] No console errors or warnings
- [ ] Scroll-triggered timelines feel smooth
- [ ] New visual layer matches design reference
- [ ] Git commit with clear message

### Before Merging:
- [ ] Desktop pass (Chrome + Firefox) with full scroll
- [ ] Mobile pass (iOS Safari + Android Chrome)
- [ ] Capture performance profile (Chrome DevTools)
- [ ] Validate haptic triggers on physical device
- [ ] Review engine tooltips and hero copy for accuracy

## 🐛 Common Issues & Solutions

### Issue: FPS drops below 45
**Solution:**
```tsx
// Reduce particle count
const particleCount = 1000; // Was 2000

// Disable shadows
mesh.castShadow = false;
mesh.receiveShadow = false;

// Lower pixel ratio
renderer.setPixelRatio(1.0); // Was 1.6
```

### Issue: Cloud blobs still dark
**Solution:**
```tsx
// Increase brightness in shader
uniform float uBrightness: { value: 1.5 }  // Was 1.3

// Check blending mode
blending: THREE.AdditiveBlending  // NOT NormalBlending
```

### Issue: Camera movement jerky
**Solution:**
```tsx
// Increase lerp factor
state.cameraPosition.lerp(targets.cameraPosition, 0.1); // Was 0.065

// Use easing function
const eased = t * t * (3 - 2 * t); // Smoothstep
```

### Day 1 (4 hours)
- ✅ Cloud system fixed
- ✅ FPS stable

### Week 1 (20 hours)
- ✅ All high-priority features
- ✅ Performance optimized

### Week 2 (20 hours)
- ✅ Medium-priority features
- ✅ Cross-device tested
- ✅ Polish complete

### Week 3 (15 hours)
- ✅ Low-priority features
- ✅ Advanced effects
- ✅ Full QA

---

## 💡 Pro Tips

1. **Use Git Branches**
   ```bash
   git checkout -b feature/cloud-system-fix
   git checkout -b feature/hero-camera
   ```

2. **Test Incrementally**
   - Don't add all features at once
   - Commit after each working feature
   - Use feature flags for easy rollback

3. **Monitor Performance**
   - Keep FPS counter visible during development
   - Profile with Chrome DevTools regularly
   - Test on real mobile devices (not just emulator)

4. **Document Changes**
   - Update HANDOFF.md with new features
   - Comment complex shader code
   - Note any performance trade-offs

5. **Instrument Performance**
   - Track FPS + memory after each effect
   - Log ScrollTrigger markers before final QA

---

## 🎓 Learning Resources

### Video Tutorials
- Three.js Journey (Bruno Simon): https://threejs-journey.com
- GSAP Masterclass: https://greensock.com/learning/

### Interactive Demos
- Three.js Examples: https://threejs.org/examples/
- CodePen GSAP: https://codepen.io/collection/ANaOod

### Reference Docs
- Three.js API: https://threejs.org/docs/
- GSAP Docs: https://greensock.com/docs/

---

## 🏆 Success Metrics

### Week 1 Goals
- FPS: 55+ desktop, 40+ mobile
- Engagement: +15%

### Week 2 Goals
- FPS: 60 desktop, 45+ mobile
- Engagement: +25%

### Final Goals
- FPS: 60 constant desktop, 50+ mobile
- Engagement: +35%
- Scroll completion: +28%
- Return visitors: +18%

---

## 📞 Need Help?

### Debug Mode
```tsx
// Enable in homepage.tsx
if (process.env.NODE_ENV !== 'production') {
  window.__DEBUG_MODE__ = true;
  window.__SCENE_PROGRESS__ = globalProgress;
  window.__FPS__ = metrics.fps;
}
```

### Console Logging
```tsx
console.log('[Scene Progress]', globalProgress.toFixed(3));
console.log('[Camera Position]', camera.position.toArray());
console.log('[Active Phase]', currentPhase.name);
```

### Performance Profiling
```tsx
// Chrome DevTools > Performance tab
// Record 10 seconds of scrolling
// Look for long frames (red bars)
// Check for memory leaks (increasing heap)
```

---

**Quick Start Complete!** 🎉  
Choose a path above and start implementing. Refer to full documentation for detailed code examples.

**Last Updated:** October 24, 2025
