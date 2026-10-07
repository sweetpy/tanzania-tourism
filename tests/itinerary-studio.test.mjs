import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  rankBrochureRoutes,
  eligibleExample,
  FEATURE_NAMES,
} from "../src/lib/itineraryLearning.ts";
import {
  brochureRoute,
  customRoute,
  defaultChoices,
  propertiesFor,
  servicesFor,
  validateChoices,
  validateTrip,
  serializeCraft,
  dateAt,
} from "../src/lib/itineraryCraft.ts";
import { resolveCraft } from "../src/lib/resolveCraft.ts";
const json = (file) =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
const corpus = json("../src/data/curatedPackages.json");
const properties = json("../src/data/itineraryProperties.json");
const model = json("../src/data/training/itinerary-ranker.json");
const pairs = json("../src/data/training/route-preferences.json");
const trip = {
  arrivalDate: "2027-06-10",
  days: 7,
  placeIds: ["tarangire", "ngorongoro", "serengeti"],
  style: "Classic safari",
  adults: 2,
  childAges: [],
  budgetTier: "midrange",
  travellerFeeCategory: "non-east-african",
  circuit: "northern",
};
const pkg = corpus.find((p) => p.code === "BA-7D-CLASSIC");
const route = brochureRoute(pkg, trip, model.version);
test("trained model and labels are reproducible and tied to the exact public brochure corpus", () => {
  assert.equal(
    model.corpusSha256,
    createHash("sha256")
      .update(
        readFileSync(
          new URL("../src/data/curatedPackages.json", import.meta.url),
          "utf8",
        ).replace(/\r\n/g, "\n"),
      )
      .digest("hex"),
  );
  assert.deepEqual(model.featureNames, FEATURE_NAMES);
  assert.equal(model.training.documents, 47);
  assert.equal(model.training.sourceDocuments, 29);
  assert.equal(pairs.length, 688);
  assert.ok(model.weights.every((w) => Number.isFinite(w) && w > 0));
  assert.ok(
    pairs.every(
      (p) => !JSON.stringify(p).match(/email|phone|name|rate|price/i),
    ),
  );
  const before = readFileSync(
    new URL("../src/data/training/itinerary-ranker.json", import.meta.url),
    "utf8",
  );
  execFileSync(
    process.execPath,
    ["--experimental-strip-types", "scripts/train-itinerary-ranker.mjs"],
    { cwd: new URL("..", import.meta.url), stdio: "pipe" },
  );
  assert.equal(
    readFileSync(
      new URL("../src/data/training/itinerary-ranker.json", import.meta.url),
      "utf8",
    ),
    before,
  );
  const heldout = new Set(model.evaluation.heldOutBrochures);
  const training = pairs.filter(
    (p) => !heldout.has(p.positive) && !heldout.has(p.negative),
  );
  assert.ok(
    training.length > 0 &&
      training.every(
        (p) => !heldout.has(p.positive) && !heldout.has(p.negative),
      ),
  );
  assert.equal(
    model.evaluation.pairs,
    pairs.filter((p) => heldout.has(p.positive)).length,
  );
});
test("learned ranking finds the independently expected duration and style", () => {
  for (const [places, days, style, code] of [
    [["tarangire", "ngorongoro"], 4, "Classic safari", "BA-4D-CLASSIC"],
    [["serengeti"], 5, "Fly-in & fly-back", "BA-5D-SERENGETI-FLY"],
    [["lake-eyasi"], 4, "Culture & landscapes", "BA-4D-EYASI"],
    [
      ["tarangire", "ngorongoro", "serengeti"],
      7,
      "Classic safari",
      "BA-7D-CLASSIC",
    ],
  ])
    assert.equal(
      rankBrochureRoutes(
        corpus,
        model,
        { ...trip, placeIds: places, days, style },
        true,
      )[0].code,
      code,
    );
});
test("hard geography, complete seasonal window and child constraints cannot be overridden by model scores", () => {
  const exaggerated = { ...model, weights: [1e12, 1e12, 1e12, 1e12] };
  assert.deepEqual(
    rankBrochureRoutes(
      corpus,
      exaggerated,
      { ...trip, placeIds: ["ruaha"] },
      true,
    ),
    [],
  );
  assert.deepEqual(
    rankBrochureRoutes(
      corpus,
      exaggerated,
      { ...trip, placeIds: ["tarangire", "ruaha"] },
      true,
    ),
    [],
  );
  assert.deepEqual(
    rankBrochureRoutes(
      corpus,
      exaggerated,
      {
        ...trip,
        placeIds: ["ol-doinyo-lengai"],
        style: "Active adventure",
        childAges: [10],
      },
      true,
    ),
    [],
  );
  const mara = corpus.find((p) => p.code === "BA-8D-MARA");
  assert.equal(
    eligibleExample(mara, { ...trip, arrivalDate: "2027-10-28", days: 8 }),
    false,
  );
  assert.throws(
    () =>
      brochureRoute(
        mara,
        { ...trip, arrivalDate: "2027-10-28", days: 8 },
        model.version,
      ),
    /seasonal|fit/,
  );
  assert.equal(
    eligibleExample(mara, { ...trip, arrivalDate: "2027-08-10", days: 8 }),
    true,
  );
  assert.equal(
    eligibleExample(mara, { ...trip, arrivalDate: "2027-02-31", days: 8 }),
    false,
  );
});
test("all 47 programmes retain their nights, dates and meal plans", () => {
  for (const p of corpus) {
    const month = p.seasonMonths[0] || 6;
    const t = {
      ...trip,
      days: p.days,
      placeIds: p.destinations,
      arrivalDate: `2027-${String(month).padStart(2, "0")}-10`,
      style: p.category,
    };
    const r = brochureRoute(p, t, model.version);
    assert.equal(r.days.length, p.days);
    assert.equal(r.days.filter((d) => d.overnight !== "None").length, p.nights);
    assert.equal(r.days.at(-1).date, dateAt(t.arrivalDate, p.days - 1));
    assert.equal(r.days[0].meals, p.itinerary[0].meals);
    assert.equal(r.days.at(-1).overnight, "None");
    for (const d of r.days.slice(0, -1))
      assert.ok(
        propertiesFor(d, t, properties).length > 0,
        `${p.code}, day ${d.day} needs at least one real stay`,
      );
  }
  assert.equal(dateAt("2028-02-28", 2), "2028-03-01");
});
test("accommodation cannot be chosen in the wrong region, on departure, or while closed", () => {
  const choices = defaultChoices(route);
  choices[0].propertyId = "kubu-kubu";
  assert.throws(
    () => validateChoices(choices, route, trip, properties),
    /Day 1/,
  );
  choices[0].propertyId = null;
  choices[6].propertyId = "coffee";
  assert.throws(
    () => validateChoices(choices, route, trip, properties),
    /Day 7/,
  );
  const d = {
    ...route.days[1],
    overnight: "Tarangire National Park",
    date: "2027-04-10",
  };
  assert.ok(
    !propertiesFor(d, trip, properties).some((p) => p.id === "olivers"),
  );
  assert.ok(
    !propertiesFor(
      { ...d, date: "2027-06-10" },
      { ...trip, childAges: [4] },
      properties,
    ).some((p) => p.id === "olivers"),
  );
  const north = { ...d, overnight: "Northern Serengeti", date: "2027-08-10" };
  assert.ok(
    !propertiesFor(north, { ...trip, childAges: [4] }, properties).some(
      (p) => p.id === "sayari",
    ),
  );
  assert.ok(
    propertiesFor(north, { ...trip, childAges: [5] }, properties).some(
      (p) => p.id === "sayari",
    ),
  );
  assert.ok(
    propertiesFor(north, trip, properties).every(
      (p) => p.location === "Northern Serengeti",
    ),
  );
});
test("optional experiences respect transfer days, geography, included activities and family limits", () => {
  assert.ok(
    servicesFor(route.days[3], route, trip).some((s) => s.id === "balloon"),
  );
  assert.ok(
    !servicesFor(route.days[0], route, trip).some((s) => s.id === "balloon"),
  );
  assert.ok(
    !servicesFor(route.days[3], route, { ...trip, childAges: [4] }).some(
      (s) => s.id === "balloon",
    ),
  );
  const night = corpus.find((p) => p.code === "BA-4D-TAR-NIGHT");
  const r = brochureRoute(
    night,
    { ...trip, days: 4, placeIds: ["tarangire"], style: "Night safari" },
    model.version,
  );
  assert.ok(
    r.days.every(
      (d) => !servicesFor(d, r, trip).some((s) => s.id === "night-drive"),
    ),
  );
  const choices = defaultChoices(route);
  choices[0].services = ["balloon"];
  assert.throws(
    () => validateChoices(choices, route, trip, properties),
    /Day 1/,
  );
});
test("server reconstruction preserves selections and discards forged prices and daily content", async () => {
  const choices = defaultChoices(route);
  choices[0] = {
    ...choices[0],
    propertyId: "coffee",
    room: "Twin",
    services: ["dietary"],
    note: "Vegetarian meals please",
  };
  const input = {
    version: 1,
    trip,
    routeId: route.id,
    choices,
    totalUsd: 1,
    days: [{ description: "forged" }],
  };
  const saved = await resolveCraft(input, corpus, model, properties);
  assert.equal(saved.days[0].accommodation.id, "coffee");
  assert.equal(saved.days[0].roomPreference, "Twin");
  assert.equal(saved.days[0].notes, "Vegetarian meals please");
  assert.equal(saved.days[0].services[0].id, "dietary");
  assert.equal(saved.days[0].description, pkg.itinerary[0].description);
  assert.equal(saved.priceStatus, "dated-quote-required");
  assert.ok(!("totalUsd" in saved));
  assert.equal(saved.source.sha256, pkg.source.sha256);
  await assert.rejects(
    resolveCraft(
      { ...input, routeId: "brochure:fake" },
      corpus,
      model,
      properties,
    ),
    /available/,
  );
  assert.throws(
    () =>
      serializeCraft(
        route,
        trip,
        [...choices.slice(0, 6), choices[0]],
        properties,
      ),
    /duplicated|incomplete/,
  );
});
test("trip validation rejects impossible dates, mixed circuits and invalid parties", () => {
  for (const t of [
    { ...trip, arrivalDate: "2027-02-31" },
    { ...trip, arrivalDate: "2020-01-01" },
    { ...trip, placeIds: ["ruaha"] },
    { ...trip, childAges: [18] },
    { ...trip, adults: 20, childAges: [1] },
    { ...trip, placeIds: ["tarangire", "tarangire"] },
  ])
    assert.throws(() => validateTrip(t, "2026-10-06"));
});
test("custom drafts are rebuilt by their trusted resolver before choices are accepted", async () => {
  const custom = customRoute({
    id: "abc",
    title: "Southern safari",
    days: [
      {
        day: 1,
        date: trip.arrivalDate,
        parkName: "Ruaha",
        summary: "Trusted daily plan",
        overnight: "In or near Ruaha National Park",
        travelNote: null,
      },
      {
        day: 2,
        date: dateAt(trip.arrivalDate, 1),
        parkName: "Ruaha",
        summary: "Safari",
        overnight: "Ruaha",
        travelNote: null,
      },
      {
        day: 3,
        date: dateAt(trip.arrivalDate, 2),
        parkName: "Dar es Salaam",
        summary: "Departure",
        overnight: null,
        travelNote: null,
      },
    ],
  });
  const t = { ...trip, days: 3, placeIds: ["ruaha"], circuit: "southern" };
  const choices = defaultChoices(custom);
  choices[0].propertyId = "jabali";
  const saved = await resolveCraft(
    { version: 1, trip: t, routeId: custom.id, choices },
    corpus,
    model,
    properties,
    async () => custom,
  );
  assert.equal(saved.days[0].description, "Trusted daily plan");
  assert.equal(saved.days[0].accommodation.id, "jabali");
  await assert.rejects(
    resolveCraft(
      { version: 1, trip: t, routeId: "custom:other", choices },
      corpus,
      model,
      properties,
      async () => custom,
    ),
    /changed/,
  );
});
