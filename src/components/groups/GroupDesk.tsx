"use client";
import { useEffect, useState } from "react";
import {
  RefreshCw,
  Download,
  Plus,
  LockKeyhole,
  CalendarDays,
  Users,
  Copy,
} from "lucide-react";
import Link from "next/link";
import type { Departure, GroupTemplate, Registration } from "@/lib/groupTypes";
import { formatGroupDate, groupMoney } from "@/lib/groupPolicy";
import { registrationLabels, useGroupReady } from "./GroupCommon";
type DeskData = {
  departures: Departure[];
  registrations: Registration[];
  templates: GroupTemplate[];
};
type Editor = {
  id: string;
  version: number;
  templateId: string;
  title: string;
  startDate: string;
  deadline: string;
  status: string;
  capacity: string;
  minimumGroup: string;
  currency: string;
  adultPrice: string;
  priceNote: string;
  note: string;
  arrangementsConfirmed: boolean;
};
const blank: Editor = {
  id: "",
  version: 0,
  templateId: "marangu-hike",
  title: "",
  startDate: "",
  deadline: "",
  status: "proposed",
  capacity: "",
  minimumGroup: "6",
  currency: "TZS",
  adultPrice: "",
  priceNote:
    "The group quote confirms exact services, fees, resident eligibility, room or equipment supplements and cancellation terms.",
  note: "",
  arrangementsConfirmed: false,
};
export function GroupDesk() {
  const ready = useGroupReady(),
    [data, setData] = useState<DeskData | null>(null),
    [signedIn, setSignedIn] = useState(false),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState<"departures" | "registrations">("departures"),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [editor, setEditor] = useState<Editor | null>(null),
    [selected, setSelected] = useState<Registration | null>(null),
    [offer, setOffer] = useState({
      total: "",
      currency: "TZS",
      terms: "",
      paymentReference: "",
      paymentVerified: false,
    }),
    [privateLink, setPrivateLink] = useState(""),
    [notice, setNotice] = useState("");
  async function load() {
    const response = await fetch("/api/groups/team", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) setSignedIn(false);
      throw new Error(result.error || "The desk could not load.");
    }
    setData(result);
    setSignedIn(true);
  }
  useEffect(() => {
    let active = true;
    fetch("/api/groups/session", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (result.signedIn && active) {
          setSignedIn(true);
          await load();
        }
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function post(path: string, payload: unknown) {
    const response = await fetch(`/api/groups/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "The change could not be saved.");
    return result;
  }
  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("login", { password });
      setPassword("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    setBusy(true);
    setError("");
    try {
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function edit(d: Departure) {
    setEditor({
      id: d.id,
      version: d.version,
      templateId: d.templateId,
      title: d.title,
      startDate: d.startDate,
      deadline: d.deadline,
      status: d.status,
      capacity: d.capacity === null ? "" : String(d.capacity),
      minimumGroup: String(d.minimumGroup),
      currency: d.currency,
      adultPrice:
        d.adultPriceMinor === null
          ? ""
          : String(d.adultPriceMinor / (d.currency === "USD" ? 100 : 1)),
      priceNote: d.priceNote,
      note: d.note,
      arrangementsConfirmed: false,
    });
    setError("");
    setNotice("");
  }
  async function saveDeparture(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("team/departure", editor);
      setEditor(null);
      await load();
      setNotice(
        "Departure saved. Open its public page to review the calendar and selling copy.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function selectRegistration(r: Registration) {
    setSelected(r);
    setPrivateLink("");
    setOffer({
      currency: r.offerCurrency,
      total:
        r.offerTotalMinor === null
          ? ""
          : String(r.offerTotalMinor / (r.offerCurrency === "USD" ? 100 : 1)),
      terms: r.offerTerms,
      paymentReference: r.paymentReference,
      paymentVerified: false,
    });
    setError("");
  }
  async function registrationAction(action: string) {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const result = await post(`team/registration/${selected.id}`, {
        action,
        ...offer,
      });
      setSelected(result.registration);
      await load();
      setNotice(
        "Registration updated. Follow up with the contact so they can review their private trip page. This action does not send email.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function replacementLink() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const result = await post(`team/link/${selected.id}`, {});
      setPrivateLink(
        `${location.origin}/groups/my/${selected.id}#key=${result.token}`,
      );
      setNotice(
        "A replacement private link is ready. The previous private link no longer works. Send it only to this registration’s contact.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function copyPrivate() {
    try {
      await navigator.clipboard.writeText(privateLink);
      setNotice("Private link copied. Send it only to the registered contact.");
    } catch {
      setNotice("Copy the replacement link from the field below.");
    }
  }
  async function logout() {
    try {
      await post("logout", {});
      setData(null);
      setSignedIn(false);
      setSelected(null);
      setEditor(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    }
  }
  if (!signedIn)
    return (
      <div className="group-width group-desk-login">
        <LockKeyhole size={32} />
        <p className="group-eyebrow">Boker departure desk</p>
        <h1>Manage the calendar. Bring the group together.</h1>
        <p>
          Private team access for departures, registration requests and booking
          follow-up.
        </p>
        <form onSubmit={login}>
          <fieldset disabled={!ready || busy}>
            <label>
              Team access code
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                maxLength={200}
              />
            </label>
            <button className="group-primary">
              {busy ? "Signing in…" : "Open departure desk"}
            </button>
          </fieldset>
        </form>
        {error && (
          <p className="group-error" role="alert">
            {error}
          </p>
        )}
        <Link href="/groups">Explore the public calendar</Link>
      </div>
    );
  const current = data?.departures || [],
    registrations = data?.registrations || [],
    offered = registrations.filter(
      (r) => r.status === "offered" || r.status === "accepted",
    ),
    pending = registrations.filter((r) =>
      [
        "interest",
        "requested",
        "waitlisted",
        "cancellation-requested",
      ].includes(r.status),
    ),
    confirmed = registrations.filter((r) => r.status === "confirmed");
  const templateMap = new Map((data?.templates || []).map((t) => [t.id, t]));
  const departureRows = current.filter(
    (d) =>
      (status === "all" || d.status === status) &&
      `${d.title} ${d.startDate} ${d.id}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const registrationRows = registrations.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      `${r.id} ${r.departureId} ${r.contact.name} ${r.contact.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="group-width group-desk">
      <div className="group-desk-title">
        <div>
          <p className="group-eyebrow">Boker departure desk</p>
          <h1>The next adventure starts here.</h1>
        </div>
        <div className="group-trip-actions">
          <button disabled={busy} onClick={refresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <a href="/api/groups/export" download>
            <Download size={16} />
            Export requests
          </a>
          <button onClick={logout}>Sign out</button>
        </div>
      </div>
      <div className="group-desk-stats">
        <article>
          <CalendarDays />
          <strong>
            {
              current.filter((d) => ["open", "guaranteed"].includes(d.status))
                .length
            }
          </strong>
          <span>open departures</span>
        </article>
        <article>
          <Users />
          <strong>{pending.length}</strong>
          <span>requests to review</span>
        </article>
        <article>
          <strong>{offered.reduce((sum, r) => sum + r.seats, 0)}</strong>
          <span>places held in offers</span>
        </article>
        <article>
          <strong>{confirmed.reduce((sum, r) => sum + r.seats, 0)}</strong>
          <span>confirmed travellers</span>
        </article>
      </div>
      <p className="group-small">
        Booking value confirmed:{" "}
        {groupMoney(
          confirmed
            .filter((r) => r.offerCurrency === "TZS")
            .reduce((sum, r) => sum + (r.offerTotalMinor || 0), 0),
          "TZS",
        )}{" "}
        ·{" "}
        {groupMoney(
          confirmed
            .filter((r) => r.offerCurrency === "USD")
            .reduce((sum, r) => sum + (r.offerTotalMinor || 0), 0),
          "USD",
        )}
        . This is accepted offer value, not a cash ledger.
      </p>
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
      <div className="group-view-bar">
        <div className="group-view-tabs">
          <button
            aria-pressed={tab === "departures"}
            onClick={() => {
              setTab("departures");
              setStatus("all");
              setSearch("");
            }}
          >
            Departures
          </button>
          <button
            aria-pressed={tab === "registrations"}
            onClick={() => {
              setTab("registrations");
              setStatus("all");
              setSearch("");
            }}
          >
            Registrations
          </button>
        </div>
        <button
          className="group-primary"
          onClick={() => setEditor({ ...blank })}
        >
          <Plus size={17} />
          Add a departure
        </button>
      </div>
      <div className="group-filter-bar">
        <label>
          Find a trip or request
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Date, name, email or reference"
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            {(tab === "departures"
              ? ["proposed", "open", "guaranteed", "draft", "cancelled"]
              : Object.keys(registrationLabels)
            ).map((value) => (
              <option key={value} value={value}>
                {tab === "registrations"
                  ? registrationLabels[value as Registration["status"]]
                  : value}
              </option>
            ))}
          </select>
        </label>
      </div>
      {tab === "departures" ? (
        <div className="group-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Departure</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Demand / places</th>
                <th>Adult price</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {departureRows.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.title}</strong>
                    <small>{templateMap.get(d.templateId)?.town}</small>
                  </td>
                  <td>{formatGroupDate(d.startDate, d.endDate)}</td>
                  <td>{d.status}</td>
                  <td>
                    {d.interested} interested travellers
                    <small>
                      {d.occupied} held or confirmed /{" "}
                      {d.capacity ?? "limit not set"}
                    </small>
                  </td>
                  <td>{groupMoney(d.adultPriceMinor, d.currency)}</td>
                  <td>
                    <button className="group-text-link" onClick={() => edit(d)}>
                      Edit departure
                    </button>
                    {d.status !== "draft" && (
                      <Link
                        className="group-text-link"
                        href={`/groups/${d.id}`}
                      >
                        Public page
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!departureRows.length && <p>No matching departures.</p>}
        </div>
      ) : (
        <div className="group-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Registration</th>
                <th>Trip</th>
                <th>Party</th>
                <th>Status</th>
                <th>Follow up</th>
              </tr>
            </thead>
            <tbody>
              {registrationRows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.contact.name}</strong>
                    <small>
                      {r.id} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString("en-GB")}
                    </small>
                  </td>
                  <td>
                    {current.find((d) => d.id === r.departureId)?.title ||
                      r.departureId}
                    <small>{r.departureId}</small>
                  </td>
                  <td>
                    {r.seats} travellers<small>{r.contact.residency}</small>
                  </td>
                  <td>{registrationLabels[r.status]}</td>
                  <td>
                    <button
                      className="group-text-link"
                      onClick={() => selectRegistration(r)}
                    >
                      Review request
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!registrationRows.length && (
            <p>No registration requests match this view.</p>
          )}
          <p className="group-small">
            The desk and export show the latest 5,000 registration records.
            Departures retain their aggregate demand and seat counts.
          </p>
        </div>
      )}
      {editor && (
        <section
          className="group-white-panel group-desk-editor"
          aria-label="Departure editor"
        >
          <div className="group-desk-title">
            <h2>{editor.id ? "Edit departure" : "Prepare a new departure"}</h2>
            <button className="group-secondary" onClick={() => setEditor(null)}>
              Close editor
            </button>
          </div>
          <form onSubmit={saveDeparture}>
            <fieldset disabled={busy}>
              <div className="group-admin-grid">
                <label>
                  Prepared programme
                  <select
                    aria-label="Prepared programme"
                    value={editor.templateId}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        templateId: event.target.value,
                        title: templateMap.get(event.target.value)?.name || "",
                      })
                    }
                  >
                    {data?.templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.days} total days)
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Public trip title
                  <input
                    required
                    maxLength={150}
                    value={editor.title}
                    onChange={(event) =>
                      setEditor({ ...editor, title: event.target.value })
                    }
                  />
                </label>
                <label>
                  Start / arrival date
                  <input
                    required
                    type="date"
                    value={editor.startDate}
                    onChange={(event) =>
                      setEditor({ ...editor, startDate: event.target.value })
                    }
                  />
                </label>
                <label>
                  Registration deadline
                  <input
                    required
                    type="date"
                    value={editor.deadline}
                    onChange={(event) =>
                      setEditor({ ...editor, deadline: event.target.value })
                    }
                  />
                </label>
                <label>
                  Publishing status
                  <select
                    aria-label="Publishing status"
                    value={editor.status}
                    onChange={(event) =>
                      setEditor({ ...editor, status: event.target.value })
                    }
                  >
                    <option value="draft">Draft, team only</option>
                    <option value="proposed">Proposed, collect interest</option>
                    <option value="open">Open, taking place requests</option>
                    <option value="guaranteed">
                      Departure confirmed by Boker
                    </option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <label>
                  Seat limit
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editor.capacity}
                    onChange={(event) =>
                      setEditor({ ...editor, capacity: event.target.value })
                    }
                  />
                </label>
                <label>
                  Minimum group target
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={editor.minimumGroup}
                    onChange={(event) =>
                      setEditor({ ...editor, minimumGroup: event.target.value })
                    }
                  />
                </label>
                <label>
                  Quote currency
                  <select
                    aria-label="Quote currency"
                    value={editor.currency}
                    onChange={(event) =>
                      setEditor({ ...editor, currency: event.target.value })
                    }
                  >
                    <option>TZS</option>
                    <option>USD</option>
                  </select>
                </label>
                <label>
                  Approved adult price
                  <input
                    type="number"
                    min={1}
                    step={editor.currency === "USD" ? "0.01" : "1"}
                    value={editor.adultPrice}
                    onChange={(event) =>
                      setEditor({ ...editor, adultPrice: event.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Price basis, inclusions and supplements
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  value={editor.priceNote}
                  onChange={(event) =>
                    setEditor({ ...editor, priceNote: event.target.value })
                  }
                />
              </label>
              <label>
                Departure notes
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={editor.note}
                  onChange={(event) =>
                    setEditor({ ...editor, note: event.target.value })
                  }
                />
              </label>
              {["open", "guaranteed"].includes(editor.status) && (
                <label className="group-check">
                  <input
                    required
                    type="checkbox"
                    checked={editor.arrangementsConfirmed}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        arrangementsConfirmed: event.target.checked,
                      })
                    }
                  />
                  I have checked suppliers, guide arrangements, permits,
                  services, eligibility, the selling price and booking terms for
                  this departure.
                </label>
              )}
              <p className="group-small">
                Private brochure prices are not group prices. Confirm a separate
                selling rate. Changes are audited. Cancelled departures need
                direct follow-up with affected travellers.
              </p>
              <button className="group-primary" type="submit">
                {busy ? "Saving departure…" : "Save departure"}
              </button>
            </fieldset>
          </form>
        </section>
      )}
      {selected && (
        <section
          className="group-white-panel group-desk-editor"
          aria-label="Registration review"
        >
          <div className="group-desk-title">
            <h2>
              {selected.contact.name} · {selected.id}
            </h2>
            <button
              className="group-secondary"
              onClick={() => setSelected(null)}
            >
              Close request
            </button>
          </div>
          <p>
            {registrationLabels[selected.status]} · {selected.seats} travellers
            ({selected.contact.adults} adults; child ages:{" "}
            {selected.contact.childAges.join(", ") || "none"})
          </p>
          <p>
            Permit category: {selected.contact.residency}. Optional marketing:{" "}
            {selected.contact.marketing ? "opted in" : "not opted in"}.
          </p>
          <p>
            <a href={`mailto:${selected.contact.email}`}>
              {selected.contact.email}
            </a>{" "}
            ·{" "}
            {selected.contact.phone && (
              <a href={`tel:${selected.contact.phone}`}>
                {selected.contact.phone}
              </a>
            )}
          </p>
          <p className="group-offer-terms">
            {selected.contact.notes || "No additional notes."}
          </p>
          {selected.holdUntil && (
            <p>
              Offer hold:{" "}
              {new Date(selected.holdUntil).toLocaleString("en-GB", {
                timeZone: "Africa/Dar_es_Salaam",
              })}
              , Tanzania time.
            </p>
          )}
          <fieldset disabled={busy}>
            <div className="group-admin-grid">
              <label>
                Party’s total offer
                <input
                  type="number"
                  min={1}
                  step={offer.currency === "USD" ? "0.01" : "1"}
                  value={offer.total}
                  onChange={(event) =>
                    setOffer({ ...offer, total: event.target.value })
                  }
                />
              </label>
              <label>
                Offer currency
                <select
                  aria-label="Offer currency"
                  value={offer.currency}
                  onChange={(event) =>
                    setOffer({ ...offer, currency: event.target.value })
                  }
                >
                  <option>TZS</option>
                  <option>USD</option>
                </select>
              </label>
            </div>
            <label>
              Exact offer and booking terms
              <textarea
                rows={6}
                minLength={30}
                maxLength={4000}
                value={offer.terms}
                placeholder="List services, resident/child treatment, rooms, total party price, verified invoice/payment instructions, deadline and cancellation terms."
                onChange={(event) =>
                  setOffer({ ...offer, terms: event.target.value })
                }
              />
            </label>
            <div className="group-trip-actions">
              <button
                className="group-primary"
                disabled={[
                  "confirmed",
                  "cancelled",
                  "cancellation-requested",
                ].includes(selected.status)}
                onClick={() => void registrationAction("offer")}
              >
                Offer places for 48 hours
              </button>
              <button
                className="group-secondary"
                disabled={["confirmed", "cancellation-requested"].includes(
                  selected.status,
                )}
                onClick={() => void registrationAction("waitlist")}
              >
                Move to waitlist
              </button>
            </div>
            <label>
              Verified payment / booking authorisation reference
              <input
                maxLength={150}
                value={offer.paymentReference}
                onChange={(event) =>
                  setOffer({ ...offer, paymentReference: event.target.value })
                }
              />
            </label>
            <label className="group-check">
              <input
                type="checkbox"
                checked={offer.paymentVerified}
                onChange={(event) =>
                  setOffer({ ...offer, paymentVerified: event.target.checked })
                }
              />
              I have verified payment or the agreed booking authorisation.
            </label>
            <button
              className="group-primary"
              disabled={selected.status !== "accepted"}
              onClick={() => void registrationAction("confirm")}
            >
              Confirm accepted booking
            </button>
            <div className="group-trip-actions">
              <button
                className="group-secondary"
                disabled={
                  selected.status === "cancelled" ||
                  selected.status === "cancellation-requested"
                }
                onClick={() => void registrationAction("cancel")}
              >
                Record cancellation request
              </button>
              <button
                className="group-secondary"
                disabled={selected.status !== "cancellation-requested"}
                onClick={() => void registrationAction("close-cancellation")}
              >
                Resolve cancellation and release seats
              </button>
            </div>
          </fieldset>
          <p className="group-small">
            Offer acceptance happens on the traveller’s private page. Only
            confirm after checking the agreed booking steps. Payment
            verification here is a team record; it does not post to the finance
            ledger or process a refund.
          </p>
          <button
            className="group-secondary"
            disabled={busy}
            onClick={() => void replacementLink()}
          >
            Create replacement private link
          </button>
          <p className="group-small">
            Use this only when the contact has lost their link or needs a new
            one. It revokes the old link.
          </p>
          {privateLink && (
            <label>
              Replacement link
              <input readOnly value={privateLink} />
              <button className="group-text-link" onClick={copyPrivate}>
                <Copy size={16} />
                Copy private link
              </button>
            </label>
          )}
        </section>
      )}
    </div>
  );
}
