import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const base = process.env.BOKER_TEST_URL || "http://127.0.0.1:3100";
const catalogue = JSON.parse(
  await readFile("src/data/curatedPackages.json", "utf8"),
);
const output = path.resolve("output/verification");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" ? { channel: "msedge" } : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const report = {
  base,
  packages: [],
  filters: false,
  recommendations: [],
  enquiries: "Mocked only. No live lead or email sent.",
  errors,
};
try {
  for (const pkg of catalogue) {
    const response = await page.goto(`${base}/packages/${pkg.slug}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    assert.equal(response.status(), 200, pkg.slug);
    await page
      .getByRole("heading", { level: 1, name: pkg.name, exact: true })
      .waitFor();
    assert.equal(
      await page.locator("#daily-plan + p + ol > li").count(),
      pkg.days,
      pkg.code,
    );
    const budget = await page.locator("aside").innerText();
    for (const range of pkg.pricing.ranges) {
      assert.ok(
        budget.includes(range.minUsd.toLocaleString("en-US")),
        pkg.code,
      );
      assert.ok(
        budget.includes(range.maxUsd.toLocaleString("en-US")),
        pkg.code,
      );
    }
    assert.match(
      budget,
      pkg.kind === "day-trip"
        ? /two or four adults/
        : /two non-resident adults/,
    );
    assert.match(budget, /not a confirmed quote/);
    report.packages.push({ code: pkg.code, status: 200, days: pkg.days });
  }
  await page.goto(`${base}/packages`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Trip length").selectOption("4");
  await page
    .getByRole("status")
    .filter({ hasText: /^3 journeys/ })
    .waitFor();
  await page.getByLabel("Find a journey", { exact: true }).fill("Eyasi");
  await page
    .getByRole("status")
    .filter({ hasText: /^1 journey/ })
    .waitFor();
  await page
    .getByRole("link", {
      name: "4-Day Lake Eyasi: Hadzabe & Datoga",
      exact: true,
    })
    .waitFor();
  await page.getByLabel("Find a journey", { exact: true }).fill("");
  await page.getByLabel("Trip length").selectOption("");
  await page
    .getByRole("status")
    .filter({ hasText: new RegExp(`^${catalogue.length + 3} journeys`) })
    .waitFor();
  report.filters = true;
  console.log(
    `Catalogue and all ${catalogue.length} prepared detail pages passed.`,
  );
  await page.screenshot({
    path: path.join(output, "package-catalogue-desktop.png"),
  });
  // Interactive itinerary verification now lives in verify-itinerary-studio.mjs.
  const query = new URLSearchParams({
    package: "8-day-mara-migration-safari",
    partySize: "5",
    travelDates: "2027-08-10",
    message:
      "Please quote our journey: 3 adults; children aged 6, 10; luxury; east-african-citizen.",
  });
  await page.goto(`${base}/enquire?${query}`, {
    waitUntil: "domcontentloaded",
  });
  assert.equal(
    await page.getByLabel("Party size *", { exact: true }).inputValue(),
    "5",
  );
  assert.equal(
    await page.getByLabel("Package preference").inputValue(),
    "8-day-mara-migration-safari",
  );
  let submitted;
  await page.route("**/api/enquire", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        id: "MOCK-PACKAGE-ENQUIRY",
        stored: true,
        emailed: false,
      }),
    });
  });
  await page
    .getByLabel("Full name *", { exact: true })
    .fill("Package UI verification");
  await page
    .getByLabel("Email *", { exact: true })
    .fill("ui-verification@example.com");
  await page.locator('button[type="submit"]').click();
  await page.getByText("MOCK-PACKAGE-ENQUIRY", { exact: true }).waitFor();
  console.log("Package enquiry context and mocked submission passed.");
  assert.equal(submitted.packageSlug, "8-day-mara-migration-safari");
  assert.equal(submitted.partySize, "5");
  assert.match(submitted.message, /east-african-citizen/);
  const old = await page.goto(`${base}/packages/migration-and-crater`, {
    waitUntil: "domcontentloaded",
  });
  assert.equal(old.status(), 200);
  assert.match(page.url(), /8-day-mara-migration-safari/);
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/packages",
      "/packages/5-day-serengeti-fly-in",
      "/plan?park=serengeti-central",
    ]) {
      await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded" });
      if (route.startsWith("/plan"))
        await page
          .locator(".studio-inspiration article")
          .first()
          .waitFor({ timeout: 40000 });
      const bounds = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      assert.ok(
        bounds.scroll <= bounds.width + 1,
        `${width} ${route} ${JSON.stringify(bounds)}`,
      );
      await page.screenshot({
        path: path.join(
          output,
          `packages-${width}-${route.startsWith("/plan") ? "planner" : route === "/packages" ? "catalogue" : "detail"}.png`,
        ),
      });
    }
  }
  await page.goto(`${base}/plan?park=ruaha`, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("checkbox", { name: /Ruaha/ })
    .waitFor({ timeout: 40000 });
  await page.waitForFunction(
    () => !document.querySelector(".studio-preferences fieldset").disabled,
  );
  assert.equal(await page.locator(".studio-inspiration article").count(), 0);
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(output, "package-browser-checks.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
