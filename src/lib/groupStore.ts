import { randomBytes, createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { query, withClient } from "@/lib/groupDatabase";
import { getGroupTemplate, seedGroupCalendar } from "@/data/groupTours";
import {
  GroupError,
  addDays,
  initialRegistrationStatus,
  parseGroupCurrency,
  parseRegistration,
  priceToMinor,
  todayInTanzania,
  validDate,
} from "@/lib/groupPolicy";
import type {
  Departure,
  DepartureStatus,
  Registration,
  RegistrationStatus,
} from "@/lib/groupTypes";

import type { BackofficeActor } from "./groupBackofficeAuth";

declare global {
  var __bokerGroupsReady: Promise<void> | undefined;
  var __bokerGroupSeed: { date: string; ready: Promise<void> } | undefined;
}
export const groupSchema = `
CREATE TABLE IF NOT EXISTS boker_group_departures(id TEXT PRIMARY KEY,template_id TEXT NOT NULL,start_date DATE NOT NULL,status TEXT NOT NULL,payload JSONB NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS boker_group_registrations(id TEXT PRIMARY KEY,departure_id TEXT NOT NULL REFERENCES boker_group_departures(id),request_key TEXT UNIQUE NOT NULL,token_hash TEXT NOT NULL,status TEXT NOT NULL,seats INTEGER NOT NULL CHECK(seats BETWEEN 1 AND 12),hold_until TIMESTAMPTZ,payload JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS boker_group_audit(id BIGSERIAL PRIMARY KEY,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),entity_id TEXT NOT NULL,action TEXT NOT NULL,detail JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS boker_group_rate_limits(key TEXT PRIMARY KEY,hits INTEGER NOT NULL,expires_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS boker_group_backoffice_nonces(nonce TEXT PRIMARY KEY,expires_at TIMESTAMPTZ NOT NULL);
CREATE INDEX IF NOT EXISTS boker_group_dates_idx ON boker_group_departures(start_date);
CREATE INDEX IF NOT EXISTS boker_group_registration_departure_idx ON boker_group_registrations(departure_id,status);
`;
const occupiedSql =
  "COALESCE((SELECT SUM(r.seats) FROM boker_group_registrations r WHERE r.departure_id=d.id AND (r.status IN ('confirmed','cancellation-requested') OR (r.status IN ('offered','accepted') AND r.hold_until>NOW()))),0)::int";
const interestedSql =
  "COALESCE((SELECT SUM(r.seats) FROM boker_group_registrations r WHERE r.departure_id=d.id AND r.status NOT IN ('cancelled')),0)::int";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function ensureGroups() {
  if (!globalThis.__bokerGroupsReady)
    globalThis.__bokerGroupsReady = (async () => {
      await query(groupSchema);
    })().catch((error) => {
      globalThis.__bokerGroupsReady = undefined;
      throw error;
    });
  await globalThis.__bokerGroupsReady;
}
export async function claimBackofficeNonce(nonce: string) {
  await ensureGroups();
  await query(
    "DELETE FROM boker_group_backoffice_nonces WHERE expires_at<NOW()",
  );
  const result = await query(
    "INSERT INTO boker_group_backoffice_nonces(nonce,expires_at) VALUES($1,NOW()+INTERVAL '2 minutes') ON CONFLICT DO NOTHING RETURNING nonce",
    [nonce],
  );
  if (!result.rowCount)
    throw new GroupError(
      "This staff request has already been used. Refresh the desk.",
      409,
    );
}
export async function rateLimit(key: string, max = 12, minutes = 60) {
  await ensureGroups();
  const result = await query<{ hits: number }>(
    `INSERT INTO boker_group_rate_limits(key,hits,expires_at) VALUES($1,1,NOW()+($2*INTERVAL '1 minute')) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN boker_group_rate_limits.expires_at<NOW() THEN 1 ELSE boker_group_rate_limits.hits+1 END,expires_at=CASE WHEN boker_group_rate_limits.expires_at<NOW() THEN NOW()+($2*INTERVAL '1 minute') ELSE boker_group_rate_limits.expires_at END RETURNING hits`,
    [hash(key), minutes],
  );
  if (result.rows[0].hits > max)
    throw new GroupError("Too many attempts. Please try again later.", 429);
  if (Math.random() < 0.02)
    await query(
      "DELETE FROM boker_group_rate_limits WHERE expires_at<NOW()-INTERVAL '1 day'",
    );
}
export async function seedDepartures() {
  await ensureGroups();
  const date = todayInTanzania();
  if (globalThis.__bokerGroupSeed?.date === date)
    return globalThis.__bokerGroupSeed.ready;
  const ready = (async () => {
    const rows = seedGroupCalendar();
    await query(
      `INSERT INTO boker_group_departures(id,template_id,start_date,status,payload) SELECT item->>'id',item->>'templateId',(item->>'startDate')::date,item->>'status',item FROM jsonb_array_elements($1::jsonb) item ON CONFLICT(id) DO NOTHING`,
      [JSON.stringify(rows)],
    );
  })().catch((error) => {
    globalThis.__bokerGroupSeed = undefined;
    throw error;
  });
  globalThis.__bokerGroupSeed = { date, ready };
  await ready;
}
export async function getDeparture(
  id: string,
  privateAccess = false,
): Promise<Departure | undefined> {
  await seedDepartures();
  const result = await query<{
    payload: Departure;
    occupied: number;
    interested: number;
  }>(
    `SELECT d.payload,${occupiedSql} AS occupied,${interestedSql} AS interested FROM boker_group_departures d WHERE d.id=$1 ${privateAccess ? "" : "AND d.status<>'draft'"}`,
    [id],
  );
  const row = result.rows[0];
  return row
    ? { ...row.payload, occupied: row.occupied, interested: row.interested }
    : undefined;
}
export async function listDepartures(admin = false): Promise<Departure[]> {
  await seedDepartures();
  const result = await query<{
    payload: Departure;
    occupied: number;
    interested: number;
  }>(
    `SELECT d.payload,${occupiedSql} AS occupied,${interestedSql} AS interested FROM boker_group_departures d ${admin ? "" : "WHERE d.status<>'draft' AND d.start_date>=$1::date"} ORDER BY d.start_date,d.id`,
    admin ? [] : [todayInTanzania()],
  );
  return result.rows.map((row) => ({
    ...row.payload,
    occupied: row.occupied,
    interested: row.interested,
  }));
}
async function lockedDeparture(
  client: PoolClient,
  id: string,
): Promise<Departure> {
  const result = await client.query<{ payload: Departure }>(
    "SELECT payload FROM boker_group_departures WHERE id=$1 FOR UPDATE",
    [id],
  );
  if (!result.rows[0])
    throw new GroupError("This departure was not found.", 404);
  const counts = await client.query<{ occupied: number; interested: number }>(
    `SELECT ${occupiedSql} AS occupied,${interestedSql} AS interested FROM boker_group_departures d WHERE d.id=$1`,
    [id],
  );
  return { ...result.rows[0].payload, ...counts.rows[0] };
}
async function transaction<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  await ensureGroups();
  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}
async function audit(
  client: PoolClient,
  id: string,
  action: string,
  detail: unknown,
) {
  await client.query(
    "INSERT INTO boker_group_audit(entity_id,action,detail) VALUES($1,$2,$3::jsonb)",
    [id, action, JSON.stringify(detail)],
  );
}
export async function registerGroup(raw: unknown) {
  await seedDepartures();
  const departureId = (raw as Record<string, unknown>)?.departureId;
  if (typeof departureId !== "string" || departureId.length > 100)
    throw new GroupError("Choose a departure.");
  return transaction(async (client) => {
    const departure = await lockedDeparture(client, departureId),
      template = getGroupTemplate(departure.templateId);
    if (!template) throw new GroupError("This departure is unavailable.", 409);
    const contact = parseRegistration(raw, template);
    if (contact.website)
      throw new GroupError("Please try again without the website field.");
    const accessToken = (raw as Record<string, unknown>).accessToken;
    if (
      typeof accessToken !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(accessToken)
    )
      throw new GroupError("Refresh the page and try again.");
    const existing = await client.query<{
      payload: Registration;
      token_hash: string;
    }>(
      "SELECT payload,token_hash FROM boker_group_registrations WHERE request_key=$1",
      [contact.requestKey],
    );
    // A retried request recovers the same reference; personal details are never returned from this public endpoint.
    if (existing.rows[0]) {
      const previous = existing.rows[0].payload;
      if (
        previous.departureId !== departureId ||
        previous.contact.email !== contact.email ||
        previous.contact.name !== contact.name ||
        previous.seats !== contact.adults + contact.childAges.length
      )
        throw new GroupError(
          "This request has changed. Refresh the page to send a new registration.",
          409,
        );
      return {
        id: previous.id,
        status: previous.status,
        repeated: true,
        token:
          hash(accessToken) === existing.rows[0].token_hash
            ? accessToken
            : null,
      };
    }
    const status = initialRegistrationStatus(
      departure,
      contact.adults + contact.childAges.length,
      contact.waitlist,
    );
    const id = "BG-" + randomBytes(6).toString("hex").toUpperCase(),
      token = accessToken,
      now = new Date().toISOString();
    const registration: Registration = {
      id,
      departureId,
      createdAt: now,
      updatedAt: now,
      status,
      contact,
      seats: contact.adults + contact.childAges.length,
      offerTotalMinor: null,
      offerCurrency: departure.currency,
      offerTerms: "",
      holdUntil: null,
      paymentReference: "",
    };
    await client.query(
      "INSERT INTO boker_group_registrations(id,departure_id,request_key,token_hash,status,seats,payload) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)",
      [
        id,
        departureId,
        contact.requestKey,
        hash(token),
        status,
        registration.seats,
        JSON.stringify(registration),
      ],
    );
    await audit(client, id, "registration", {
      departureId,
      status,
      seats: registration.seats,
    });
    return { id, status, token, repeated: false };
  });
}
function effectiveRegistration(registration: Registration): Registration {
  return registration.holdUntil &&
    registration.holdUntil < new Date().toISOString() &&
    ["offered", "accepted"].includes(registration.status)
    ? { ...registration, status: "waitlisted" }
    : registration;
}
export async function getRegistration(
  id: string,
  token: string,
): Promise<Registration> {
  await ensureGroups();
  if (!/^[A-Za-z0-9_-]{43}$/.test(token))
    throw new GroupError(
      "Use the private link supplied with your registration.",
      401,
    );
  const result = await query<{ payload: Registration }>(
    "SELECT payload FROM boker_group_registrations WHERE id=$1 AND token_hash=$2",
    [id, hash(token)],
  );
  if (!result.rows[0])
    throw new GroupError("This private registration link is invalid.", 401);
  return effectiveRegistration(result.rows[0].payload);
}
export async function listRegistrations(): Promise<Registration[]> {
  await ensureGroups();
  const result = await query<{ payload: Registration }>(
    "SELECT payload FROM boker_group_registrations ORDER BY created_at DESC LIMIT 5000",
  );
  return result.rows.map((row) => effectiveRegistration(row.payload));
}
export async function rotateRegistrationLink(
  id: string,
  actor?: BackofficeActor,
) {
  await ensureGroups();
  const token = randomBytes(32).toString("base64url");
  return transaction(async (client) => {
    const result = await client.query(
      "UPDATE boker_group_registrations SET token_hash=$2,updated_at=NOW() WHERE id=$1 RETURNING id",
      [id, hash(token)],
    );
    if (!result.rowCount) throw new GroupError("Registration not found.", 404);
    await audit(client, id, "private-link-replaced", {
      actor: actor || "team",
    });
    return token;
  });
}
export async function saveDeparture(
  raw: Record<string, unknown>,
  actor?: BackofficeActor,
) {
  await seedDepartures();
  const template = getGroupTemplate(String(raw.templateId || ""));
  if (!template) throw new GroupError("Choose a prepared trip programme.");
  const startDate = raw.startDate;
  if (!validDate(startDate) || startDate > addDays(todayInTanzania(), 730))
    throw new GroupError(
      "Choose a valid departure date within the next two years.",
    );
  const status = raw.status as DepartureStatus;
  if (
    !["draft", "proposed", "open", "guaranteed", "cancelled"].includes(status)
  )
    throw new GroupError("Choose a valid departure status.");
  const currency = parseGroupCurrency(raw.currency),
    price = priceToMinor(raw.adultPrice, currency, true);
  const capacity =
      raw.capacity === "" || raw.capacity === null
        ? null
        : Number(raw.capacity),
    minimumGroup = Number(raw.minimumGroup);
  if (
    capacity !== null &&
    (!Number.isInteger(capacity) || capacity < 1 || capacity > 100)
  )
    throw new GroupError("Seat limit must be between one and 100.");
  if (
    !Number.isInteger(minimumGroup) ||
    minimumGroup < 1 ||
    minimumGroup > 100 ||
    (capacity !== null && minimumGroup > capacity)
  )
    throw new GroupError("Check the minimum group size.");
  if (
    ["open", "guaranteed"].includes(status) &&
    (price === null || capacity === null || raw.arrangementsConfirmed !== true)
  )
    throw new GroupError(
      "Confirm suppliers, services and selling terms, and enter the approved group price and seat limit before opening registration.",
    );
  if (!validDate(raw.deadline) || raw.deadline > startDate)
    throw new GroupError(
      "Choose a registration deadline on or before departure.",
    );
  const title = String(raw.title || template.name)
      .trim()
      .replace(/\u2014/g, ", "),
    note = String(raw.note || "")
      .trim()
      .replace(/\u2014/g, ", "),
    priceNote = String(raw.priceNote || "")
      .trim()
      .replace(/\u2014/g, ", ");
  if (
    title.length < 3 ||
    title.length > 150 ||
    note.length > 2000 ||
    priceNote.length < 10 ||
    priceNote.length > 2000
  )
    throw new GroupError(
      "Add clear price inclusions, supplements and booking terms.",
    );
  const id = raw.id
    ? String(raw.id)
    : `${template.id}-${startDate}-${randomUUID().slice(0, 8)}`;
  if (!/^[a-zA-Z0-9_-]{5,100}$/.test(id))
    throw new GroupError("Invalid departure reference.");
  return transaction(async (client) => {
    const oldResult = await client.query<{ payload: Departure }>(
      "SELECT payload FROM boker_group_departures WHERE id=$1 FOR UPDATE",
      [id],
    );
    const old = oldResult.rows[0] ? await lockedDeparture(client, id) : null;
    if (startDate < todayInTanzania() && old?.startDate !== startDate)
      throw new GroupError(
        "New departure dates must be in the future. Existing historical dates can be retained.",
      );
    if (old && Number(raw.version) !== old.version)
      throw new GroupError(
        "This departure has changed since you opened it. Refresh the desk before saving.",
        409,
      );
    if (
      old?.occupied &&
      (old.startDate !== startDate ||
        old.templateId !== template.id ||
        status === "draft" ||
        (capacity !== null && capacity < old.occupied))
    )
      throw new GroupError(
        "This departure has held or confirmed places. Resolve those bookings before changing its date, programme, visibility or reducing seats.",
        409,
      );
    const departure: Departure = {
      id,
      templateId: template.id,
      startDate,
      endDate: addDays(startDate, template.days - 1),
      status,
      title,
      note,
      capacity,
      minimumGroup,
      currency,
      adultPriceMinor: price,
      priceNote,
      deadline: raw.deadline as string,
      occupied: old?.occupied || 0,
      interested: old?.interested || 0,
      version: (old?.version || 0) + 1,
    };
    await client.query(
      "INSERT INTO boker_group_departures(id,template_id,start_date,status,payload) VALUES($1,$2,$3,$4,$5::jsonb) ON CONFLICT(id) DO UPDATE SET template_id=$2,start_date=$3,status=$4,payload=$5::jsonb,updated_at=NOW()",
      [id, template.id, startDate, status, JSON.stringify(departure)],
    );
    if (status === "cancelled")
      await client.query(
        "UPDATE boker_group_registrations SET status='cancellation-requested',payload=jsonb_set(payload,'{status}','\"cancellation-requested\"'::jsonb),updated_at=NOW() WHERE departure_id=$1 AND status IN ('offered','accepted','confirmed')",
        [id],
      );
    await audit(client, id, "departure-updated", {
      before: old,
      after: departure,
      actor: actor || "team",
    });
    return departure;
  });
}
export async function updateRegistration(
  id: string,
  action: string,
  raw: Record<string, unknown>,
  token?: string,
  actor?: BackofficeActor,
) {
  const publicRegistration = token ? await getRegistration(id, token) : null;
  await ensureGroups();
  return transaction(async (client) => {
    const initial = await client.query<{ departure_id: string }>(
      "SELECT departure_id FROM boker_group_registrations WHERE id=$1",
      [id],
    );
    if (!initial.rows[0]) throw new GroupError("Registration not found.", 404);
    const departure = await lockedDeparture(
      client,
      initial.rows[0].departure_id,
    );
    const result = await client.query<{ payload: Registration }>(
      "SELECT payload FROM boker_group_registrations WHERE id=$1 FOR UPDATE",
      [id],
    );
    const reg = effectiveRegistration(result.rows[0].payload),
      before = reg.status;
    if (
      publicRegistration &&
      !["accept", "cancel", "unsubscribe"].includes(action)
    )
      throw new GroupError("This action needs team access.", 403);
    let status: RegistrationStatus = reg.status;
    if (action === "unsubscribe") reg.contact.marketing = false;
    else if (action === "cancel")
      status = ["confirmed", "cancellation-requested"].includes(reg.status)
        ? "cancellation-requested"
        : "cancelled";
    else if (action === "accept") {
      if (reg.status !== "offered" || departure.status === "cancelled")
        throw new GroupError(
          "This offer is no longer available. Contact the team for a new offer.",
          409,
        );
      if (raw.acceptTerms !== true)
        throw new GroupError(
          "Review and accept the offer terms before continuing.",
        );
      status = "accepted";
    } else if (action === "offer") {
      if (
        ["confirmed", "cancellation-requested", "cancelled"].includes(
          reg.status,
        )
      )
        throw new GroupError(
          "Resolve this booking before making another offer.",
          409,
        );
      if (
        !["open", "guaranteed"].includes(departure.status) ||
        departure.startDate < todayInTanzania()
      )
        throw new GroupError(
          "Open a future departure before offering places.",
          409,
        );
      const ownHeld = ["offered", "accepted"].includes(reg.status)
        ? reg.seats
        : 0;
      if (
        departure.capacity === null ||
        departure.capacity - departure.occupied + ownHeld < reg.seats
      )
        throw new GroupError(
          "There are not enough places to offer this party. Keep them on the waitlist.",
          409,
        );
      const currency = parseGroupCurrency(raw.currency),
        total = priceToMinor(raw.total, currency);
      const terms = String(raw.terms || "")
        .trim()
        .replace(/\u2014/g, ", ");
      if (terms.length < 30 || terms.length > 4000)
        throw new GroupError(
          "Include the exact services, price, verified payment instructions, payment deadline and cancellation terms in the offer.",
        );
      reg.offerCurrency = currency;
      reg.offerTotalMinor = total;
      reg.offerTerms = terms;
      reg.holdUntil = new Date(
        Math.min(
          Date.now() + 48 * 3600_000,
          Date.parse(departure.startDate + "T00:00:00+03:00"),
        ),
      ).toISOString();
      status = "offered";
    } else if (action === "confirm") {
      if (
        reg.status !== "accepted" ||
        !reg.holdUntil ||
        Date.parse(reg.holdUntil) <= Date.now() ||
        departure.status === "cancelled"
      )
        throw new GroupError(
          "Confirm only an accepted, unexpired offer on an active departure.",
          409,
        );
      const paymentReference = String(raw.paymentReference || "").trim();
      if (paymentReference.length < 3 || paymentReference.length > 150)
        throw new GroupError(
          "Record the verified payment or agreed booking authorisation reference.",
        );
      if (raw.paymentVerified !== true)
        throw new GroupError(
          "Check payment or the agreed booking authorisation before confirming.",
        );
      reg.paymentReference = paymentReference;
      status = "confirmed";
      reg.holdUntil = null;
    } else if (action === "waitlist") {
      if (["confirmed", "cancellation-requested"].includes(reg.status))
        throw new GroupError(
          "Resolve the confirmed booking before moving it to the waitlist.",
          409,
        );
      status = "waitlisted";
      reg.holdUntil = null;
    } else if (action === "close-cancellation") {
      if (!["cancelled", "cancellation-requested"].includes(reg.status))
        throw new GroupError("Record a cancellation request first.", 409);
      status = "cancelled";
      reg.holdUntil = null;
    } else throw new GroupError("Unknown registration action.");
    reg.status = status;
    reg.updatedAt = new Date().toISOString();
    await client.query(
      "UPDATE boker_group_registrations SET status=$2,hold_until=$3,payload=$4::jsonb,updated_at=NOW() WHERE id=$1",
      [id, status, reg.holdUntil, JSON.stringify(reg)],
    );
    await audit(client, id, action, {
      before,
      after: status,
      actor: token ? "traveller" : actor || "team",
    });
    return reg;
  });
}
