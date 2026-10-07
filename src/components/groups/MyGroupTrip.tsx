"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  CalendarDays,
  Download,
  ShieldCheck,
} from "lucide-react";
import type { Departure, GroupTemplate, Registration } from "@/lib/groupTypes";
import { formatGroupDate, groupMoney } from "@/lib/groupPolicy";
import { registrationLabels, useGroupReady } from "./GroupCommon";
type Data = {
  registration: Registration;
  departures: Departure[];
  templates: GroupTemplate[];
};
export function MyGroupTrip({ id }: { id: string }) {
  const ready = useGroupReady(),
    [key, setKey] = useState(""),
    [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [accepted, setAccepted] = useState(false),
    [cancelRequested, setCancelRequested] = useState(false),
    [notice, setNotice] = useState(""),
    [checked, setChecked] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    let secret = new URLSearchParams(location.hash.slice(1)).get("key") || "";
    try {
      secret = secret || sessionStorage.getItem(`boker-group-${id}`) || "";
      if (secret) sessionStorage.setItem(`boker-group-${id}`, secret);
    } catch {}
    queueMicrotask(() => setKey(secret));
    if (!secret) {
      queueMicrotask(() =>
        setError(
          "Open the private link supplied with your registration. If you have lost it, contact Boker with your reference.",
        ),
      );
      return;
    }
    fetch(`/api/groups/registration/${id}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error || "We could not load your registration.",
          );
        if (active) setData(result);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      });
    return () => {
      active = false;
    };
  }, [id]);
  async function action(name: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/groups/registration/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ action: name, acceptTerms: accepted }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Please try again.");
      setData((previous) =>
        previous ? { ...previous, registration: result.registration } : null,
      );
      setCancelRequested(false);
      setNotice(
        name === "unsubscribe"
          ? "Optional trip updates are switched off."
          : name === "accept"
            ? "Your offer acceptance is saved. Follow the verified booking instructions before your hold expires."
            : "Your cancellation request is saved. The team will review any confirmed booking and its cancellation terms.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${location.origin}/groups/my/${id}#key=${key}`,
      );
      setNotice("Private link copied. Keep it to yourself.");
    } catch {
      setNotice(
        "Save this page’s full address, including the part after #. Keep it private.",
      );
    }
  }
  if (!data)
    return (
      <div className="group-width group-private-page">
        <p className="group-eyebrow">Your private trip page</p>
        <h1>Keep track of your group adventure.</h1>
        {error ? (
          <p className="group-error" role="alert">
            {error}
          </p>
        ) : (
          <p role="status">Loading your registration…</p>
        )}
        <p>
          Reference: <strong>{id}</strong>
        </p>
        <a
          href={`mailto:support@pindestinations.com?subject=${encodeURIComponent("Group trip " + id)}`}
        >
          Contact Boker
        </a>
      </div>
    );
  const r = data.registration,
    d = data.departures.find((item) => item.id === r.departureId),
    t = data.templates.find((item) => item.id === d?.templateId),
    expiry = r.holdUntil
      ? new Intl.DateTimeFormat("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Africa/Dar_es_Salaam",
        }).format(new Date(r.holdUntil))
      : "";
  const stages = ["Request", "Offer", "Accepted", "Confirmed"],
    stage = ["confirmed", "cancellation-requested"].includes(r.status)
      ? 3
      : r.status === "accepted"
        ? 2
        : r.status === "offered"
          ? 1
          : 0;
  const checklist = [
    "Review the team’s programme and meeting arrangements",
    "Confirm transport and arrival before the briefing",
    "Arrange suitable equipment and activity cover",
    "Share dietary, room or access requirements with the team",
  ];
  return (
    <div className="group-width group-private-page">
      <p className="group-eyebrow">
        <ShieldCheck size={16} />
        Your private trip page
      </p>
      <h1>{d?.title || "Your group trip"}</h1>
      <p className="group-intro">
        Reference {r.id} · {registrationLabels[r.status]}
      </p>
      {d && (
        <p className="group-icon-line">
          <CalendarDays size={18} />
          {formatGroupDate(d.startDate, d.endDate)} · From {t?.town}
        </p>
      )}
      <div className="group-progress" aria-label="Booking progress">
        {stages.map((label, index) => (
          <div className={index <= stage ? "complete" : ""} key={label}>
            <span>
              {index < stage ? <CheckCircle2 size={20} /> : index + 1}
            </span>
            <strong>{label}</strong>
          </div>
        ))}
      </div>
      {d?.status === "cancelled" && (
        <p className="group-error" role="alert">
          This departure has been cancelled. Contact the team about your booking
          and any payment; your accepted terms apply.
        </p>
      )}
      {error && (
        <p className="group-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="group-notice" role="status">
          {notice}
        </p>
      )}
      <div className="group-private-columns">
        <section className="group-white-panel">
          <h2>
            {r.status === "confirmed"
              ? "Your booking is confirmed"
              : r.status === "offered"
                ? "Your party’s offer"
                : r.status === "accepted"
                  ? "Complete your booking steps"
                  : "Your registration"}
          </h2>
          <p>
            {r.contact.name} · {r.contact.adults}{" "}
            {r.contact.adults === 1 ? "adult" : "adults"}
            {r.contact.childAges.length
              ? ` and ${r.contact.childAges.length} children`
              : ""}
          </p>
          <p>
            Contact: {r.contact.email}
            {r.contact.phone ? ` · ${r.contact.phone}` : ""}
          </p>
          {r.offerTotalMinor !== null ? (
            <>
              <p className="group-offer-total">
                {groupMoney(r.offerTotalMinor, r.offerCurrency)}{" "}
                <small>total for your party</small>
              </p>
              <h3>Written offer and booking terms</h3>
              <p className="group-offer-terms">{r.offerTerms}</p>
              {expiry && ["offered", "accepted"].includes(r.status) && (
                <p className="group-notice">
                  Your offered places are held until {expiry}, Tanzania time.
                  Complete the agreed steps before this time. Expired holds
                  return to the waitlist for a fresh offer.
                </p>
              )}
            </>
          ) : (
            <p>
              {r.status === "waitlisted"
                ? "You are on the waitlist. The team reviews parties as suitable places become available."
                : "Your request is saved. The team will review the group, your party and the arrangements before preparing a written offer."}{" "}
              Your places are not yet confirmed.
            </p>
          )}
          {r.status === "offered" && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void action("accept");
              }}
            >
              <fieldset disabled={!ready || busy}>
                <label className="group-check">
                  <input
                    type="checkbox"
                    required
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                  />
                  I have read and accept this party’s price, services, payment
                  deadline and cancellation terms.
                </label>
                <button className="group-primary" type="submit">
                  {busy ? "Saving acceptance…" : "Accept our offer"}
                </button>
              </fieldset>
            </form>
          )}
          {r.status === "accepted" && (
            <p>
              Offer acceptance is saved. Pay only through the verified
              instructions in your offer. The team confirms your booking after
              checking the agreed payment or booking authorisation.
            </p>
          )}
          {r.status === "confirmed" && (
            <p className="group-notice">
              Keep this page and your reference. The team will confirm your
              final meeting details and pre-departure arrangements.
            </p>
          )}
          {r.status === "cancellation-requested" && (
            <p>
              Cancellation is being reviewed. Your place remains recorded until
              the team resolves the booking and any payment according to your
              terms.
            </p>
          )}
          {r.status === "cancelled" && (
            <p>
              This registration is cancelled.{" "}
              <Link href="/groups">Find another departure</Link>.
            </p>
          )}
          <div className="group-trip-actions">
            <button onClick={copy}>
              <Copy size={16} />
              Copy my private link
            </button>
            {d && (
              <a href={`/api/groups/calendar/${d.id}`}>
                <Download size={16} />
                Add trip dates
              </a>
            )}
            <a
              href={`mailto:support@pindestinations.com?subject=${encodeURIComponent("Group trip " + id)}`}
            >
              Contact the team
            </a>
          </div>
        </section>
        <section className="group-white-panel">
          <h2>My preparation list</h2>
          <p>
            This list is for you. The team confirms the final requirements for
            your trip.
          </p>
          {checklist.map((item) => (
            <label className="group-check" key={item}>
              <input
                type="checkbox"
                checked={checked.includes(item)}
                onChange={(event) =>
                  setChecked(
                    event.target.checked
                      ? [...checked, item]
                      : checked.filter((v) => v !== item),
                  )
                }
              />
              {item}
            </label>
          ))}
          {t && (
            <Link className="group-text-link" href={`/groups/${r.departureId}`}>
              Review the full programme
            </Link>
          )}
          <h3>Manage this request</h3>
          {!["cancelled", "cancellation-requested"].includes(r.status) &&
            (!cancelRequested ? (
              <button
                className="group-secondary"
                onClick={() => setCancelRequested(true)}
              >
                Ask to cancel
              </button>
            ) : (
              <div className="group-notice">
                <p>
                  Unconfirmed requests can be cancelled now. Confirmed bookings
                  go to the team for review; cancellation and refunds depend on
                  your terms.
                </p>
                <button
                  className="group-secondary"
                  disabled={busy}
                  onClick={() => void action("cancel")}
                >
                  Submit cancellation request
                </button>
                <button
                  className="group-text-link"
                  onClick={() => setCancelRequested(false)}
                >
                  Keep my request
                </button>
              </div>
            ))}
          {r.contact.marketing && (
            <button
              className="group-text-link"
              disabled={busy}
              onClick={() => void action("unsubscribe")}
            >
              Stop optional trip updates
            </button>
          )}
          <p className="group-small">
            This private link gives access to your registration. Do not share it
            on social media. Share the public departure page with friends
            instead.
          </p>
        </section>
      </div>
    </div>
  );
}
