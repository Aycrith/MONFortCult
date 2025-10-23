# Critical Issues Fix Plan | October 22, 2025

## 🔴 CRITICAL ISSUES IDENTIFIED

### Issue #1: CloudOverlay Not Rendering ❌
**Problem:** CloudOverlay component exists but is NOT imported or rendered in homepage.tsx  
**Impact:** No cloud layers visible on Scene 1  
**Status:** Missing component integration

### Issue #2: Mountain Visible in ALL Scenes ❌
**Problem:** PersistentBackground (3D mountain) has no z-index control and stays visible during Info, Ship, Globe, Forest scenes  
**Impact:** Can't see ship, content overlays are hidden behind mountain  
**Status:** Z-index and visibility logic broken

### Issue #3: Ship Wake Not Testable ❌
**Problem:** Can't verify ship wake because mountain is blocking Scene 4  
**Impact:** Ship scene completely obscured  
**Status:** Blocked by Issue #2

### Issue #4: No Visible FPS Counter ❌
**Problem:** DebugPanel exists with FPS monitoring but is not rendered on page  
**Impact:** No performance visibility for user  
**Status:** DebugPanel not imported/displayed

---

## 🎯 ROOT CAUSE ANALYSIS

### Scene Layering Architecture
```
Current (BROKEN):
├─ z-index: ??? - PersistentBackground (3D mountain)
├─ z-index: 10  - Overlays (text, content)
└─ z-index: 4   - ShipScene

Problem: PersistentBackground has NO z-index and defaults to high value
Result: Mountain renders ON TOP of everything
```

**Expected Architecture:**
```
Correct:
├─ z-index: 1   - PersistentBackground (lowest, background layer)
├─ z-index: 4   - ShipScene (mid layer)
├─ z-index: 5   - Other 3D scenes
└─ z-index: 10  - Overlays (highest, text on top)
```

### Component Integration Gaps
1. **CloudOverlay** - Created but never imported
2. **DebugPanel** - Exists but not rendered in homepage
3. **PersistentBackground** - No z-index specified in component

---

## ✅ FIXES REQUIRED

### Fix #1: Add CloudOverlay to Scene 1
**File:** `src/app/homepage.tsx`  
**Action:**
1. Import CloudOverlay
2. Add CloudOverlay component inside HeroOverlay or as sibling
3. Pass scroll progress for parallax animation
4. Ensure z-index is appropriate (z-2 or z-3, below text overlays)

**Code:**
```tsx
// Add import
import CloudOverlay from '@/components/CloudOverlay';

// Add in render (inside Scene 1 section)
<CloudOverlay 
  scrollProgress={heroProgress ?? 0}
  cloudCount={5}
/>
```

### Fix #2: Fix PersistentBackground Z-Index
**File:** `src/components/PersistentBackground.tsx`  
**Action:**
1. Add explicit z-index: 1 to container div
2. Add opacity control based on scene progress
3. Fade out mountain during Info/Ship/Globe/Forest scenes

**Code:**
```tsx
// Add to container div
<div 
  ref={containerRef} 
  className="absolute inset-0" 
  style={{ 
    zIndex: 1,  // ← CRITICAL FIX
    opacity: mountainSceneOpacity, // ← Dynamic opacity
    pointerEvents: 'none' 
  }}
>
```

**Opacity Logic:**
```tsx
// Calculate mountain visibility
const mountainSceneOpacity = useMemo(() => {
  // Visible during Scene 1 & 2 (0-30%)
  if (progress < 0.30) return 1;
  
  // Fade out during Scene 3 (30-35%)
  if (progress < 0.35) {
    return 1 - (progress - 0.30) / 0.05;
  }
  
  // Hidden during Ship/Globe/Forest
  return 0;
}, [progress]);
```

### Fix #3: Add Visible FPS Counter
**File:** `src/app/homepage.tsx`  
**Action:**
1. Add simple FPS display in corner (always visible)
2. Keep DebugPanel for advanced debugging
3. Use performance monitoring hook

**Code:**
```tsx
// Simple FPS display component
const FPSCounter = () => {
  const { metrics } = usePerformanceMonitor(true);
  
  return (
    <div 
      className="fixed top-4 left-4 bg-black/80 text-white px-3 py-2 rounded font-mono text-sm z-[9999]"
    >
      FPS: <span className={metrics.fps < 30 ? 'text-red-400' : metrics.fps < 50 ? 'text-yellow-400' : 'text-green-400'}>
        {metrics.fps}
      </span>
    </div>
  );
};
```

### Fix #4: Verify Scene Transitions
**File:** `src/app/homepage.tsx`  
**Action:**
1. Ensure ShipScene has z-index: 4
2. Verify InfoOverlay has z-index: 10
3. Test visibility at different scroll positions

### Fix #5: Debug Panel Toggle
**File:** `src/app/homepage.tsx`  
**Action:**
1. Add DebugPanel import
2. Add keyboard shortcut (Ctrl+Shift+D) to toggle
3. Add to render tree

---

## 📊 TESTING PLAN

### Test #1: Cloud Visibility
1. Load homepage
2. Should see dark navy clouds in upper 40% of frame
3. Clouds should parallax at different speeds during scroll
4. Verify 3 distinct layers visible

### Test #2: Mountain Fade Out
1. Scroll to Scene 3 (Info Sections) - 30% progress
2. Mountain should fade out completely
3. Info content should be clearly visible
4. No mountain overlap

### Test #3: Ship Scene Visibility
1. Scroll to Scene 4 (Ship) - ~40% progress
2. Should see cargo ship with wake trail
3. NO mountain visible
4. Dark storm atmosphere background
5. Wake foam particles behind ship

### Test #4: FPS Monitoring
1. FPS counter visible in top-left corner
2. Should show 55-60 FPS during scroll
3. Green = 50+ FPS, Yellow = 30-50, Red = <30

---

## 🚀 IMPLEMENTATION ORDER

1. **First:** Fix PersistentBackground z-index (unblocks everything)
2. **Second:** Add CloudOverlay to homepage
3. **Third:** Add FPS counter
4. **Fourth:** Test all scenes for visibility
5. **Fifth:** Verify ship wake effects work

---

## 📝 EXPECTED RESULTS

### Scene 1 (Hero) - 0-10%
✅ Mountain visible with bright photorealistic textures  
✅ Dark navy clouds with 3-layer parallax  
✅ Camera orbit during scroll  
✅ FPS counter shows 60 FPS  

### Scene 2 (Text Morph) - 10-20%
✅ Mountain visible, starting snow→rock morph  
✅ MONTFORT → TRADING text animation  
✅ Vertical light beams  

### Scene 3 (Info) - 20-35%
✅ Mountain FADED OUT (opacity 0)  
✅ White/light background  
✅ Company info clearly visible  
✅ No mountain overlap  

### Scene 4 (Ship) - 35-50%
✅ Cargo ship visible with diagonal movement  
✅ 8-particle wake trail behind ship  
✅ Dark storm atmosphere  
✅ NO mountain visible  

### Scene 5 (Globe) - 50-65%
✅ Rotating Earth  
✅ NO mountain visible  

### Scene 6 (Forest) - 65-85%
✅ Forest background  
✅ CSR content visible  
✅ NO mountain visible  

---

## ⚡ IMMEDIATE ACTIONS

**Priority 1 (CRITICAL):**
- [ ] Add z-index: 1 to PersistentBackground container
- [ ] Add mountain fade-out logic based on scroll progress
- [ ] Test Scene 3+ visibility

**Priority 2 (HIGH):**
- [ ] Import and render CloudOverlay in homepage.tsx
- [ ] Add FPS counter component
- [ ] Verify cloud parallax working

**Priority 3 (MEDIUM):**
- [ ] Add DebugPanel toggle
- [ ] Test ship wake visibility after mountain fix
- [ ] Performance verification

---

**Status:** Ready for implementation  
**Estimated Fix Time:** 30-45 minutes  
**Testing Time:** 15-20 minutes  
**Total:** ~1 hour to complete all fixes
