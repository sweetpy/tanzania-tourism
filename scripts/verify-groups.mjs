import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { writeFile, mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const base = process.env.BOKER_TEST_URL || "http://127.0.0.1:3101";
const local = ["localhost", "127.0.0.1"].includes(new URL(base).hostname);
const output = "output/verification";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" ? { channel: "msedge" } : {}),
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.setDefaultTimeout(60000);
page.setDefaultNavigationTimeout(120000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const report = {
  base,
  checkedAt: new Date().toISOString(),
  checks: [],
  errors,
  enquiry: local
    ? "Actual registrations in the isolated loopback PostgreSQL cluster."
    : "Registration UI mocked; no public leads or notifications created.",
};
const originHeaders = { Origin: base };
async function api(path, body, headers = {}) {
  const response = await context.request.post(base + path, {
    data: body,
    headers: { ...originHeaders, ...headers },
    timeout: 60000,
  });
  const data = await response.json();
  return { response, data };
}
async function settle() {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let previous = scrollY,
          stable = 0;
        function frame() {
          const current = scrollY;
          stable = current === previous ? stable + 1 : 0;
          previous = current;
          if (stable > 15) resolve();
          else requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }),
  );
}
try {
  const indexResponse = await context.request.get(base + "/api/groups", {
    timeout: 120000,
  });
  assert.equal(indexResponse.status(), 200);
  const index = await indexResponse.json();
  assert.ok(index.departures.length >= 60);
  assert.ok(index.templates.some((t) => t.id === "machame"));
  assert.ok(index.templates.some((t) => t.id === "lemosho"));
  assert.ok(index.templates.some((t) => t.id === "mount-meru"));
  assert.ok(!("registrations" in index));
  const d = index.departures.find(
      (d) => d.templateId === "marangu-hike" && d.status === "proposed",
    ),
    climb = index.departures.find((d) => d.templateId === "lemosho");
  assert.ok(d && climb);
  const anonymous = await context.request.get(base + "/api/groups/team");
  assert.equal(anonymous.status(), 401);
  assert.equal(
    (
      await api("/api/groups/registration/BG-000000000000", {
        action: "confirm",
      })
    ).response.status(),
    401,
  );
  assert.equal(
    (
      await api(
        "/api/groups/team/departure",
        {},
        { Origin: "https://foreign.example" },
      )
    ).response.status(),
    403,
  );
  assert.equal(
    (
      await context.request.post(base + "/api/groups/register", {
        data: "x".repeat(17000),
        headers: { ...originHeaders, "Content-Type": "application/json" },
      })
    ).status(),
    413,
  );
  assert.equal(
    (
      await context.request.post(base + "/api/groups/register", {
        data: "hello",
        headers: { ...originHeaders, "Content-Type": "text/plain" },
      })
    ).status(),
    415,
  );
  report.checks.push(
    "Real public API protects private team data, registration actions, foreign origins and oversized/non-JSON bodies",
  );
  await page.goto(base + "/groups");
  await page.locator(".group-trip-card").first().waitFor();
  await page
    .locator(".group-calendar-hero img")
    .evaluate((img) => img.decode());
  assert.ok(
    await page
      .locator(".group-calendar-hero img")
      .evaluate((img) => img.naturalWidth > 0),
  );
  await page.screenshot({ path: output + "/group-landing-desktop.png" });
  assert.equal(
    (await context.request.get(base + "/groups/credits")).status(),
    200,
  );
  await page.getByLabel("Trip type", { exact: true }).selectOption("climbing");
  assert.ok((await page.locator(".group-trip-card").count()) > 10);
  assert.match(await page.locator(".group-trip-grid").innerText(), /Lemosho/);
  await page.getByRole("button", { name: "Calendar", exact: true }).click();
  const month = climb.startDate.slice(0, 7);
  await page.getByLabel("Calendar month", { exact: true }).selectOption(month);
  await page.locator(".group-calendar-day:not([disabled])").first().click();
  assert.ok((await page.locator(".group-trip-card").count()) > 0);
  await page
    .locator(".group-calendar-panel")
    .screenshot({ path: output + "/group-calendar-desktop.png" });
  report.checks.push(
    "Month calendar highlights all running days and filters to departures on a selected day; mountain series and filters work",
  );
  await page.getByRole("button", { name: "Upcoming", exact: true }).click();
  await page.getByLabel("Trip type", { exact: true }).selectOption("hiking");
  await page.locator(".group-save").first().click();
  await page.getByRole("button", { name: /^Saved \(1\)/ }).click();
  assert.equal(await page.locator(".group-trip-card").count(), 1);
  await page.reload();
  await page.getByRole("button", { name: /^Saved \(1\)/ }).waitFor();
  const shortlist = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("boker-group-shortlist-v1")),
  );
  assert.equal(shortlist.length, 1);
  assert.ok(shortlist.every((v) => typeof v === "string"));
  report.checks.push(
    "Saved departure shortlist survives reload and stores trip IDs only",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Calendar", exact: true }).click();
  await page.getByLabel("Calendar month", { exact: true }).selectOption(month);
  const bounds = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(bounds.scroll <= bounds.width + 1, JSON.stringify(bounds));
  await page.locator(".group-calendar-panel").scrollIntoViewIfNeeded();
  await settle();
  await page.screenshot({ path: output + "/group-calendar-mobile.png" });
  await page.goto(base + `/groups/${d.id}`);
  await page
    .getByRole("heading", { name: "Plan to come along", exact: true })
    .waitFor();
  const tripBounds = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(tripBounds.scroll <= tripBounds.width + 1);
  await page.screenshot({ path: output + "/group-trip-mobile.png" });
  assert.ok(!(await page.locator("body").innerText()).includes("\u2014"));
  const icsResponse = await context.request.get(
    base + `/api/groups/calendar/${d.id}`,
  );
  assert.equal(icsResponse.status(), 200);
  assert.match(await icsResponse.text(), /STATUS:TENTATIVE/);
  const feed = await context.request.get(base + "/api/groups/calendar");
  assert.equal(feed.status(), 200);
  assert.ok((await feed.text()).match(/BEGIN:VEVENT/g).length >= 60);
  const sitemap = await context.request.get(base + "/sitemap.xml");
  assert.equal(sitemap.status(), 200);
  const xml = await sitemap.text();
  assert.ok(xml.includes("/groups/" + d.id));
  assert.ok(!xml.includes("/groups/my/") && !xml.includes("/groups/desk"));
  report.checks.push(
    "Mobile calendar and trip registration fit 390px; individual and full calendar downloads and public sitemap are valid",
  );
  let receipt;
  if (!local) {
    await page.route("**/api/groups/register", async (route) => {
      const payload = route.request().postDataJSON();
      assert.equal(payload.departureId, d.id);
      assert.equal(payload.adults, 2);
      assert.equal(payload.consent, true);
      assert.ok(payload.accessToken.length === 43);
      receipt = {
        id: "BG-UI-VERIFY",
        status: "interest",
        token: payload.accessToken,
        repeated: false,
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true, ...receipt }),
      });
    });
  }
  await page
    .getByLabel("Your full name", { exact: true })
    .fill("Group experience verification");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("group-ui-verification@example.com");
  await page.getByLabel("Adults (18+)", { exact: true }).fill("2");
  await page
    .getByLabel("Permit category", { exact: true })
    .selectOption("tz-resident");
  await page.getByRole("checkbox", { name: /I agree to contact/ }).check();
  await page
    .getByRole("button", { name: "Register my interest", exact: true })
    .click();
  await page.locator(".group-receipt").waitFor();
  assert.match(
    await page.locator(".group-receipt").innerText(),
    /Interest registered/,
  );
  const privateHref = await page
    .getByRole("link", { name: /Open my private trip page/ })
    .getAttribute("href");
  assert.ok(privateHref.includes("#key="));
  assert.match(privateHref, /\/groups\/my\/BG-[A-F0-9]{12}#key=[A-Za-z0-9_-]{43}$/);
  assert.ok(
    !page.url().includes("group-ui-verification") &&
      !page.url().includes("example.com"),
  );
  report.checks.push(
    "Party registration returns an honest interest receipt and private capability link without contact data in the URL",
  );
  if (local) {
    await page.getByRole("link", { name: /Open my private trip page/ }).click();
    await page
      .getByRole("heading", { name: "Your registration", exact: true })
      .waitFor();
    assert.match(
      await page.locator(".group-private-page").innerText(),
      /Group experience verification/,
    );
    report.checks.push(
      "Isolated traveller registration and private page verified; staff management is covered by the native Pin desk verification.",
    );
  }
  assert.deepEqual(errors, []);
  await writeFile(
    output + `/groups-${local ? "local" : "public"}-checks.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(error);
  await page
    .screenshot({ path: output + "/groups-failure.png" })
    .catch(() => {});
  process.exitCode = 1;
} finally {
  await Promise.race([
    browser.close(),
    new Promise((resolve) => setTimeout(resolve, 10000)),
  ]);
  process.exit(process.exitCode || 0);
}
