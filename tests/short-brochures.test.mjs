import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { rankBrochureRoutes } from "../src/lib/itineraryLearning.ts";
import {
  validateTrip,
  brochureRoute,
  defaultChoices,
} from "../src/lib/itineraryCraft.ts";
import { resolveCraft } from "../src/lib/resolveCraft.ts";
import { packagePriceLabel } from "../src/lib/packageTypes.ts";
const read = (file) =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
const corpus = read("../src/data/curatedPackages.json");
const model = read("../src/data/training/itinerary-ranker.json");
const properties = read("../src/data/itineraryProperties.json");
// Independently transcribed price tables: midrange/luxury for safaris; parties of 2/4 for day trips.
const expected = {
  "BA-2D-ARUSHA": [500, 800, 700, 1100],
  "BA-2D-TARANGIRE": [500, 800, 700, 1200],
  "BA-2D-MANYARA": [500, 800, 700, 1200],
  "BA-3D-TAR-NGOR": [1500, 2300, 1900, 3000],
  "BA-3D-MANYARA-NGOR": [1500, 2200, 1900, 3000],
  "BA-3D-TAR-NIGHT": [1700, 2500, 2000, 3200],
  "BA-DT-DULUTI": [90, 160, 65, 120],
  "BA-DT-TENGERU-COFFEE": [80, 130, 55, 95],
  "BA-DT-TENGERU-COOK": [85, 145, 60, 105],
  "BA-DT-MTOWAMBU": [145, 230, 90, 150],
  "BA-DT-OLPOPONGI": [175, 275, 120, 190],
  "BA-DT-ARUSHA-CITY": [55, 100, 40, 70],
  "BA-DT-MATERUNI": [80, 135, 55, 95],
  "BA-DT-MATERUNI-COFFEE": [75, 125, 50, 90],
  "BA-DT-MARANGU": [95, 165, 65, 120],
  "BA-DT-CHEMKA": [85, 145, 55, 95],
  "BA-DT-CHALA": [115, 190, 75, 130],
  "BA-DT-JIPE": [140, 230, 85, 145],
  "BA-DT-RAU": [55, 100, 40, 75],
  "BA-DT-MOSHI-TOWN": [50, 95, 35, 65],
  "BA-DT-ARUSHA-PARK": [235, 340, 160, 235],
  "BA-DT-TARANGIRE": [255, 380, 175, 260],
  "BA-DT-MANYARA": [250, 370, 170, 255],
  "BA-DT-NGORONGORO": [490, 675, 300, 415],
  "BA-DT-KILI-MARANGU": [235, 350, 180, 270],
  "BA-DT-KILI-SHIRA": [310, 470, 220, 335],
  "BA-DT-MKOMAZI": [245, 375, 155, 245],
};
const trip = {
  arrivalDate: "2027-06-10",
  days: 1,
  placeIds: ["tarangire"],
  style: "Day trip",
  adults: 2,
  childAges: [],
  budgetTier: "midrange",
  travellerFeeCategory: "non-east-african",
  circuit: "northern",
};
test("27 additions preserve all 54 ranges, departure bases and quote status without duplicate packages", () => {
  assert.equal(corpus.length, 47);
  assert.equal(new Set(corpus.map((p) => p.code)).size, 47);
  assert.equal(corpus.filter((p) => p.code === "BA-3D-TAR-NGOR").length, 1);
  for (const [code, ranges] of Object.entries(expected)) {
    const p = corpus.find((p) => p.code === code);
    assert.ok(p, code);
    assert.deepEqual(
      p.pricing.ranges.flatMap((r) => [r.minUsd, r.maxUsd]),
      ranges,
      code,
    );
    assert.equal(p.pricing.status, "on-request");
    assert.equal(packagePriceLabel(p), "Price on request");
    assert.match(p.source.sha256, /^[a-f0-9]{64}$/);
    if (p.kind === "day-trip") {
      assert.equal(p.nights, 0);
      assert.deepEqual(p.stays, []);
      assert.match(p.pricing.basis, new RegExp(`from ${p.departureTown}`));
      assert.deepEqual(
        p.pricing.ranges.map((r) => r.tier),
        ["private party of 2 adults", "private party of 4 adults"],
      );
      assert.match(p.finishNote, /before the activity day/);
    } else {
      assert.equal(p.itinerary[0].overnight, "Arusha");
      assert.match(p.finishNote, /airport transfer.*not included/);
    }
  }
});
test("learned routes distinguish an existing-hotel day outing from a safari with an arrival night", () => {
  for (const [days, style, code] of [
    [1, "Day trip", "BA-DT-TARANGIRE"],
    [2, "Classic safari", "BA-2D-TARANGIRE"],
    [3, "Night safari", "BA-3D-TAR-NIGHT"],
  ]) {
    const t = validateTrip({ ...trip, days, style }, "2026-10-07");
    const p = rankBrochureRoutes(corpus, model, t, true)[0];
    assert.equal(p.code, code);
    assert.equal(brochureRoute(p, t, model.version).days.length, days);
  }
  const kili = { ...trip, placeIds: ["kilimanjaro"] };
  assert.deepEqual(rankBrochureRoutes(corpus, model, kili, true), []);
  assert.equal(
    rankBrochureRoutes(
      corpus,
      model,
      { ...kili, style: "Active adventure" },
      true,
    ).length,
    2,
  );
  assert.deepEqual(
    rankBrochureRoutes(
      corpus,
      model,
      { ...kili, style: "Active adventure", childAges: [6] },
      true,
    ),
    [],
  );
});
test("day-trip enquiries reconstruct the correct town and prohibit invented hotel nights", async () => {
  const p = corpus.find((p) => p.code === "BA-DT-MATERUNI");
  const t = validateTrip({ ...trip, placeIds: p.destinations }, "2026-10-07");
  const r = brochureRoute(p, t, model.version);
  const choices = defaultChoices(r);
  const safe = await resolveCraft(
    { version: 1, trip: t, routeId: r.id, choices },
    corpus,
    model,
    properties,
  );
  assert.equal(safe.departureTown, "Moshi");
  assert.equal(safe.days[0].accommodation, null);
  assert.equal(safe.kind, "day-trip");
  await assert.rejects(
    resolveCraft(
      {
        version: 1,
        trip: t,
        routeId: r.id,
        choices: [{ ...choices[0], propertyId: "coffee" }],
      },
      corpus,
      model,
      properties,
    ),
    /Day 1/,
  );
  assert.throws(
    () =>
      validateTrip({ ...trip, days: 2, placeIds: ["materuni"] }, "2026-10-07"),
    /same safari circuit/,
  );
  assert.throws(
    () => validateTrip({ ...trip, days: 0 }, "2026-10-07"),
    /day trip/,
  );
});
test("shared brochure PDFs remain entirely outside development fitting when held out", () => {
  const heldout = new Set(model.evaluation.heldOutBrochures);
  const sources = new Set(
    corpus.filter((p) => heldout.has(p.code)).map((p) => p.source.sha256),
  );
  assert.equal(sources.size, 8);
  for (const p of corpus)
    if (sources.has(p.source.sha256)) assert.ok(heldout.has(p.code), p.code);
});
