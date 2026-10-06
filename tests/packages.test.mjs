import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  recommendPackages,
  packageEnquiryHref,
} from "../src/lib/packageRecommendations.ts";
import { packagePriceLabel } from "../src/lib/packageTypes.ts";

const catalogue = JSON.parse(
  readFileSync(
    new URL("../src/data/curatedPackages.json", import.meta.url),
    "utf8",
  ),
);
// Independently transcribed from the supplied price tables: midrange min/max, luxury min/max (USD pp).
const brochureRanges = {
  "BA-4D-CLASSIC": [2100, 3000, 2700, 4100],
  "BA-4D-EYASI": [1700, 2500, 2200, 3500],
  "BA-4D-TAR-NIGHT": [2200, 3300, 2600, 4100],
  "BA-5D-CLASSIC": [2500, 3700, 3400, 5100],
  "BA-5D-EYASI": [2200, 3300, 2900, 4600],
  "BA-5D-NGOR-SERENGETI": [3500, 5100, 4600, 7000],
  "BA-5D-SERENGETI-FLY": [3700, 5800, 5300, 8400],
  "BA-5D-TAR-NIGHT": [2600, 4100, 3500, 5500],
  "BA-6D-EYASI": [2900, 4400, 4100, 6300],
  "BA-6D-NATRON-NIGHT": [3100, 4800, 3800, 5800],
  "BA-6D-SERENGETI": [3900, 5600, 5300, 7900],
  "BA-6D-TAR-NIGHT": [3300, 4900, 4700, 7300],
  "BA-7D-CLASSIC": [3600, 5100, 5200, 7500],
  "BA-7D-EYASI": [3500, 5000, 4700, 7000],
  "BA-7D-LENGAI": [3100, 4600, 4000, 6100],
  "BA-7D-NATRON": [3600, 5300, 4800, 7200],
  "BA-7D-SERENGETI": [4500, 6500, 6100, 9100],
  "BA-8D-GRUMETI": [5100, 7200, 6700, 9800],
  "BA-8D-MARA": [5400, 7600, 7700, 10700],
  "NDUTU-CALVING": [4300, 5900, 6400, 8700],
};
test("all 20 brochures retain their 40 price ranges and the two-adult planning basis", () => {
  assert.equal(catalogue.length, 20);
  assert.equal(new Set(catalogue.map((pkg) => pkg.slug)).size, 20);
  for (const pkg of catalogue) {
    assert.deepEqual(
      pkg.pricing.ranges.flatMap((range) => [range.minUsd, range.maxUsd]),
      brochureRanges[pkg.code],
      pkg.code,
    );
    assert.equal(pkg.pricing.status, "planning");
    assert.equal(pkg.pricing.currency, "USD");
    assert.match(pkg.pricing.basis, /two non-resident adults/);
    assert.match(pkg.pricing.basis, /sharing/);
    assert.match(pkg.pricing.basis, /private safari vehicle/);
    assert.match(pkg.source.sha256, /^[a-f0-9]{64}$/);
    assert.ok(pkg.source.pricePage >= 1);
    assert.equal(pkg.fromPriceUsd, undefined);
  }
});
test("daily plans and overnight allocations account for the complete trip", () => {
  for (const pkg of catalogue) {
    assert.equal(pkg.itinerary.length, pkg.days, pkg.code);
    assert.deepEqual(
      pkg.itinerary.map((day) => day.day),
      Array.from({ length: pkg.days }, (_, i) => i + 1),
    );
    assert.equal(pkg.nights, pkg.days - 1, pkg.code);
    assert.equal(
      pkg.stays.reduce((sum, stay) => sum + stay.nights, 0),
      pkg.nights,
      pkg.code,
    );
    assert.equal(
      pkg.itinerary.filter((day) => day.overnight !== "None").length,
      pkg.nights,
      pkg.code,
    );
    assert.equal(pkg.itinerary.at(-1).overnight, "None");
  }
});
const choose = (parkIds, days, arrivalDate = "2027-08-10") =>
  recommendPackages(catalogue, { parkIds, days, arrivalDate });
test("duration and complete park coverage favour the short focused routes", () => {
  assert.equal(choose(["tarangire", "ngorongoro"], 4)[0].code, "BA-4D-CLASSIC");
  assert.equal(
    choose(["ngorongoro", "serengeti-central"], 5)[0].code,
    "BA-5D-NGOR-SERENGETI",
  );
  assert.equal(choose(["serengeti-central"], 5)[0].code, "BA-5D-SERENGETI-FLY");
  assert.equal(
    choose(["tarangire", "manyara", "ngorongoro"], 5)[0].code,
    "BA-5D-CLASSIC",
  );
});
test("migration recommendations respect calving, western and northern travel windows", () => {
  const parks = ["tarangire", "serengeti-central", "ngorongoro"];
  assert.equal(choose(parks, 8, "2027-02-10")[0].code, "NDUTU-CALVING");
  assert.equal(choose(parks, 8, "2027-06-10")[0].code, "BA-8D-GRUMETI");
  assert.equal(choose(parks, 8, "2027-08-10")[0].code, "BA-8D-MARA");
  assert.ok(
    choose(parks, 8, "2027-11-10").every((pkg) => !pkg.seasonMonths.length),
  );
  assert.ok(choose(parks, 8, "").every((pkg) => !pkg.seasonMonths.length));
});
test("unsupported or mixed circuits never receive unrelated northern packages", () => {
  assert.deepEqual(choose(["ruaha"], 6), []);
  assert.deepEqual(choose(["ruaha", "serengeti-central"], 7), []);
  assert.deepEqual(choose([], 7), []);
  assert.ok(choose(["serengeti-north"], 8).length);
});
test("budget requests never silently substitute a midrange rate", () => {
  assert.equal(packagePriceLabel(catalogue[0], "budget"), "Price on request");
  assert.match(
    packagePriceLabel(catalogue[0], "luxury"),
    /2,700.*4,100.*luxury planning range/,
  );
});
test("package enquiries carry the selected package, dates and actual party rather than a calculated brochure total", () => {
  const url = new URL(
    packageEnquiryHref(
      "5-day-serengeti-fly-back",
      {
        arrivalDate: "2027-08-10",
        days: 5,
        adults: 3,
        childAges: [6, 10],
        budgetTier: "luxury",
        budgetGrade: "premium",
        travellerFeeCategory: "east-african-citizen",
      },
      ["Serengeti"],
    ),
    "https://www.bokeradventure.com",
  );
  assert.equal(url.searchParams.get("package"), "5-day-serengeti-fly-back");
  assert.equal(url.searchParams.get("partySize"), "5");
  assert.equal(url.searchParams.get("travelDates"), "2027-08-10");
  assert.match(url.searchParams.get("message"), /children aged 6, 10/);
  assert.match(url.searchParams.get("message"), /luxury premium/);
  assert.match(url.searchParams.get("message"), /east-african-citizen/);
  assert.equal(url.searchParams.has("price"), false);
});
