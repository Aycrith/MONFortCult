#!/usr/bin/env node
// Minimal MCP-like HTTP server example using PlaywrightPool

const http = require('http');
const { PlaywrightPool } = require('../lib/playwrightPool');

const pool = new PlaywrightPool({ maxContexts: 4 });

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/run') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        const result = await pool.use(async ({ page }) => {
          const url = payload.url || 'https://example.com';
          await page.goto(url, { timeout: 20000 });
          // Optionally capture content
          const title = await page.title();
          return { title };
        }, { timeout: 30000 });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, result }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e && e.message }));
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

const port = process.env.PORT || 9222;
server.listen(port, () => console.log('MCP example server listening on', port));

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  server.close();
  await pool.close();
  process.exit(0);
});
