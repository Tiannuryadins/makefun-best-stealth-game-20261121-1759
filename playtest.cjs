// Interactive play-test: load the title screen, click MULAI MISI, walk with
// the keyboard, and report the live state. Exit 0 only if all checks pass.
const { chromium } = require('/home/hatch/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/hatch/cft-dl/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:8080/', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const phase0 = await page.evaluate(() => window.__shadowCourier.phase);
  await page.click('#overlay-buttons button');
  await page.waitForTimeout(300);
  const phase1 = await page.evaluate(() => window.__shadowCourier.phase);
  const x0 = await page.evaluate(() => window.__shadowCourier.player.x);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(800);
  await page.keyboard.up('ArrowRight');
  const x1 = await page.evaluate(() => window.__shadowCourier.player.x);
  const y1 = await page.evaluate(() => window.__shadowCourier.player.y);
  // click-to-move: click far right of the canvas
  await page.mouse.click(1100, 400);
  await page.waitForTimeout(600);
  const x2 = await page.evaluate(() => window.__shadowCourier.player.x);
  const y2 = await page.evaluate(() => window.__shadowCourier.player.y);
  const hud = await page.evaluate(() => ({
    level: document.getElementById('level-name').textContent,
    timer: document.getElementById('timer-text').textContent,
  }));
  console.log(JSON.stringify({ phase0, phase1, x0, x1, y1, x2, y2, hud, errors }, null, 2));
  const ok = phase0 === 'title' && phase1 === 'playing' && x1 > x0 + 50 && (x2 > x1 || y2 < y1 - 20) && errors.length === 0;
  console.log(ok ? 'PLAYTEST PASS' : 'PLAYTEST FAIL');
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('PLAYTEST_FAIL', e.message); process.exit(1); });
