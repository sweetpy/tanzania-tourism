import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const base = process.env.BOKER_TEST_URL || "http://127.0.0.1:3100";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" ? { channel: "msedge" } : {}),
});
const page = await browser.newPage();
let releaseScripts;
const scriptsReady = new Promise((resolve) => {
  releaseScripts = resolve;
});
let submitted;
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.route(/\/_next\/.*\.js(?:\?|$)/, async (route) => {
    await scriptsReady;
    await route.continue();
  });
  await page.route("**/api/enquire", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        stored: true,
        emailed: false,
        id: "MOCK-READINESS-ENQUIRY",
      }),
    });
  });
  await page.goto(
    `${base}/enquire?package=8-day-mara-migration-safari&partySize=5&travelDates=2027-08-10&message=Please%20quote%20our%20journey`,
    { waitUntil: "commit", timeout: 90000 },
  );
  const group = page.getByRole("group", {
    name: "Your trip enquiry",
    exact: true,
  });
  await group.waitFor();
  assert.equal(await group.getAttribute("disabled"), "");
  assert.equal(
    await page.getByLabel("Full name *", { exact: true }).isDisabled(),
    true,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Submit enquiry", exact: true })
      .isDisabled(),
    true,
  );
  releaseScripts();
  await page
    .getByLabel("Full name *", { exact: true })
    .fill("Readiness verification", { timeout: 60000 });
  await page
    .getByLabel("Email *", { exact: true })
    .fill("readiness-verification@example.com");
  await page
    .getByRole("button", { name: "Submit enquiry", exact: true })
    .click();
  await page.getByText("MOCK-READINESS-ENQUIRY", { exact: true }).waitFor();
  assert.equal(submitted.packageSlug, "8-day-mara-migration-safari");
  assert.equal(submitted.partySize, "5");
  assert.doesNotMatch(page.url(), /readiness-verification|name=/);
  assert.deepEqual(errors, []);
  const report = {
    base,
    checkedAt: new Date().toISOString(),
    checks: [
      "Form stays disabled while application scripts are delayed",
      "After readiness, submission uses the enquiry API with intact package preferences and no contact details in the URL",
    ],
    enquiry: "Mocked; no public lead or notification submitted",
    errors,
  };
  await mkdir("output/verification", { recursive: true });
  await writeFile(
    "output/verification/enquiry-readiness-checks.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  releaseScripts();
  await browser.close();
}
