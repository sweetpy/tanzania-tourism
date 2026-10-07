import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import Module from "node:module";
import {
  addDays,
  validDate,
  todayInTanzania,
  parseRegistration,
  initialRegistrationStatus,
  priceToMinor,
  parseGroupCurrency,
  calendarFile,
  safeCsv,
} from "../src/lib/groupPolicy.ts";
const departure = {
  id: "meru-2027-01-10",
  templateId: "mount-meru",
  startDate: "2027-01-10",
  endDate: "2027-01-15",
  deadline: "2026-12-10",
  status: "proposed",
  capacity: null,
  occupied: 0,
  adultPriceMinor: null,
  currency: "TZS",
  version: 1,
  title: "Mount Meru, together",
};
const contact = () => ({
  name: "Group verification",
  email: "group-test@example.com",
  phone: "",
  adults: 2,
  childAges: [],
  notes: "",
  marketing: false,
  consent: true,
  requestKey: randomUUID(),
  accessToken: randomBytes(32).toString("base64url"),
  departureId: departure.id,
  residency: "tz-resident",
  waitlist: true,
});
test("Calendar dates remain valid across leap years and Tanzania midnight", () => {
  assert.equal(validDate("2027-02-29"), false);
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(addDays("2028-02-28", 2), "2028-03-01");
  assert.equal(todayInTanzania(new Date("2026-10-07T22:30:00Z")), "2026-10-08");
});
test("Permit, age, consent and party validation protects group registration", () => {
  assert.equal(
    parseRegistration(contact(), { minimumAge: 16 }).residency,
    "tz-resident",
  );
  assert.throws(
    () =>
      parseRegistration({ ...contact(), childAges: [15] }, { minimumAge: 16 }),
    /ages 16/,
  );
  assert.throws(
    () =>
      parseRegistration(
        { ...contact(), adults: 12, childAges: [17] },
        { minimumAge: 16 },
      ),
    /twelve travellers/,
  );
  assert.throws(
    () =>
      parseRegistration({ ...contact(), consent: false }, { minimumAge: 0 }),
    /agree/,
  );
  assert.throws(
    () =>
      parseRegistration({ ...contact(), childAges: ["9"] }, { minimumAge: 0 }),
    /child/,
  );
  assert.throws(
    () =>
      parseRegistration(
        { ...contact(), residency: "invented" },
        { minimumAge: 0 },
      ),
    /residency/,
  );
});
test("Proposed trips collect interest; full trips offer a waitlist; closed dates reject requests", () => {
  assert.equal(
    initialRegistrationStatus(departure, 2, true, "2026-10-07"),
    "interest",
  );
  const open = {
    ...departure,
    status: "open",
    capacity: 2,
    occupied: 1,
    adultPriceMinor: 25000,
  };
  assert.equal(
    initialRegistrationStatus(open, 1, false, "2026-10-07"),
    "requested",
  );
  assert.equal(
    initialRegistrationStatus(open, 2, true, "2026-10-07"),
    "waitlisted",
  );
  assert.throws(
    () => initialRegistrationStatus(open, 2, false, "2026-10-07"),
    /not enough/,
  );
  assert.throws(
    () =>
      initialRegistrationStatus(
        { ...departure, status: "cancelled" },
        1,
        true,
        "2026-10-07",
      ),
    /closed/,
  );
  assert.throws(
    () => initialRegistrationStatus(departure, 1, true, "2027-01-11"),
    /closed/,
  );
});
test("Native TZS amounts stay whole; currency and USD precision are explicit", () => {
  assert.equal(priceToMinor("5483750", "TZS"), 5483750);
  assert.equal(priceToMinor("250.25", "USD"), 25025);
  assert.throws(() => priceToMinor("250.25", "TZS"), /whole/);
  assert.throws(() => priceToMinor("-5", "USD"), /positive/);
  assert.throws(() => parseGroupCurrency("EUR"), /USD or TZS/);
  assert.equal(priceToMinor("", "USD", true), null);
});
test("Calendar files have exclusive end dates, stable IDs, tentative status and safe folding", () => {
  const output = calendarFile(
    {
      ...departure,
      title: "A long mountain name ".repeat(12) + "\nWith, friends",
    },
    { town: "Arusha" },
    "https://www.bokeradventure.com",
  );
  assert.match(output, /DTEND;VALUE=DATE:20270116/);
  assert.match(output, /STATUS:TENTATIVE/);
  assert.match(output, /UID:meru-2027-01-10@bokeradventure.com/);
  assert.ok(
    output.split("\r\n").every((line) => Buffer.byteLength(line) <= 75),
  );
  assert.match(output.replace(/\r\n /g, ""), /\\nWith\\, friends/);
  assert.match(
    calendarFile(
      { ...departure, status: "cancelled" },
      { town: "Arusha" },
      "https://www.bokeradventure.com",
    ),
    /STATUS:CANCELLED/,
  );
});
test("CSV exports neutralise formula cells and quote multiline notes", () => {
  assert.equal(safeCsv("=SUM(A1)"), `"'=SUM(A1)"`);
  assert.equal(safeCsv(" +12345"), `"' +12345"`);
  assert.equal(safeCsv('hello,"world"\nnext'), '"hello,""world""\nnext"');
});

// Compile the real server modules for a local PostgreSQL integration test.
// The test refuses any host or port other than its isolated loopback cluster.
const database = process.env.BOKER_GROUP_TEST_DATABASE_URL;
test(
  "Real PostgreSQL: idempotency, capability privacy, concurrent seat offers, confirmation and cancellation",
  { skip: !database },
  async (context) => {
    const url = new URL(database);
    assert.equal(url.hostname, "127.0.0.1");
    assert.equal(url.port, "5547");
    assert.equal(url.username, "boker_group_test");
    process.env.BOKER_GROUP_DATABASE_URL = database;
    const require = createRequire(import.meta.url),
      ts = require("typescript"),
      root = path.resolve("."),
      resolve = Module._resolveFilename;
    Module._resolveFilename = function (specifier, parent, ...args) {
      return resolve.call(
        this,
        specifier.startsWith("@/")
          ? path.join(root, "src", specifier.slice(2))
          : specifier,
        parent,
        ...args,
      );
    };
    Module._extensions[".ts"] = (module, file) =>
      module._compile(
        ts.transpileModule(readFileSync(file, "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
            esModuleInterop: true,
            resolveJsonModule: true,
          },
        }).outputText,
        file,
      );
    const store = require("../src/lib/groupStore.ts"),
      catalogue = require("../src/data/groupTours.ts"),
      db = require("../src/lib/groupDatabase.ts");
    context.after(() => db.closeGroupDatabase());
    const seeds = catalogue.seedGroupCalendar();
    assert.ok(seeds.length > 60);
    assert.ok(
      seeds.every((d) => d.adultPriceMinor === null && d.status === "proposed"),
    );
    assert.equal(new Set(seeds.map((d) => d.id)).size, seeds.length);
    const mountains = seeds.filter(
      (d) => catalogue.getGroupTemplate(d.templateId).kind === "climbing",
    );
    assert.ok(mountains.length > 12);
    assert.ok(mountains.every((d) => d.deadline >= todayInTanzania()));
    await store.seedDepartures();
    const prepared = seeds.find((d) => d.templateId === "marangu-hike");
    const proposed = await store.saveDeparture({
      ...prepared,
      id: `local-policy-${randomUUID()}`,
      title: "Isolated proposed registration test",
      adultPrice: "",
    });
    const request = { ...contact(), departureId: proposed.id };
    const first = await store.registerGroup(request),
      repeat = await store.registerGroup(request);
    assert.equal(first.status, "interest");
    assert.equal(first.id, repeat.id);
    assert.equal(first.token, repeat.token);
    assert.equal(
      (await store.getRegistration(first.id, first.token)).contact.name,
      request.name,
    );
    await assert.rejects(
      store.getRegistration(first.id, randomBytes(32).toString("base64url")),
      (error) => error.status === 401,
    );
    const sameContact = await store.registerGroup({
      ...request,
      requestKey: randomUUID(),
      accessToken: randomBytes(32).toString("base64url"),
    });
    assert.notEqual(sameContact.id, first.id);
    const start = addDays(todayInTanzania(), 90),
      created = await store.saveDeparture({
        templateId: "marangu-hike",
        title: "Isolated group inventory test",
        startDate: start,
        deadline: addDays(start, -5),
        status: "open",
        capacity: 2,
        minimumGroup: 2,
        currency: "TZS",
        adultPrice: "120000",
        priceNote:
          "Test-only exact group selling basis and cancellation terms.",
        note: "Local integration only",
        arrangementsConfirmed: true,
      });
    const a = await store.registerGroup({
        ...contact(),
        departureId: created.id,
      }),
      b = await store.registerGroup({ ...contact(), departureId: created.id });
    assert.equal(a.status, "requested");
    assert.equal((await store.getDeparture(created.id)).occupied, 0);
    const offer = {
      total: "240000",
      currency: "TZS",
      terms:
        "Local test offer: two guests, agreed services and written payment and cancellation terms. This is not a real trip.",
    };
    const attempts = await Promise.allSettled([
      store.updateRegistration(a.id, "offer", offer),
      store.updateRegistration(b.id, "offer", offer),
    ]);
    assert.equal(attempts.filter((v) => v.status === "fulfilled").length, 1);
    assert.equal(
      attempts.find((v) => v.status === "rejected").reason.status,
      409,
    );
    assert.equal((await store.getDeparture(created.id)).occupied, 2);
    const winner = attempts[0].status === "fulfilled" ? a : b,
      other = winner.id === a.id ? b : a;
    await assert.rejects(
      store.updateRegistration(winner.id, "confirm", {
        paymentVerified: true,
        paymentReference: "test-authorisation",
      }),
      (error) => error.status === 409,
    );
    await assert.rejects(
      store.updateRegistration(winner.id, "offer", offer, winner.token),
      (error) => error.status === 403,
    );
    await store.updateRegistration(
      winner.id,
      "accept",
      { acceptTerms: true },
      winner.token,
    );
    await assert.rejects(
      store.updateRegistration(winner.id, "confirm", {
        paymentVerified: false,
        paymentReference: "test-authorisation",
      }),
      (error) => error.status === 400,
    );
    const confirmed = await store.updateRegistration(winner.id, "confirm", {
      paymentVerified: true,
      paymentReference: "test-authorisation",
    });
    assert.equal(confirmed.status, "confirmed");
    await assert.rejects(
      store.saveDeparture({
        ...created,
        adultPrice: "120000",
        capacity: 1,
        minimumGroup: 1,
        arrangementsConfirmed: true,
      }),
      (error) => error.status === 409,
    );
    await assert.rejects(
      store.saveDeparture({
        ...created,
        adultPrice: "120000",
        version: 0,
        arrangementsConfirmed: true,
      }),
      (error) => error.status === 409,
    );
    await store.updateRegistration(winner.id, "cancel", {}, winner.token);
    assert.equal((await store.getDeparture(created.id)).occupied, 2);
    await store.updateRegistration(winner.id, "close-cancellation", {});
    assert.equal((await store.getDeparture(created.id)).occupied, 0);
    await store.updateRegistration(other.id, "offer", offer);
    const expired = new Date(Date.now() - 1000).toISOString();
    await db.query(
      "UPDATE boker_group_registrations SET hold_until=$2,payload=jsonb_set(payload,'{holdUntil}',to_jsonb($3::text)) WHERE id=$1",
      [other.id, expired, expired],
    );
    assert.equal((await store.getDeparture(created.id)).occupied, 0);
    assert.equal(
      (await store.getRegistration(other.id, other.token)).status,
      "waitlisted",
    );
    await assert.rejects(
      store.updateRegistration(
        other.id,
        "accept",
        { acceptTerms: true },
        other.token,
      ),
      (error) => error.status === 409,
    );
    const limiter = "test-" + randomUUID();
    await store.rateLimit(limiter, 2);
    await store.rateLimit(limiter, 2);
    await assert.rejects(
      store.rateLimit(limiter, 2),
      (error) => error.status === 429,
    );
    const rotated = await store.rotateRegistrationLink(first.id);
    await assert.rejects(
      store.getRegistration(first.id, first.token),
      (error) => error.status === 401,
    );
    assert.equal((await store.getRegistration(first.id, rotated)).id, first.id);
  },
);
