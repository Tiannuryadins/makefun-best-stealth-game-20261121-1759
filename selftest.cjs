// Headless self-test runner for Shadow Courier: loads ?selftest=1 and
// prints the in-page verdict from document.title. Exit 0 only on PASS.
const { chromium } = require('/home/hatch/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/hatch/cft-dl/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto('http://localhost:8080/?selftest=1', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const title = await page.title();
  console.log(title);
  await browser.close();
  process.exit(title.startsWith('SELFTEST PASS') ? 0 : 1);
})().catch((e) => { console.error('SELFTEST_FAIL', e.message); process.exit(1); });
