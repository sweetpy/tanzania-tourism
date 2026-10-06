import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.env.BOKER_TEST_URL || 'http://localhost:3100';
const output = path.resolve('output/verification');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failures = [];
page.on('pageerror', error => failures.push(error.message));
const results = { base, pages: [], planner: null, enquiry: 'Mocked UI submission only; no live enquiry sent.', errors: failures };
try {
  for (const route of ['/', '/destinations', '/experiences', '/packages', '/operators', '/operators/catalog']) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    assert.equal(response?.status(), 200, route);
    assert.match(await page.title(), /Boker/);
    const text = await page.locator('body').innerText();
    assert.doesNotMatch(text, /\bWazi\b/);
    results.pages.push({ route, status: response.status(), title: await page.title() });
    if (route === '/') {
      await page.waitForFunction(() => { const hero = document.querySelector('main img'); return !hero || (hero.complete && hero.naturalWidth > 0); }, undefined, { timeout: 45_000 });
      await page.screenshot({ path: path.join(output, 'boker-home-desktop.png'), fullPage: true });
      await page.screenshot({ path: path.join(output, 'boker-home-viewport.png') });
    }
  }
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.locator('header').getByRole('link', { name: 'Build an itinerary', exact: true }).click();
  await page.waitForURL('**/plan');
  await page.getByRole('heading', { name: /Your safari/ }).waitFor();
  results.navigation = 'Next.js client navigation to planner passed';
  await page.setViewportSize({ width: 1024, height: 900 });
  const headerSize = await page.evaluate(() => ({ width: document.documentElement.clientWidth, header: document.querySelector('header').scrollWidth }));
  assert.ok(headerSize.header <= headerSize.width + 1, `Header overflow: ${JSON.stringify(headerSize)}`);
  await page.screenshot({ path: path.join(output, 'boker-plan-tablet.png') });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/plan?park=serengeti-central`, { waitUntil: 'domcontentloaded' });
  const selectedPark = page.getByRole('checkbox', { name: /Serengeti/ });
  await selectedPark.waitFor({ timeout: 40_000 });
  assert.equal(await selectedPark.isChecked(), true);
  await page.getByRole('button', { name: 'Build my itinerary' }).click();
  await page.getByText('DRAFT ITINERARY', { exact: true }).waitFor({ timeout: 45_000 });
  const dayCount = await page.locator('.boker-day').count();
  assert.ok(dayCount >= 2 && dayCount <= 14);
  results.planner = { dayCount, routeOptions: await page.locator('.boker-options button').count(), livePreview: true };
  await page.screenshot({ path: path.join(output, 'boker-itinerary-desktop.png'), fullPage: true });

  let submitted;
  await page.route('**/api/boker/enquiries', async route => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ saved: true, reference: 'BOK-UI-TEST', emailSent: false }) });
  });
  await page.getByLabel('Your name', { exact: true }).fill('UI verification');
  await page.getByLabel('Email address', { exact: true }).fill('ui-verification@example.com');
  await page.getByRole('button', { name: 'Send my itinerary request' }).click();
  await page.getByText('BOK-UI-TEST', { exact: true }).waitFor();
  assert.ok(submitted.requestId && submitted.selectionId && submitted.request);
  assert.match(await page.locator('.boker-receipt').innerText(), /not a booking|not.*confirmation/i);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/plan?park=ruaha`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('checkbox', { name: /Ruaha/ }).waitFor({ timeout: 40_000 });
  assert.equal(await page.getByRole('checkbox', { name: /Ruaha/ }).isChecked(), true);
  const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(size.scroll <= size.width + 1, `Mobile overflow: ${JSON.stringify(size)}`);
  await page.screenshot({ path: path.join(output, 'boker-plan-mobile.png'), fullPage: true });
  await page.goto(`${base}/boker?park=tarangire`);
  assert.match(page.url(), /\/plan\?park=tarangire/);
  assert.deepEqual(failures, []);
  await writeFile(path.join(output, 'browser-checks.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
