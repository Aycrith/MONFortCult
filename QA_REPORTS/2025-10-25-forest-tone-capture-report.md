# Forest Tone Capture Report — 2025-10-25

This report validates the Globe → Forest crossfade at ~0.94 global progress, confirming distinct tone-specific overlays and vignettes in `ForestScene`.

## Method

- Route: `/forest-debug?tone=dawn|day|dusk|night`
- Harness: `scripts/run_forest_captures.js` (Playwright)
  - Viewport: 1280×720
  - Target progress: ~0.94 (binary-search scroller using `[data-master-scroll]`)
  - Extracts computed CSS backgrounds for overlay and vignette via `data-testid`
  - Saves PNG screenshots to `debugscreenshot/`

## Quality gates

- Lint: PASS
- Build: PASS (Windows SWC DLL warning is present but benign; build completes)

## Results

All tones were captured at progress ~0.9403 and display unique, tone-specific overlays and vignettes. Screenshots are saved under `debugscreenshot/`.

Automated assertions (now enforced by the harness):

- Progress within ±0.01 of 0.94
- Overlay and vignette background strings present (linear/radial gradients)
- Overlay opacity ≈ expected per tone (±0.03)
- Vignette opacity ≈ expected per tone (±0.03)
- Background brightness ≈ expected per tone (±0.04)
- Uniqueness: overlay and vignette gradient strings differ across all four tones

Current status: PASS (All forest capture assertions passed.)

- dawn
  - screenshot: `debugscreenshot/forest-dawn-p0.94.png`
  - overlay:  `linear-gradient(rgba(106, 82, 54, 0.36) 0%, rgba(72, 96, 76, 0.74) 55%, rgba(46, 64, 54, 0.86) 100%)`
  - vignette: `radial-gradient(circle at 45% 0%, rgba(255, 214, 164, 0.38) 0%, rgba(33, 46, 39, 0.78) 70%)`

- day
  - screenshot: `debugscreenshot/forest-day-p0.94.png`
  - overlay:  `linear-gradient(rgba(124, 178, 139, 0.28) 0%, rgba(66, 112, 84, 0.68) 58%, rgba(42, 74, 56, 0.8) 100%)`
  - vignette: `radial-gradient(circle at 50% 0%, rgba(168, 224, 186, 0.24) 0%, rgba(34, 52, 40, 0.7) 72%)`

- dusk
  - screenshot: `debugscreenshot/forest-dusk-p0.94.png`
  - overlay:  `linear-gradient(rgba(54, 94, 130, 0.32) 0%, rgba(30, 52, 74, 0.78) 60%, rgba(18, 32, 48, 0.9) 100%)`
  - vignette: `radial-gradient(circle at 42% 0%, rgba(116, 164, 210, 0.32) 0%, rgba(14, 24, 36, 0.82) 72%)`

- night
  - screenshot: `debugscreenshot/forest-night-p0.94.png`
  - overlay:  `linear-gradient(rgba(42, 68, 102, 0.4) 0%, rgba(18, 36, 60, 0.84) 58%, rgba(10, 22, 40, 0.95) 100%)`
  - vignette: `radial-gradient(circle at 50% 0%, rgba(96, 150, 204, 0.3) 0%, rgba(6, 12, 20, 0.88) 74%)`

## How to re-run

1) Build once (optional if already built):

```pwsh
npm run build
```

2) Start the server (production):

```pwsh
npm start
```

3) In a second terminal, run the capture harness:

```pwsh
npm run capture:forest
```

4) Manual check (optional):

- Open `/forest-debug?tone=dawn|day|dusk|night`
- Scroll to ~0.94 (HUD shows current `progress`)

## Notes

- The `/forest-debug` route is intended for validation and can remain present for future QA.
- The capture harness writes a JSON report to `debugscreenshot/forest-tone-gradients-*.json` including progress and CSS strings.
 - Optional: to let the harness auto-start the server, set an env var before running it (useful in non-Windows CI). By default, it assumes `http://localhost:3000` is already running to avoid Windows spawn issues.
