// Capture Shadow Courier's screenshots: for each entry in shots.json, open
// game/index.html with its query in headless Chromium (Chrome for Testing),
// wait for window.__shotReady, and save a 1280x720 JPEG to screenshots/.
// Uses playwright-core from the npx cache and the Chrome for Testing binary
// under /home/hatch/cft-dl. Run from the repo root: `node capture-shots.cjs`
// Requires the local server: `node serve.ts` (port 8080).
const { chromium } = require('/home/hatch/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { readFileSync, mkdirSync } = require('node:fs');
const { join, resolve } = require('node:path');

const here = resolve(__dirname);
const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));
mkdirSync(join(here, 'screenshots'), { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/hatch/cft-dl/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'],
  });
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.log('PAGEERROR', shot.name, e.message));
    page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', shot.name, m.text()); });
    const url = `http://localhost:8080/${shot.query}`;
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const out = join(here, 'screenshots', shot.name);
    await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
    console.log('SHOT_OK', shot.name, out);
    await page.close();
  }
  await browser.close();
  console.log('ALL_SHOTS_OK');
})().catch((e) => { console.error('SHOT_FAIL', e.message); process.exit(1); });
