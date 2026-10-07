import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const base = process.env.BOKER_TEST_URL || "http://127.0.0.1:3100";
const catalogue = JSON.parse(
  await readFile("src/data/curatedPackages.json", "utf8"),
);
const added = catalogue.filter((p) => p.source.receivedDate === "2026-10-07");
await mkdir("output/verification", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" ? { channel: "msedge" } : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const report = {
  base,
  checkedAt: new Date().toISOString(),
  preparedRoutes: [],
  checks: [],
  errors,
  enquiry: "Mocked; no public lead or email submitted.",
};
try {
  for (const pkg of added) {
    await page.goto(`${base}/plan?package=${pkg.slug}`, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
    await page.waitForFunction(
      () => !document.querySelector(".studio-preferences fieldset").disabled,
    );
    assert.equal(
      await page.getByLabel("Trip length", { exact: true }).inputValue(),
      String(pkg.days),
    );
    await page
      .getByRole("button", { name: "Build my itinerary", exact: true })
      .click();
    await page.locator(".studio-day").first().waitFor();
    assert.equal(await page.locator(".studio-day").count(), pkg.days);
    assert.equal(
      await page
        .locator(".studio-route-options button[aria-pressed=true] strong")
        .innerText(),
      pkg.name,
    );
    const draft = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("boker-itinerary-draft-v1")),
    );
    assert.equal(draft.routeId, `brochure:${pkg.slug}`);
    if (pkg.days === 1) {
      assert.equal(await page.locator(".studio-stays").count(), 0);
      assert.equal(await page.locator(".studio-progress").count(), 0);
      assert.match(
        await page.locator(".studio-summary").innerText(),
        new RegExp(`central ${pkg.departureTown} hotel`),
      );
    } else {
      assert.match(
        await page.locator(".studio-stays").innerText(),
        /Stay in Arusha/,
      );
      assert.match(
        await page.locator(".studio-route-note").innerText(),
        /airport transfer.*not included/,
      );
    }
    report.preparedRoutes.push({
      code: pkg.code,
      days: pkg.days,
      route: "source programme preserved",
    });
  }
  report.checks.push(
    "All 27 new package links build their exact source programme; one-day outings show no invented stays",
  );
  const moshi = catalogue.find((p) => p.code === "BA-DT-MATERUNI");
  await page.goto(`${base}/plan?package=${moshi.slug}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(
    () => !document.querySelector(".studio-preferences fieldset").disabled,
  );
  await page
    .getByRole("button", { name: "Build my itinerary", exact: true })
    .click();
  await page.locator(".studio-day").first().waitFor();
  await page
    .getByLabel("Anything else for this day?", { exact: true })
    .fill("Please confirm pickup at our central Moshi hotel.");
  let submitted;
  await page.route("**/api/enquire", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        stored: true,
        emailed: false,
        id: "mock-daytrip",
        message: "Enquiry saved.",
      }),
    });
  });
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Day trip verification");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("daytrip-verification@example.com");
  await page
    .getByRole("button", { name: "Send my itinerary", exact: true })
    .click();
  await page.locator(".studio-receipt").waitFor();
  assert.equal(submitted.craft.trip.days, 1);
  assert.equal(submitted.craft.routeId, `brochure:${moshi.slug}`);
  assert.equal(submitted.craft.choices[0].propertyId, null);
  const malicious = structuredClone(submitted);
  malicious.craft.choices[0].propertyId = "coffee";
  const invalid = await page.request.post(`${base}/api/enquire`, {
    data: malicious,
  });
  assert.equal(invalid.status(), 400);
  report.checks.push(
    "One-day enquiry carries the selected programme and notes; real server rejects an invented hotel night",
  );
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".studio-print-plan section").count(), 1);
  await page.pdf({
    path: "output/verification/day-trip-print.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".studio-day.expanded").scrollIntoViewIfNeeded();
  const bounds = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(bounds.scroll <= bounds.width + 1);
  await page.screenshot({ path: "output/verification/day-trip-mobile.png" });
  report.checks.push(
    "One-day mobile editor has no page overflow and prints the complete outing",
  );
  await page.goto(`${base}/packages?days=1`, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("status")
    .filter({ hasText: /^21 journeys/ })
    .waitFor();
  assert.equal(await page.getByLabel("Trip length").inputValue(), "1");
  await page.screenshot({
    path: "output/verification/day-trip-catalogue-mobile.png",
  });
  report.checks.push(
    "Experience catalogue link opens all 21 day outings directly",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const code of ["BA-2D-ARUSHA", "BA-DT-MATERUNI"]) {
    const pkg = catalogue.find((p) => p.code === code);
    await page.goto(`${base}/packages/${pkg.slug}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => {
        const i = document.querySelector("main img");
        return i && i.complete && i.naturalWidth > 0;
      },
      undefined,
      { timeout: 60000 },
    );
    await page.screenshot({
      path: `output/verification/new-package-${code}.png`,
    });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "output/verification/short-brochure-checks.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await page
    .screenshot({
      path: "output/verification/short-brochure-failure.png",
      fullPage: true,
    })
    .catch(() => {});
  throw error;
} finally {
  await browser.close();
}
