#!/usr/bin/env node
// stress_playwright_pool.js
// Run with: node scripts/stress_playwright_pool.js --count 200 --concurrency 4

const { chromium } = require('playwright');
const argv = require('minimist')(process.argv.slice(2));

class PlaywrightPool {
  constructor({ maxContexts = 4, browserOptions = {} } = {}) {
    this.maxContexts = maxContexts;
    this.browserOptions = browserOptions;
    this.browser = null;
    this.active = 0;
    this.queue = [];
    this.initialized = false;
    this.restartLock = false;
  }

  async init() {
    if (this.initialized) return;
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
      ...this.browserOptions,
    });
    this.initialized = true;
  }

  async use(taskFn, { timeout = 30000 } = {}) {
    if (!this.initialized) await this.init();
    return new Promise((resolve, reject) => {
      const job = async () => {
        this.active++;
        let context;
        let page;
        let timer;
        try {
          context = await this.browser.newContext();
          page = await context.newPage();

          const result = await Promise.race([
            taskFn({ context, page }),
            new Promise((_, rej) => {
              timer = setTimeout(() => rej(new Error('task timeout')), timeout);
            }),
          ]);

          clearTimeout(timer);

          try { await page.close(); } catch (e) {}
          try { await context.close(); } catch (e) {}

          resolve(result);
        } catch (err) {
          console.error('task error', err && err.message);
          reject(err);
          if (/target closed|Connection closed|ECONNRESET|Browser closed/i.test(String(err))) {
            this._restartBrowserSafe();
          }
        } finally {
          this.active--;
          this._next();
        }
      };

      if (this.active < this.maxContexts) job();
      else this.queue.push(job);
    });
  }

  _next() {
    if (this.queue.length && this.active < this.maxContexts) {
      const j = this.queue.shift();
      j();
    }
  }

  async close() {
    if (this.browser) {
      try { await this.browser.close(); } catch (e) {}
      this.browser = null;
      this.initialized = false;
    }
  }

  async _restartBrowserSafe() {
    if (this.restartLock) return;
    this.restartLock = true;
    try {
      console.warn('Restarting browser for recovery...');
      await this.close();
      await new Promise(r => setTimeout(r, 500));
      await this.init();
    } catch (e) {
      console.error('Browser restart failed:', e);
    } finally {
      this.restartLock = false;
    }
  }
}

async function main() {
  const COUNT = Number(argv.count || 200);
  const concurrency = Number(argv.concurrency || 4);

  const pool = new PlaywrightPool({ maxContexts: concurrency });
  await pool.init();

  const results = [];
  for (let i = 0; i < COUNT; i++) {
    try {
      const t0 = Date.now();
      await pool.use(async ({ page }) => {
        await page.goto('https://example.com', { timeout: 30000 });
        await page.waitForTimeout(50);
        return true;
      }, { timeout: 30000 });
      const dt = Date.now() - t0;
      results.push(dt);
      if (i % 10 === 0) {
        console.log(`iter ${i} took ${dt}ms; memory: ${JSON.stringify(process.memoryUsage())}`);
      }
    } catch (err) {
      console.error('iteration failed', i, err && err.message);
    }

    if (i % 50 === 0) {
      const mem = process.memoryUsage().rss;
      const rssMB = mem / (1024 * 1024);
      if (rssMB > 600) {
        console.warn('RSS high, restarting browser pool', rssMB);
        await pool._restartBrowserSafe();
      }
    }
  }

  results.sort((a,b) => a-b);
  const p50 = results[Math.floor(results.length*0.5)] || 0;
  const p95 = results[Math.floor(results.length*0.95)] || 0;
  const p99 = results[Math.floor(results.length*0.99)] || 0;
  console.log({ count: results.length, p50, p95, p99, mem: process.memoryUsage() });
  await pool.close();
  process.exit(0);
}

if (require.main === module) main();
