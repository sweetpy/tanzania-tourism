"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, Compass, Moon, Printer, RefreshCw, ShieldCheck, TentTree } from "lucide-react";
import type { BokerCircuit, BokerConfig, BokerEnquiryReceipt, BokerOption, BokerPreview, BokerTripRequest } from "@/lib/bokerTypes";
import { PackageRecommendations } from "./PackageRecommendations";
import "./boker.css";

const landscape = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Serengeti-Landscape-2012.JPG/1280px-Serengeti-Landscape-2012.JPG";
const displayDate = (value: string) => new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const displayMoney = (option: BokerOption) => new Intl.NumberFormat("en-US", { style: "currency", currency: option.pricing.currency || "USD", maximumFractionDigits: option.pricing.currency === "TZS" ? 0 : 2 }).format((option.pricing.totalMinor || 0) / (option.pricing.currency === "TZS" ? 1 : 100));
async function api<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/boker/${path}`, { method: body === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json" }, signal: signal || AbortSignal.timeout(30_000), ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof result?.error === "string" ? result.error : "We couldn't complete that request. Please try again.");
  if (!result) throw new Error("The planning service returned an empty response. Please try again.");
  return result as T;
}

export default function BokerPlanner({ initialParkId = "", initialArrivalDate, minArrivalDate, maxArrivalDate }: {
  initialParkId?: string;
  initialArrivalDate: string;
  minArrivalDate: string;
  maxArrivalDate: string;
}) {
  const [config, setConfig] = useState<BokerConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [reload, setReload] = useState(0);
  const [circuit, setCircuit] = useState<BokerCircuit>("northern");
  const [request, setRequest] = useState<BokerTripRequest>({ arrivalDate: initialArrivalDate, days: 7, adults: 2, childAges: [], travellerFeeCategory: "non-east-african", destinationIds: [], budgetTier: "midrange", budgetGrade: "classic" });
  const [children, setChildren] = useState("");
  const [preview, setPreview] = useState<BokerPreview | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "" });
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<BokerEnquiryReceipt | null>(null);
  const [submitError, setSubmitError] = useState("");
  const requestId = useRef("");
  const previewAbort = useRef<AbortController | null>(null);
  const previewVersion = useRef(0);
  const enquiryBusy = useRef(false);
  const resultsRef = useRef<HTMLElement>(null);
  const circuitRef = useRef(circuit);
  const requestedPark = useRef(initialParkId);
  const selected = preview?.options.find(option => option.id === selectedId) || preview?.options[0];
  const hasEstimate = selected?.pricing.status === "estimate"
    && (selected.pricing.currency === "USD" || selected.pricing.currency === "TZS")
    && typeof selected.pricing.totalMinor === "number"
    && Number.isFinite(selected.pricing.totalMinor) && selected.pricing.totalMinor > 0;

  useEffect(() => {
    const abort = new AbortController();
    api<BokerConfig>(`config?date=${encodeURIComponent(request.arrivalDate)}`, undefined, AbortSignal.any([abort.signal, AbortSignal.timeout(30_000)])).then(value => {
      if (abort.signal.aborted) return;
      setConfig(value);
      const requested = value.destinations.find(d => d.parkId === requestedPark.current);
      if (requested) { circuitRef.current = requested.circuit; setCircuit(requested.circuit); requestedPark.current = ""; }
      setRequest(previous => ({ ...previous, destinationIds: requested ? [requested.id] : previous.destinationIds.length ? previous.destinationIds.filter(id => value.destinations.some(d => d.id === id && d.circuit === circuitRef.current)) : value.destinations.filter(d => d.circuit === circuitRef.current).slice(0, 2).map(d => d.id) }));
    }).catch(cause => { if (!abort.signal.aborted) setConfigError(cause.message); });
    return () => abort.abort();
  }, [reload, request.arrivalDate]);
  useEffect(() => () => previewAbort.current?.abort(), []);

  const invalidate = () => {
    previewVersion.current += 1; previewAbort.current?.abort(); setBusy(false);
    setPreview(null); setReceipt(null); setSubmitError(""); setError(""); requestId.current = crypto.randomUUID();
  };
  const change = (patch: Partial<BokerTripRequest>) => {
    invalidate();
    if (patch.arrivalDate !== undefined) { setConfig(null); setConfigError(""); }
    setRequest(previous => ({ ...previous, ...patch }));
  };
  const generate = async (event: FormEvent) => {
    event.preventDefault();
    const tokens = children.trim() ? children.split(",").map(token => token.trim()) : [];
    if (tokens.some(token => !/^\d{1,2}$/.test(token) || Number(token) > 17)) { setError("Enter children's ages from 0 to 17, separated by commas, for example 6, 10."); return; }
    if (request.adults + tokens.length > 20) { setError("Your safari can include up to 20 travellers in total, including children."); return; }
    const current = { ...request, childAges: tokens.map(Number) };
    const version = ++previewVersion.current;
    previewAbort.current?.abort(); const abort = new AbortController(); previewAbort.current = abort;
    setBusy(true); setError(""); setPreview(null); setReceipt(null); setSubmitError("");
    try {
      const value = await api<BokerPreview>("preview", { request: current }, AbortSignal.any([abort.signal, AbortSignal.timeout(30_000)]));
      if (version !== previewVersion.current) return;
      if (!value.options.length) throw new Error("No route is available for those choices. Try more days or fewer destinations.");
      setPreview(value); setSelectedId(value.options[0]?.id || ""); requestId.current = crypto.randomUUID();
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (cause) { if (version === previewVersion.current && !abort.signal.aborted) setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { if (version === previewVersion.current) setBusy(false); }
  };
  const enquire = async (event: FormEvent) => {
    event.preventDefault(); if (!preview || !selected || enquiryBusy.current) return;
    enquiryBusy.current = true; setSending(true); setSubmitError("");
    try {
      if (!requestId.current) requestId.current = crypto.randomUUID();
      const saved = await api<BokerEnquiryReceipt>("enquiries", { request: preview.request, selectionId: selected.id, contact, requestId: requestId.current });
      if (!saved.saved || !saved.reference) throw new Error("Your request was not confirmed saved. Please try again.");
      setReceipt(saved);
    } catch (cause) { setSubmitError(cause instanceof Error ? cause.message : "Your request wasn't saved. Please try again."); }
    finally { enquiryBusy.current = false; setSending(false); }
  };

  return <>
      <section className="boker-intro" aria-labelledby="boker-heading">
        <div className="boker-photo"><Image src={landscape} alt="Open savannah and acacia trees in Tanzania's Serengeti" fill sizes="(max-width: 740px) 100vw, 50vw" priority unoptimized /><div className="boker-photo-copy"><span className="boker-eyebrow">TANZANIA · AT YOUR PACE</span><h1 id="boker-heading">Your safari.<br /><em>Your story.</em></h1><p>Choose the places. Shape the journey.<br />Get your day-by-day itinerary in moments.</p><a className="boker-photo-note" href="https://commons.wikimedia.org/wiki/File:Serengeti-Landscape-2012.JPG" target="_blank" rel="noopener noreferrer">Serengeti National Park · Wikimedia Commons ↗</a></div></div>
        <form className="boker-planner" id="boker-planner" onSubmit={generate}>
          <span className="boker-eyebrow">START EXPLORING</span><h2>Where will your story begin?</h2>
          <fieldset disabled={sending}><legend className="boker-sr-only">Trip preferences</legend>
            <div className="boker-fields"><label>Arrival date<input type="date" required min={minArrivalDate} max={maxArrivalDate} value={request.arrivalDate} onChange={e => change({ arrivalDate: e.target.value })} /></label><label>Days on safari<input type="number" required min={2} max={14} value={request.days} onChange={e => change({ days: Number(e.target.value) })} /></label></div>
            <div className="boker-fields"><label>Adults<input type="number" required min={1} max={20} value={request.adults} onChange={e => change({ adults: Number(e.target.value) })} /></label><label>Children&apos;s ages <span className="boker-optional">optional</span><input type="text" inputMode="numeric" placeholder="e.g. 6, 10" value={children} maxLength={70} onChange={e => { invalidate(); setChildren(e.target.value); }} /></label></div>
            <div className="boker-fields"><label>Safari region<select value={circuit} onChange={e => { const nextCircuit = e.target.value as BokerCircuit; circuitRef.current = nextCircuit; setCircuit(nextCircuit); change({ destinationIds: [] }); }}><option value="northern">Northern Tanzania</option><option value="southern">Southern Tanzania</option></select></label><label>Comfort level<select value={request.budgetTier} onChange={e => change({ budgetTier: e.target.value as BokerTripRequest["budgetTier"], budgetGrade: e.target.value === "budget" ? null : "classic" })}><option value="budget">Budget</option><option value="midrange">Midrange</option><option value="luxury">Luxury</option></select></label></div>
            {request.budgetTier !== "budget" && <label>Stay style<select value={request.budgetGrade || "classic"} onChange={e => change({ budgetGrade: e.target.value as "classic" | "premium" })}><option value="classic">Classic</option><option value="premium">Premium</option></select></label>}
            <fieldset className="boker-destinations"><legend>Places you&apos;d love to see <span className="boker-optional">choose at least one</span></legend><div className="boker-chips">{config?.destinations.filter(d => d.circuit === circuit).map(d => <label key={d.id} className={request.destinationIds.includes(d.id) ? "is-selected" : ""}><input type="checkbox" checked={request.destinationIds.includes(d.id)} onChange={e => change({ destinationIds: e.target.checked ? [...request.destinationIds, d.id] : request.destinationIds.filter(id => id !== d.id) })} /><span>{d.label}</span>{request.destinationIds.includes(d.id) && <Check size={14} />}</label>)}</div>{!config && !configError && <p role="status">Loading destinations…</p>}{configError && <p role="alert">{configError} <button type="button" onClick={() => { setConfigError(""); setConfig(null); setReload(value => value + 1); }}>Retry</button></p>}</fieldset>
            <label>Park-fee visitor category<select value={request.travellerFeeCategory} onChange={e => change({ travellerFeeCategory: e.target.value as BokerTripRequest["travellerFeeCategory"] })}><option value="non-east-african">International visitor</option><option value="expatriate-resident">Expatriate resident</option><option value="east-african-citizen">East African citizen</option></select></label>
          </fieldset>
          {error && <p className="boker-error" role="alert">{error}</p>}
          <button className="boker-primary" disabled={!config || !request.destinationIds.length || busy || sending}>{busy ? <RefreshCw className="boker-spin" size={18} /> : <Compass size={19} />}{busy ? "Shaping your journey…" : "Build my itinerary"}<ArrowRight size={19} /></button>
          <p className="boker-form-note"><ShieldCheck size={15} /> No sign-up needed. No booking commitment.</p>
        </form>
      </section>
      <PackageRecommendations request={request} config={config} childrenText={children} />
      <section id="boker-journey" ref={resultsRef} className="boker-journey" aria-labelledby="boker-journey-title" aria-busy={busy}>
        <div className="boker-section-heading"><div><span className="boker-eyebrow">THE JOURNEY TAKES SHAPE</span><h2 id="boker-journey-title">{preview ? "A safari, made around you." : "From a wish list to a day-by-day plan."}</h2></div>{selected && <button className="boker-secondary boker-no-print" onClick={() => window.print()}><Printer size={17} /> Print itinerary</button>}</div>
        {!preview && <div className="boker-empty"><TentTree size={36} strokeWidth={1.2} /><p>{busy ? "Finding routes that connect your chosen places…" : "Choose your dates and destinations above. Your route, overnight stops and proposed stays will appear here."}</p></div>}
        {preview && selected && <>
          <div className="boker-options boker-no-print" aria-label="Itinerary options">{preview.options.map((option, index) => <button key={option.id} className={option.id === selected.id ? "active" : ""} disabled={sending} aria-pressed={option.id === selected.id} onClick={() => { setSelectedId(option.id); setReceipt(null); setSubmitError(""); requestId.current = crypto.randomUUID(); }}><span>ROUTE {String(index + 1).padStart(2, "0")}</span><strong>{option.route.map(stop => stop.parkName).join(" → ")}</strong><small>{option.nights} nights · From {option.gateway}</small></button>)}</div>
          <div className="boker-itinerary-layout"><div className="boker-days"><div className="boker-route-heading"><span className="boker-tag">DRAFT ITINERARY</span><h3>{selected.title}</h3><p>{displayDate(preview.request.arrivalDate)} · {preview.request.days} days · {preview.request.adults + preview.request.childAges.length} travellers</p></div>{selected.days.map(day => <article className="boker-day" key={day.day}><div className="boker-day-number"><small>DAY</small>{String(day.day).padStart(2, "0")}</div><div><span className="boker-day-date">{displayDate(day.date)}</span><h4>{day.parkName}</h4><p>{day.summary}</p>{day.overnight && <p className="boker-overnight"><Moon size={15} />{day.overnight}</p>}{day.travelNote && <p className="boker-travel-note">{day.travelNote}</p>}</div></article>)}</div>
            <aside className="boker-trip-summary"><span className="boker-eyebrow">YOUR SAFARI AT A GLANCE</span><h3>{preview.request.days} days of discovery</h3><dl><div><dt>Travellers</dt><dd>{preview.request.adults} adults{preview.request.childAges.length ? `, ${preview.request.childAges.length} children` : ""}</dd></div><div><dt>Overnight stops</dt><dd>{selected.nights} nights</dd></div><div><dt>Comfort</dt><dd>{preview.request.budgetTier} {preview.request.budgetGrade}</dd></div></dl>
              <div className="boker-price"><span>{hasEstimate ? "Estimated trip total" : "Price confirmation needed"}</span>{hasEstimate && <strong>{displayMoney(selected)}</strong>}<p>{selected.pricing.message}</p>{selected.pricing.reasons.length > 0 && <details><summary>What needs confirming?</summary><ul>{selected.pricing.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></details>}</div>
              {selected.hotels.length > 0 && <div className="boker-stays"><h4>Proposed stays</h4>{selected.hotels.map(hotel => <p key={`${hotel.parkId}-${hotel.name}`}><a href={hotel.url} target="_blank" rel="noopener noreferrer">{hotel.name} ↗</a><small>Subject to availability</small></p>)}</div>}
              <p className="boker-disclaimer">{preview.disclaimer}</p><a className="boker-primary boker-no-print" href="#boker-enquire">Request a confirmed quote <ArrowRight size={17} /></a>
            </aside></div>
          <section id="boker-enquire" className="boker-enquiry boker-no-print"><div><span className="boker-eyebrow">LET&apos;S MAKE IT YOURS</span><h2>Love this route?</h2><p>Send your plan to the Boker team to confirm hotels, park access, transfers and a complete price.</p><p className="boker-form-note">Your details are used to handle this enquiry, not to subscribe you to marketing.</p></div>
            {receipt ? <div className="boker-receipt" role="status"><Check size={28} /><h3>Your request is saved.</h3><p>Keep this reference: <strong>{receipt.reference}</strong></p><p>The Boker team can now review your itinerary. This is not a booking confirmation.</p><p>{receipt.emailSent ? "A confirmation email has been sent." : "An email has not been sent. Keep your reference for any follow-up."}</p></div> : <form onSubmit={enquire}><fieldset disabled={sending}><legend className="boker-sr-only">Contact details</legend><div className="boker-fields"><label>Your name<input autoComplete="name" required minLength={2} maxLength={120} value={contact.name} onChange={e => { requestId.current = crypto.randomUUID(); setContact({ ...contact, name: e.target.value }); }} /></label><label>Email address<input type="email" autoComplete="email" required maxLength={254} value={contact.email} onChange={e => { requestId.current = crypto.randomUUID(); setContact({ ...contact, email: e.target.value }); }} /></label></div><label>Phone <span className="boker-optional">optional</span><input type="tel" autoComplete="tel" maxLength={40} value={contact.phone} onChange={e => { requestId.current = crypto.randomUUID(); setContact({ ...contact, phone: e.target.value }); }} /></label><label>Anything else we should know?<textarea rows={3} maxLength={2000} placeholder="Your interests, accessibility needs or special requests" value={contact.notes} onChange={e => { requestId.current = crypto.randomUUID(); setContact({ ...contact, notes: e.target.value }); }} /></label></fieldset>{submitError && <p className="boker-error" role="alert">{submitError}</p>}<button className="boker-primary" disabled={sending || config?.enquiriesAvailable === false}>{sending ? "Saving your request…" : "Send my itinerary request"}<ArrowRight size={18} /></button>{config?.enquiriesAvailable === false && <p role="status">Enquiries are temporarily unavailable. You can still build and print your itinerary.</p>}</form>}
          </section>
        </>}
      </section>
  </>;
}
