#!/usr/bin/env node
// trace_capture.js
// Captures a small Playwright trace for a few iterations to analyze slow flows

const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  for (let i = 0; i < 3; i++) {
    const context = await browser.newContext();
    const tracePath = `trace-${i}.zip`;
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    try {
      await page.goto('https://example.com', { timeout: 30000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.error('trace run error', e && e.message);
    }
    await context.tracing.stop({ path: tracePath });
    console.log('Saved', tracePath);
    await page.close();
    await context.close();
  }
  await browser.close();
}

if (require.main === module) run();
