"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Users,
  Mountain,
  ArrowRight,
  Check,
  Share2,
  Download,
} from "lucide-react";
import type {
  Departure,
  GroupTemplate,
  RegistrationStatus,
} from "@/lib/groupTypes";
import {
  formatGroupDate,
  groupMoney,
  todayInTanzania,
} from "@/lib/groupPolicy";
import {
  DepartureBadge,
  registrationLabels,
  useGroupReady,
} from "./GroupCommon";
type Receipt = {
  id: string;
  token: string | null;
  status: RegistrationStatus;
  repeated: boolean;
};
export function GroupTrip({
  departure: d,
  template: t,
  available,
}: {
  departure: Departure;
  template: GroupTemplate;
  available: boolean;
}) {
  const ready = useGroupReady(),
    [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      adults: "1",
      childAges: "",
      residency: "unsure",
      notes: "",
      consent: false,
      marketing: false,
      waitlist: true,
      website: "",
    }),
    [sending, setSending] = useState(false),
    [error, setError] = useState(""),
    [receipt, setReceipt] = useState<Receipt | null>(null),
    [shareStatus, setShareStatus] = useState("");
  const requestKey = useRef(""),
    accessKey = useRef("");
  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
    requestKey.current = "";
    accessKey.current = "";
  }
  const closed =
      d.status === "cancelled" ||
      d.startDate < todayInTanzania() ||
      d.deadline < todayInTanzania(),
    full = d.capacity !== null && d.occupied >= d.capacity;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || sending) return;
    const ages = form.childAges.trim()
      ? form.childAges.split(",").map((v) => Number(v.trim()))
      : [];
    if (
      ages.some((v) => !Number.isInteger(v) || v < 0 || v > 17) ||
      Number(form.adults) + ages.length > 12
    ) {
      setError(
        "Check the party size and each child’s age. Use commas between ages; one request can include up to twelve travellers.",
      );
      return;
    }
    if (!requestKey.current) requestKey.current = crypto.randomUUID();
    if (!accessKey.current)
      accessKey.current = btoa(
        String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
      )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    setSending(true);
    setError("");
    try {
      const attribution = location.search.slice(1, 501);
      const response = await fetch("/api/groups/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          adults: Number(form.adults),
          childAges: ages,
          departureId: d.id,
          requestKey: requestKey.current,
          accessToken: accessKey.current,
          attribution,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "We could not save your registration.");
      setReceipt(data);
      if (data.token) {
        try {
          sessionStorage.setItem(`boker-group-${data.id}`, data.token);
        } catch {}
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setSending(false);
    }
  }
  async function share() {
    const url = `${location.origin}/groups/${d.id}?utm_source=share&utm_medium=group-calendar&utm_campaign=${d.templateId}`;
    try {
      if (navigator.share)
        await navigator.share({
          title: d.title,
          text: `Join me: ${d.title}, ${formatGroupDate(d.startDate, d.endDate)}.`,
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        setShareStatus("Trip link copied.");
      }
    } catch {
      setShareStatus(`Share this trip: ${location.origin}/groups/${d.id}`);
    }
  }
  const privateLink = receipt?.token
    ? `/groups/my/${receipt.id}#key=${receipt.token}`
    : null;
  return (
    <>
      <section className="group-trip-hero">
        <Image src={t.image} alt={t.imageAlt} fill priority sizes="100vw" />
        <div className="group-hero-shade" />
        <div className="group-width">
          <Link href="/groups" className="group-back">
            ← All group departures
          </Link>
          <p className="group-eyebrow">Boker · Adventures together</p>
          <h1>{d.title}</h1>
          <div className="group-hero-facts">
            <span>
              <CalendarDays size={18} />
              {formatGroupDate(d.startDate, d.endDate)}
            </span>
            <span>
              <MapPin size={18} />
              From {t.town}
            </span>
            <span>
              <Users size={18} />
              {t.days} {t.days === 1 ? "day" : "days"}
              {t.mountainDays ? ` · ${t.mountainDays} on the mountain` : ""}
            </span>
          </div>
          <DepartureBadge departure={d} />
        </div>
      </section>
      <div className="group-width group-detail-layout">
        <main className="group-detail-main">
          <p className="group-intro">{t.summary}</p>
          <div className="group-trip-actions">
            <button onClick={share}>
              <Share2 size={17} />
              Share with friends
            </button>
            <a href={`/api/groups/calendar/${d.id}`}>
              <Download size={17} />
              Add dates to my calendar
            </a>
            {t.packageSlug && (
              <Link href={`/packages/${t.packageSlug}`}>
                View the original package <ArrowRight size={16} />
              </Link>
            )}
          </div>
          <p className="group-small" role="status">
            {shareStatus}
          </p>
          <section className="group-detail-section">
            <p className="group-eyebrow">Your time together</p>
            <h2>
              {d.status === "proposed"
                ? "The proposed programme"
                : "Your departure programme"}
            </h2>
            <p className="group-small">
              The team confirms the exact services and any changes in your
              written offer. Weather, park access and guide decisions can affect
              the daily plan.
            </p>
            <div className="group-programme">
              {t.programme.map((day) => (
                <details key={day.day} open={day.day === 1}>
                  <summary>
                    <span>{String(day.day).padStart(2, "0")}</span>
                    <strong>{day.title}</strong>
                  </summary>
                  <p>{day.description}</p>
                </details>
              ))}
            </div>
          </section>
          <section className="group-detail-section group-practical">
            <div>
              <h2>Meeting the group</h2>
              <p>
                <MapPin size={18} />
                {t.meeting}
              </p>
            </div>
            <div>
              <h2>Pace and preparation</h2>
              <p>
                <Mountain size={18} />
                {t.level}
              </p>
              {t.minimumAge > 0 && (
                <p>
                  Minimum age for this departure: {t.minimumAge}. Under-18s must
                  travel with a responsible adult.
                </p>
              )}
              <ul>
                {t.preparation.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </section>
          <section className="group-detail-section group-inclusions">
            <div>
              <h2>Programme services</h2>
              <ul>
                {t.includes.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2>Budget for separately</h2>
              <ul>
                {t.excludes.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>
          </section>
          <section className="group-detail-section">
            <h2>Before you book</h2>
            <p>{d.note}</p>
            <p>{d.priceNote}</p>
            <p>
              Registration records your interest or request. It does not reserve
              a paid place. The team prepares your party’s offer; an offered
              place is held for up to 48 hours. Accept it and complete the
              agreed booking steps within that hold. Booking confirmation
              follows the team’s checks.
            </p>
            <p>
              If the group does not form, the team will discuss a different
              date, a revised group price or a private trip before you commit.
            </p>
            <p>
              Pay only through verified Boker invoice instructions. Cancellation
              and any refund depend on the terms in your accepted offer.
            </p>
          </section>
          <p className="group-small">
            Programme reference:{" "}
            {t.source.startsWith("http") ? (
              <a href={t.source} target="_blank" rel="noopener noreferrer">
                Tanzania National Parks guide
              </a>
            ) : (
              t.source
            )}
            .{" "}
            <a href={t.imageCredit} target="_blank" rel="noopener noreferrer">
              Regional photograph credit
            </a>
            .
          </p>
        </main>
        <aside className="group-enrol-card" id="join-departure">
          <DepartureBadge departure={d} />
          <h2>
            {d.status === "proposed"
              ? "Plan to come along"
              : full
                ? "Join the waitlist"
                : "Come along with us"}
          </h2>
          <strong className="group-enrol-price">
            {groupMoney(d.adultPriceMinor, d.currency)}
          </strong>
          {d.adultPriceMinor !== null && (
            <p className="group-small">
              Adult base price. Resident eligibility, child rates, rooms and
              extras are confirmed in your party’s offer.
            </p>
          )}
          <p>
            {d.status === "proposed"
              ? "Register early interest in this date. We’ll review the group and confirm the arrangements before making an offer."
              : full
                ? "We’re currently at the seat limit. Join the waitlist and the team will review places as they become available."
                : `${d.capacity === null ? "" : Math.max(0, d.capacity - d.occupied) + " places currently available. "}Request the places you need; the team will confirm your party’s offer.`}
          </p>
          <p className="group-small">
            Target group: at least {d.minimumGroup} travellers. Registration
            deadline: {formatGroupDate(d.deadline)}.
          </p>
          {receipt ? (
            <div className="group-receipt" role="status">
              <Check size={28} />
              <h3>{registrationLabels[receipt.status]}</h3>
              <p>
                Keep your reference: <strong>{receipt.id}</strong>
              </p>
              <p>
                {receipt.status === "waitlisted"
                  ? "The team will review your party when places become available."
                  : "The team can now review your party and this departure."}{" "}
                A booking is confirmed only after an offer is accepted and the
                agreed booking steps are checked.
              </p>
              {privateLink ? (
                <>
                  <Link className="group-primary" href={privateLink}>
                    Open my private trip page <ArrowRight size={17} />
                  </Link>
                  <p className="group-small">
                    Save this private link. It lets you review an offer, track
                    your request or ask to cancel. Keep it to yourself.
                  </p>
                </>
              ) : (
                <p>
                  We already saved this request. Use the private link from your
                  first submission or contact the team with your reference.
                </p>
              )}
              <a href="mailto:support@pindestinations.com">Contact Boker</a>
            </div>
          ) : closed ? (
            <div className="group-notice">
              <p>
                This departure is{" "}
                {d.status === "cancelled"
                  ? "cancelled"
                  : "closed for registration"}
                .
              </p>
              <Link href="/groups">Find another date</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <fieldset disabled={!ready || sending || !available}>
                <legend className="sr-only">
                  Group departure registration
                </legend>
                <label>
                  Your full name
                  <input
                    required
                    autoComplete="name"
                    minLength={2}
                    maxLength={150}
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </label>
                <label>
                  Email address
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </label>
                <label>
                  Phone or WhatsApp <span>optional</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    maxLength={60}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </label>
                <div className="group-form-row">
                  <label>
                    Adults (18+)
                    <input
                      type="number"
                      required
                      min={1}
                      max={12}
                      value={form.adults}
                      onChange={(e) => update("adults", e.target.value)}
                    />
                  </label>
                  <label>
                    Children’s ages
                    <input
                      placeholder="e.g. 8, 12"
                      maxLength={50}
                      value={form.childAges}
                      onChange={(e) => update("childAges", e.target.value)}
                    />
                  </label>
                </div>
                <label>
                  Permit category
                  <select
                    aria-label="Permit category"
                    value={form.residency}
                    onChange={(e) => update("residency", e.target.value)}
                  >
                    <option value="unsure">Not sure / mixed party</option>
                    <option value="tz-resident">Tanzania resident</option>
                    <option value="eac-resident">East African resident</option>
                    <option value="non-resident">
                      International non-resident
                    </option>
                  </select>
                </label>
                <label>
                  Anything the team should know?
                  <textarea
                    rows={3}
                    maxLength={2000}
                    placeholder="Rooms, dietary or access needs, climbing experience…"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </label>
                <label className="group-honeypot" aria-hidden="true">
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                  />
                </label>
                <label className="group-check">
                  <input
                    type="checkbox"
                    checked={form.waitlist}
                    onChange={(e) => update("waitlist", e.target.checked)}
                  />
                  If my party cannot fit, add us to the waitlist.
                </label>
                <label className="group-check">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                  />
                  <span>
                    I agree to contact about this trip and have read the{" "}
                    <Link href="/privacy">privacy policy</Link> and{" "}
                    <Link href="/terms">booking terms</Link>. Registration is a
                    request, not a confirmed booking.
                  </span>
                </label>
                <label className="group-check">
                  <input
                    type="checkbox"
                    checked={form.marketing}
                    onChange={(e) => update("marketing", e.target.checked)}
                  />
                  Send me occasional Boker group trip updates. Optional.
                </label>
                <button className="group-primary" type="submit">
                  {sending
                    ? "Saving your request…"
                    : d.status === "proposed"
                      ? "Register my interest"
                      : full
                        ? "Join the waitlist"
                        : "Request our places"}
                  <ArrowRight size={17} />
                </button>
              </fieldset>
              {error && (
                <p className="group-error" role="alert">
                  {error}
                </p>
              )}
              {!available && (
                <p role="status">
                  Registration is temporarily unavailable. Contact the team to
                  plan this trip.
                </p>
              )}
            </form>
          )}
        </aside>
      </div>
    </>
  );
}
