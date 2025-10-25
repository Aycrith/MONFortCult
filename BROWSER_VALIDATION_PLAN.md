# Browser Validation Plan

**Goal:** Confirm the MontFort experience behaves correctly, performs smoothly, and meets accessibility expectations across target browsers/devices before launch.

---

## Test Matrix

| Platform | Browser | Devices | Notes |
| --- | --- | --- | --- |
| macOS 14+ | Safari 17, Chrome 128+, Firefox 129+ | MacBook Pro/Air | Validate pointer & trackpad interactions, audio autoplay prompts. |
| Windows 11 | Chromium (Edge/Chrome), Firefox | Surface Laptop/PC w/ mouse + touch | Confirm pointer capture release and haptic fallbacks. |
| iOS 17 | Safari | iPhone 15/13, iPad Pro | Focus on reduced motion, touch orbit controls, audio unlock UX. |
| Android 14 | Chrome, Firefox | Pixel 7/8, Galaxy S23 | Verify WebGL performance, autoplay handling, vibration support. |

---

## Global Checklist

- Page loads without console errors.
- Scroll journey smooth at 60 FPS target (monitor via Dev HUD).
- Audio notice appears only when autoplay blocked and clears after user interaction.
- `prefers-reduced-motion` disables hero loop, pointer parallax, spark motion, and audio.
- Keyboard navigation reaches menus, CTA buttons, overlays; focus styles visible.
- Screen reader (VoiceOver/NVDA/TalkBack) announces menu items, scene headings, notices.
- Color contrast ≥ WCAG AA for text and critical UI.

---

## Scene-Specific Checks

1. **Hero Section**
   - GSAP hero camera loop active on default motion setting.
   - Pointer parallax responsive, resets on pointer leave.
   - Reduced motion setting keeps hero static and recenters pointer offsets.

2. **Text Morph / Info Overlays**
   - Scroll-linked transitions align with SCENE_TIMING milestones.
   - Copy readable; no clipping at common zoom levels (90%–125%).

3. **Ship Scene**
   - Pointer orbit engages on drag/touch; releases cleanly.
   - Spark particle system active; intensity reduces under reduced motion and low-perf mode.
   - Bloom/bokeh effects render without artifacts.

4. **Globe & Forest Scenes**
   - Tone presets display correct color grading.
   - Globe rotation and forest atmosphere stable at 30 FPS minimum on mid-range devices.

5. **Menu Panel**
   - Toggle soundscape controls; ensure audio gain responds instantly.
   - Menu focus trap works; ESC/close button dismisses.

---

## Performance Profiling

- Use Chrome Performance panel & Firefox Profiler for each platform.
- Capture CPU/GPU usage during full scroll journey.
- Record FPS meters at hero, ship, forest scenes.
- Note memory footprint and WebGL context stability.

---

## Accessibility Sweep

1. Run automated scan (`npx @axe-core/cli http://localhost:3000` or browser extensions).
2. Keyboard-only pass:
   - Tab to primary CTA, menu toggles, sound controls.
   - Ensure focus order follows visual flow.
3. Screen reader:
   - VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android).
   - Validate announcements for scene transitions and notices.

---

## Reporting Template

For each browser/device combo capture:

- **Environment:** OS, browser version, device.
- **Status:** Pass / Pass w/ Issues / Blocked.
- **Findings:** Bullet list with severity (High/Med/Low) and file hints.
- ** evidence:** Console logs, screenshots, performance traces (HAR/JSON).
- **Follow-up:** Owner + ETA if known.

Store findings in `QA_REPORTS/2025-10-25-browser-validation.md` (create folder if absent).

---

## Exit Criteria

- All High severity issues resolved or waived with stakeholder sign-off.
- Medium issues triaged with owners and scheduled.
- Updated session doc with validation summary and attach artifacts.
- Rerun `npm run build` post-fixes to confirm stability.

