import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const base = process.env.BOKER_TEST_URL || "http://127.0.0.1:3100";
const output = path.resolve("output/verification");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" ? { channel: "msedge" } : {}),
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const report = {
  base,
  checkedAt: new Date().toISOString(),
  checks: [],
  enquiry: "Mocked; no public customer lead or notification sent.",
  errors,
};
async function day(n) {
  await page
    .locator(".studio-day-rail")
    .getByRole("button", { name: new RegExp(`^Day ${n}\\b`) })
    .click();
  await page.locator(`#craft-day-${n} .studio-day-body`).waitFor();
}
async function stay(name) {
  await page
    .locator(".studio-property")
    .filter({ has: page.getByRole("heading", { name, exact: true }) })
    .getByRole("button", { name: "Choose this stay", exact: true })
    .click();
}
async function draft() {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("boker-itinerary-draft-v1")),
  );
}
try {
  let response = await page.goto(`${base}/plan`, {
    waitUntil: "domcontentloaded",
    timeout: 180000,
  });
  assert.equal(response.status(), 200);
  await page.getByRole("heading", { name: /Make this journey/ }).waitFor();
  await page
    .getByRole("button", { name: "Build my itinerary", exact: true })
    .waitFor();
  await page.waitForFunction(
    () => !document.querySelector(".studio-preferences fieldset").disabled,
  );
  await page.getByLabel("Arrival date", { exact: true }).fill("2027-06-10");
  await page
    .getByLabel("Journey style", { exact: true })
    .selectOption("Classic safari");
  await page
    .getByRole("button", { name: "Build my itinerary", exact: true })
    .click();
  await page.locator(".studio-day").first().waitFor({ timeout: 45000 });
  assert.equal(await page.locator(".studio-day").count(), 7);
  assert.match(
    await page
      .locator(".studio-route-options button[aria-pressed=true]")
      .innerText(),
    /7-Day Classic/,
  );
  await page.locator(".studio-property-photo img").first().waitFor();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll(".studio-property-photo img")].some(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    undefined,
    { timeout: 45000 },
  );
  report.checks.push(
    "Prepared seven-day programme generated without a custom preview dependency",
  );
  await page
    .getByRole("button", {
      name: "Preview Elewana Arusha Coffee Lodge",
      exact: true,
    })
    .click();
  await page.locator("dialog[open]").waitFor();
  assert.match(
    await page.locator("dialog").innerText(),
    /Elewana Arusha Coffee Lodge/,
  );
  await page
    .getByRole("button", { name: "Close lodge preview", exact: true })
    .click();
  await stay("Elewana Arusha Coffee Lodge");
  await day(3);
  await stay("Kubu Kubu Tented Lodge");
  let data = await draft();
  assert.equal(data.choices[2].propertyId, "kubu-kubu");
  assert.equal(data.choices[3].propertyId, "kubu-kubu");
  await day(4);
  await page.getByRole("checkbox", { name: /Keep this lodge/ }).uncheck();
  await stay("Serengeti Kati Kati Tented Camp");
  await page.getByRole("checkbox", { name: /Sunrise balloon enquiry/ }).check();
  await page.getByRole("checkbox", { name: /Unhurried afternoon/ }).check();
  await page
    .getByLabel("Room preference", { exact: true })
    .selectOption("Twin");
  await page
    .getByLabel("Anything else for this day?", { exact: true })
    .fill("Birthday breakfast; vegetarian picnic.");
  data = await draft();
  assert.equal(data.choices[2].propertyId, "kubu-kubu");
  assert.equal(data.choices[3].propertyId, "kati-kati");
  assert.equal(data.choices[3].room, "Twin");
  assert.ok(data.choices[3].services.includes("balloon"));
  const selectedRoute = page.locator(
    ".studio-route-options button[aria-pressed=true]",
  );
  const routeName = await selectedRoute.locator("strong").innerText();
  await selectedRoute.click();
  assert.deepEqual(await draft(), data);
  await page
    .locator(".studio-route-options button[aria-pressed=false]")
    .first()
    .click();
  await page
    .locator(".studio-route-options button")
    .filter({ hasText: routeName })
    .click();
  assert.deepEqual(await draft(), data);
  await day(4);
  report.checks.push(
    "Active route clicks and switching between route alternatives preserve personalised choices",
  );
  await page.screenshot({
    path: path.join(output, "itinerary-studio-desktop.png"),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(output, "itinerary-studio-day-editor.png"),
  });
  report.checks.push(
    "Supplier preview, consecutive-night lodge selection, independent-night override, room, balloon, pace and day notes",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page
    .getByRole("button", { name: "Resume my draft", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Resume my draft", exact: true })
    .click();
  await page.locator(".studio-day").first().waitFor();
  await day(4);
  assert.equal(
    await page
      .getByLabel("Anything else for this day?", { exact: true })
      .inputValue(),
    "Birthday breakfast; vegetarian picnic.",
  );
  assert.equal(
    await page
      .getByRole("checkbox", { name: /Sunrise balloon enquiry/ })
      .isChecked(),
    true,
  );
  const restored = await draft();
  assert.deepEqual(restored, data);
  assert.ok(!("contact" in restored));
  report.checks.push(
    "Draft restored with exact choices; enquiry contact form excluded from device storage",
  );
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator("body > .fixed").isVisible(), false);
  assert.equal(await page.locator(".studio-print-plan section").count(), 7);
  assert.equal(await page.locator(".studio-print-plan").isVisible(), true);
  assert.match(
    await page.locator(".studio-print-plan").innerText(),
    /Birthday breakfast; vegetarian picnic/,
  );
  assert.match(
    await page.locator(".studio-print-plan").innerText(),
    /Kubu Kubu/,
  );
  await page.pdf({
    path: path.join(output, "itinerary-studio-print.pdf"),
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  report.checks.push(
    "Print includes all seven days and personalised selections",
  );
  let submitted;
  let rejectFirst = true;
  await page.route("**/api/enquire", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: rejectFirst ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        rejectFirst
          ? { error: "Verification: save unavailable." }
          : {
              success: true,
              stored: true,
              emailed: false,
              id: "enq_studio_ui_test",
              message:
                "Enquiry received and saved. The team reviews submissions regularly.",
            },
      ),
    });
  });
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Studio verification");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("studio-verification@example.com");
  await page
    .getByRole("button", { name: "Send my itinerary", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Verification: save unavailable." })
    .last()
    .waitFor();
  assert.equal(await page.locator(".studio-receipt").count(), 0);
  rejectFirst = false;
  await page
    .getByRole("button", { name: "Send my itinerary", exact: true })
    .click();
  await page.locator(".studio-receipt").waitFor();
  assert.equal(submitted.craft.routeId, data.routeId);
  assert.deepEqual(submitted.craft.choices, data.choices);
  assert.equal(submitted.partySize, 2);
  assert.ok(!("price" in submitted.craft));
  report.checks.push(
    "Failed save stays actionable; mocked success carries every daily choice and returns an honest saved receipt",
  );
  const malicious = structuredClone(submitted);
  malicious.craft.choices[0].propertyId = "kubu-kubu";
  const invalid = await page.request.post(`${base}/api/enquire`, {
    data: malicious,
  });
  assert.equal(invalid.status(), 400);
  assert.match((await invalid.json()).error, /Day 1/);
  report.checks.push(
    "Actual enquiry server rejects an out-of-region property before saving",
  );
  if (process.env.BOKER_LOCAL_PERSIST_TEST === "1") {
    assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
    const accepted = await page.request.post(`${base}/api/enquire`, {
      data: submitted,
      timeout: 90000,
    });
    assert.equal(accepted.status(), 200);
    const receipt = await accepted.json();
    assert.equal(receipt.stored, true);
    assert.equal(receipt.emailed, false);
    const lines = (
      await readFile(path.join(output, "studio-local-test-leads.jsonl"), "utf8")
    )
      .trim()
      .split("\n")
      .map(JSON.parse);
    const saved = lines.find((lead) => lead.id === receipt.id);
    assert.ok(saved);
    assert.equal(saved.payload.craftedItinerary.days.length, 7);
    assert.equal(
      saved.payload.craftedItinerary.days[3].notes,
      "Birthday breakfast; vegetarian picnic.",
    );
    report.checks.push(
      "Isolated local server saved the complete canonical seven-day itinerary without external notification",
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await day(2);
  const carousel = page.locator(".studio-stay-carousel");
  const dimensions = await carousel.evaluate((e) => ({
    width: e.clientWidth,
    scroll: e.scrollWidth,
    left: e.scrollLeft,
  }));
  assert.ok(dimensions.scroll > dimensions.width);
  await carousel.evaluate((e) => (e.scrollLeft = 200));
  assert.ok(await carousel.evaluate((e) => e.scrollLeft > 0));
  const body = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(body.scroll <= body.width + 1, JSON.stringify(body));
  await carousel.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll(".studio-property-photo img")].some(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    undefined,
    { timeout: 45000 },
  );
  await page.screenshot({
    path: path.join(output, "itinerary-studio-mobile-editor.png"),
  });
  await page.screenshot({
    path: path.join(output, "itinerary-studio-mobile.png"),
    fullPage: true,
  });
  report.checks.push(
    "390px mobile has horizontal accommodation scrolling without page overflow",
  );
  await page
    .getByRole("button", { name: "Start a new draft", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("boker-itinerary-draft-v1")),
    null,
  );
  // Resolve the canonical Eyasi slug from the corpus rather than assuming its filename.
  const catalogue = JSON.parse(
    await readFile("src/data/curatedPackages.json", "utf8"),
  );
  const eyasi = catalogue.find((p) => p.code === "BA-4D-EYASI");
  await page.goto(`${base}/plan?package=${eyasi.slug}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(
    () => !document.querySelector(".studio-preferences fieldset").disabled,
  );
  assert.equal(
    await page.getByLabel("Trip length", { exact: true }).inputValue(),
    "4",
  );
  assert.equal(
    await page
      .getByRole("checkbox", { name: "Lake Eyasi", exact: true })
      .isChecked(),
    true,
  );
  await page
    .getByRole("button", { name: "Build my itinerary", exact: true })
    .click();
  await page.locator(".studio-day").first().waitFor();
  assert.equal(await page.locator(".studio-day").count(), 4);
  await day(2);
  assert.match(
    await page.locator(".studio-stays").innerText(),
    /Lake Eyasi Safari Lodge/,
  );
  assert.doesNotMatch(
    await page.locator(".studio-stays").innerText(),
    /Kubu Kubu|Karatu/,
  );
  report.checks.push(
    "Source-only Lake Eyasi package prefill produces its full programme and geographically correct stays",
  );
  await page.goto(`${base}/plan?park=ruaha`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => !document.querySelector(".studio-preferences fieldset").disabled,
  );
  assert.equal(
    await page
      .getByRole("checkbox", { name: "Ruaha", exact: true })
      .isChecked(),
    true,
  );
  assert.equal(await page.locator(".studio-inspiration article").count(), 0);
  await page.getByLabel("Arrival date", { exact: true }).fill("2027-06-10");
  await page
    .getByRole("button", { name: "Build my itinerary", exact: true })
    .click();
  await page.locator(".studio-day").first().waitFor({ timeout: 45000 });
  assert.equal(await page.locator(".studio-day").count(), 7);
  assert.match(
    await page.locator(".studio-route-options").innerText(),
    /Bespoke route/i,
  );
  await page
    .locator(".studio-day-heading")
    .filter({ hasText: /Overnight: Ruaha/ })
    .first()
    .click();
  assert.match(
    await page.locator(".studio-stays").innerText(),
    /Jabali Ridge|Mwagusi/,
  );
  report.checks.push(
    "Live managed southern preview still works, with suitable visual accommodation options",
  );
  await page.goto(`${base}/boker?park=tarangire`, {
    waitUntil: "domcontentloaded",
  });
  assert.match(page.url(), /\/plan\?park=tarangire/);
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(output, "itinerary-studio-checks.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await page
    .screenshot({
      path: path.join(output, "itinerary-studio-failure.png"),
      fullPage: true,
    })
    .catch(() => {});
  throw error;
} finally {
  await browser.close();
}
