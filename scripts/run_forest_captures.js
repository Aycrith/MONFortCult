// Capture mid-window (~0.94) Globe → Forest crossfade and extract CSS gradients per tone
// Usage: node scripts/run_forest_captures.js

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { spawn } = require('child_process');

const OUT_DIR = path.join(__dirname, '..', 'debugscreenshot');

const EXPECTED = {
  dawn: { brightness: 0.68, overlayOpacity: 0.85, vignetteOpacity: 0.9 },
  day: { brightness: 0.78, overlayOpacity: 0.82, vignetteOpacity: 0.85 },
  dusk: { brightness: 0.52, overlayOpacity: 0.88, vignetteOpacity: 0.92 },
  night: { brightness: 0.44, overlayOpacity: 0.92, vignetteOpacity: 0.96 },
};

async function ensureOutDir() {
  try {
    await fs.promises.mkdir(OUT_DIR, { recursive: true });
  } catch {}
}

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(/^win/i.test(process.platform) ? 'npm.cmd' : 'npm', ['start'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let settled = false;
    const onData = (buf) => {
      const text = buf.toString();
      if (!settled && (text.includes('Ready in') || text.includes('Local:') || text.includes('http://localhost:3000'))) {
        settled = true;
        resolve({ proc: child });
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', (d) => {
      // still watch for readiness on stderr too (some environments log there)
      onData(d);
    });

    child.on('exit', (code) => {
      if (!settled) {
        reject(new Error(`Server exited before ready (code ${code})`));
      }
    });
  });
}

function stopServer(child) {
  if (!child || child.killed) return;
  try {
    if (process.platform === 'win32') {
      // Try graceful kill
      child.kill('SIGTERM');
    } else {
      child.kill('SIGTERM');
    }
  } catch {}
}

async function scrollToProgress(page, targetProgress, { timeoutMs = 15000, tol = 0.003, maxIter = 30 } = {}) {
  const start = Date.now();
  let { maxScrollable } = await page.evaluate(() => {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return { maxScrollable: max };
  });

  let lowY = 0;
  let highY = maxScrollable;
  let currentY = Math.floor(maxScrollable * targetProgress);
  let lastProgress = 0;

  for (let i = 0; i < maxIter && Date.now() - start < timeoutMs; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), currentY);
    await page.waitForTimeout(120);
    const { progress } = await page.evaluate(() => {
      const el = document.querySelector('[data-master-scroll]');
      const prog = el ? Number(el.getAttribute('data-progress') || '0') : 0;
      return { progress: prog };
    });

    lastProgress = progress;
    const diff = progress - targetProgress;
    if (Math.abs(diff) <= tol) return progress;

    if (diff < 0) {
      // progress too low → need to scroll further down
      lowY = currentY + 1;
    } else {
      // progress too high → need to scroll up
      highY = currentY - 1;
    }
    currentY = Math.floor((lowY + highY) / 2);
    if (currentY < 0) currentY = 0;
    if (currentY > maxScrollable) currentY = maxScrollable;
  }
  return lastProgress;
}

async function captureTone(tone, progressTarget = 0.94) {
  const url = `http://localhost:3000/forest-debug?tone=${tone}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  // Retries for server readiness
  let ready = false;
  for (let i = 0; i < 10 && !ready; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 3000 });
      ready = true;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  if (!ready) {
    await browser.close();
    throw new Error('Server did not respond at ' + url);
  }

  await page.waitForSelector('[data-master-scroll]');
  // Ensure ScrollTrigger pin created tall scroll area
  try {
    await page.waitForFunction(() => document.documentElement.scrollHeight > window.innerHeight * 2000, { timeout: 5000 });
  } catch {}

  const reached = await scrollToProgress(page, progressTarget, { timeoutMs: 20000, tol: 0.004 });

  // Extract computed CSS backgrounds for overlay+vignette
  const overlayBg = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="forest-overlay"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    // Prefer backgroundImage if present, else fallback to shorthand background
    return cs.backgroundImage && cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.background;
  });

  const vignetteBg = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="forest-vignette"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return cs.backgroundImage && cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.background;
  });

  const overlayOpacity = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="forest-overlay"]');
    if (!el) return null;
    return parseFloat(getComputedStyle(el).opacity || '0');
  });

  const vignetteOpacity = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="forest-vignette"]');
    if (!el) return null;
    return parseFloat(getComputedStyle(el).opacity || '0');
  });

  const brightness = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="forest-bg"]');
    if (!el) return null;
    const f = getComputedStyle(el).filter || '';
    const match = f.match(/brightness\(([^)]+)\)/);
    return match ? parseFloat(match[1]) : null;
  });

  const shotPath = path.join(OUT_DIR, `forest-${tone}-p${progressTarget.toFixed(2)}.png`);
  await page.screenshot({ path: shotPath, fullPage: false });
  await browser.close();

  return { tone, reached, overlayBg, vignetteBg, overlayOpacity, vignetteOpacity, brightness, shotPath };
}

(async () => {
  await ensureOutDir();

  let server;
  const shouldStart = (process.env.CAPTURE_START_SERVER || '').toLowerCase() === '1' ||
                      (process.env.CAPTURE_START_SERVER || '').toLowerCase() === 'true';
  if (shouldStart) {
    try {
      server = await startServer();
    } catch (e) {
      console.warn('Capture: could not auto-start server:', e.message, '\nProceeding assuming it is already running at http://localhost:3000');
    }
  } else {
    // Assume server is already running (recommended for Windows stability)
  }

  const tones = ['dawn', 'day', 'dusk', 'night'];
  const results = [];
  let failures = 0;
  for (const tone of tones) {
    try {
      const res = await captureTone(tone, 0.94);
      results.push(res);
      console.log(`Captured ${tone} @ ${res.reached.toFixed(4)} → ${res.shotPath}`);
      console.log(`  overlay:  ${res.overlayBg}`);
      console.log(`  vignette: ${res.vignetteBg}`);

      // Assertions
      const exp = EXPECTED[tone];
      const within = (a, b, tol) => typeof a === 'number' && Math.abs(a - b) <= tol;
      const assertTrue = (ok, msg) => { if (!ok) { failures++; console.error('ASSERT FAIL:', msg); } };

      assertTrue(Math.abs(res.reached - 0.94) <= 0.01, `progress not within ±0.01 (got ${res.reached.toFixed(4)})`);
      assertTrue(typeof res.overlayBg === 'string' && res.overlayBg.includes('linear-gradient'), 'overlay gradient missing/incorrect');
      assertTrue(typeof res.vignetteBg === 'string' && res.vignetteBg.includes('radial-gradient'), 'vignette gradient missing/incorrect');
      assertTrue(within(res.overlayOpacity, exp.overlayOpacity, 0.03), `overlay opacity ~${exp.overlayOpacity} got ${res.overlayOpacity}`);
      assertTrue(within(res.vignetteOpacity, exp.vignetteOpacity, 0.03), `vignette opacity ~${exp.vignetteOpacity} got ${res.vignetteOpacity}`);
      assertTrue(within(res.brightness, exp.brightness, 0.04), `brightness ~${exp.brightness} got ${res.brightness}`);
    } catch (e) {
      failures++;
      console.error(`Failed for tone ${tone}:`, e.message);
    }
  }

  // Uniqueness checks across tones
  const overlays = new Set(results.map((r) => r.overlayBg));
  const vignettes = new Set(results.map((r) => r.vignetteBg));
  if (overlays.size !== tones.length) { failures++; console.error('ASSERT FAIL: overlay gradients are not unique across tones'); }
  if (vignettes.size !== tones.length) { failures++; console.error('ASSERT FAIL: vignette gradients are not unique across tones'); }

  // Write a small report file for traceability
  const reportPath = path.join(OUT_DIR, `forest-tone-gradients-${Date.now()}.json`);
  await fs.promises.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSaved report → ${reportPath}`);

  if (server) stopServer(server.proc);
  if (failures > 0) {
    console.error(`Forest capture assertions failed: ${failures} issue(s)`);
    process.exit(1);
  } else {
    console.log('All forest capture assertions passed.');
  }
})();
 
