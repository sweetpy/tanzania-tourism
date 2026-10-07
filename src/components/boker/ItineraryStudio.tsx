"use client";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Moon,
  Printer,
  Save,
  X,
} from "lucide-react";
import {
  brochureCatalogue,
  itineraryModel,
  itineraryProperties as properties,
  preparedRoutes,
} from "@/lib/itineraryCatalogue";
import {
  journeyStyles,
  rankBrochureRoutes,
  canonicalPlace,
  type LearnedTrip,
} from "@/lib/itineraryLearning";
import {
  places,
  validateTrip,
  defaultChoices,
  validateChoices,
  customRoute,
  locationFor,
  propertiesFor,
  servicesFor,
  roomChoices,
  parkIdFor,
  type CraftDay,
  type CraftRoute,
  type DayChoice,
  type CraftRequest,
  type Property,
} from "@/lib/itineraryCraft";
import type { BokerConfig, BokerPreview } from "@/lib/bokerTypes";
import "./studio.css";
const draftKey = "boker-itinerary-draft-v1";
const subscribe = () => () => {};
const clientReady = () => true,
  serverReady = () => false;
const displayDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.error || "We couldn't complete that request. Please try again.",
    );
  return result;
}
function SupplierPhoto({
  property,
  index = 0,
}: {
  property: Property;
  index?: number;
}) {
  const [failed, setFailed] = useState(false);
  return !failed && property.images[index] ? (
    <Image
      src={property.images[index]}
      width={640}
      height={420}
      alt={`${property.name} — supplier photograph ${index + 1}`}
      unoptimized
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="studio-photo-fallback">
      Supplier gallery available on the lodge website
    </div>
  );
}
export default function ItineraryStudio({
  initialParkId = "",
  initialPackageSlug = "",
  initialArrivalDate,
  minArrivalDate,
  maxArrivalDate,
}: {
  initialParkId?: string;
  initialPackageSlug?: string;
  initialArrivalDate: string;
  minArrivalDate: string;
  maxArrivalDate: string;
}) {
  const hydrated = useSyncExternalStore(subscribe, clientReady, serverReady);
  const initialPlace = canonicalPlace(initialParkId);
  const initialPackage = brochureCatalogue.find(
    (p) => p.slug === initialPackageSlug,
  );
  const [trip, setTrip] = useState<LearnedTrip>({
    arrivalDate: initialArrivalDate,
    days: initialPackage?.days || 7,
    adults: 2,
    childAges: [],
    budgetTier: "midrange",
    travellerFeeCategory: "non-east-african",
    circuit: ["ruaha", "mikumi", "nyerere"].includes(initialPlace)
      ? "southern"
      : "northern",
    placeIds:
      initialPackage?.destinations ||
      (initialPlace
        ? [initialPlace]
        : ["tarangire", "ngorongoro", "serengeti"]),
    style: initialPackage?.category || "Any",
  });
  const [children, setChildren] = useState("");
  const [generatedTrip, setGeneratedTrip] = useState<LearnedTrip | null>(null);
  const [routes, setRoutes] = useState<CraftRoute[]>([]),
    [routeId, setRouteId] = useState("");
  const [choices, setChoices] = useState<DayChoice[]>([]),
    [activeDay, setActiveDay] = useState(1);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [saved, setSaved] = useState<CraftRequest | null>(null),
    [storageMessage, setStorageMessage] = useState("");
  const [sameStay, setSameStay] = useState(true),
    [tierFilter, setTierFilter] = useState("all");
  const [gallery, setGallery] = useState<Property | null>(null);
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [sending, setSending] = useState(false),
    [receipt, setReceipt] = useState<{ id: string; message: string } | null>(
      null,
    );
  const dialog = useRef<HTMLDialogElement>(null),
    workspace = useRef<HTMLElement>(null),
    generation = useRef(0),
    sendLock = useRef(false);
  const routeChoices = useRef<Record<string, DayChoice[]>>({});
  const route = routes.find((r) => r.id === routeId);
  const nearby = rankBrochureRoutes(
    brochureCatalogue,
    itineraryModel,
    trip,
  ).slice(0, 3);
  const selectedNights = choices.filter((c) => c.propertyId).length;
  const serviceCount = choices.reduce((n, c) => n + c.services.length, 0);
  const update = (patch: Partial<LearnedTrip>) => {
    generation.current++;
    setBusy(false);
    setTrip((t) => ({ ...t, ...patch }));
    setRoutes([]);
    setGeneratedTrip(null);
    setChoices([]);
    setReceipt(null);
    setError("");
  };
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw && raw.length < 30000) {
          const draft = JSON.parse(raw);
          if (draft.version === 1 && typeof draft.routeId === "string")
            setSaved(draft);
        }
      } catch {
        setStorageMessage(
          "This browser cannot save drafts. You can still print your plan.",
        );
      }
    });
  }, []);
  useEffect(() => {
    if (!route || !generatedTrip || !hydrated) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          version: 1,
          trip: generatedTrip,
          routeId: route.id,
          choices,
        }),
      );
      queueMicrotask(() =>
        setStorageMessage(
          "Draft saved on this device · enquiry contact form is not stored",
        ),
      );
    } catch {
      queueMicrotask(() =>
        setStorageMessage(
          "Draft could not be saved on this device. Print a copy to keep it.",
        ),
      );
    }
  }, [route, generatedTrip, choices, hydrated]);
  useEffect(() => {
    if (gallery) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [gallery]);
  async function build(current: LearnedTrip, customOnly = false) {
    const prepared = customOnly ? [] : preparedRoutes(current);
    if (prepared.length)
      return current.style === initialPackage?.category
        ? prepared.sort(
            (a, b) =>
              Number(b.packageSlug === initialPackageSlug) -
              Number(a.packageSlug === initialPackageSlug),
          )
        : prepared;
    if (current.days < 3)
      throw new Error(
        "Choose one prepared day outing or short safari that covers your places. Try a suggested journey below; custom multi-park routes need at least three days.",
      );
    const config = await api<BokerConfig>(
      `/api/boker/config?date=${current.arrivalDate}`,
    );
    const destinations = current.placeIds.map((place) =>
      config.destinations.find(
        (d) => d.parkId === parkIdFor(place) && d.circuit === current.circuit,
      ),
    );
    if (destinations.some((d) => !d))
      throw new Error(
        "No prepared route fits all these choices. Try one of the suggested trip lengths below, or fewer places. Lake Eyasi, Natron and Lengai currently use our prepared journeys.",
      );
    const request = {
      arrivalDate: current.arrivalDate,
      days: current.days,
      adults: current.adults,
      childAges: current.childAges,
      travellerFeeCategory: current.travellerFeeCategory,
      destinationIds: destinations.map((d) => d!.id),
      budgetTier: current.budgetTier,
      budgetGrade: current.budgetTier === "budget" ? null : "classic",
    };
    const preview = await api<BokerPreview>("/api/boker/preview", { request });
    const options = preview.options.filter(
      (o) =>
        o.circuit === current.circuit &&
        o.days.length === current.days &&
        current.placeIds.every((place) =>
          o.route.some((stop) => stop.parkId === parkIdFor(place)),
        ),
    );
    if (!options.length)
      throw new Error(
        "No workable route was found. Try more days or fewer places.",
      );
    return options.map(customRoute);
  }
  async function generate(
    event?: FormEvent,
    customOnly = false,
    restore?: CraftRequest,
  ) {
    event?.preventDefault();
    const version = ++generation.current;
    setBusy(true);
    setError("");
    setReceipt(null);
    try {
      const ageTokens = children.trim()
        ? children.split(",").map((s) => s.trim())
        : [];
      if (
        !restore &&
        ageTokens.some((s) => !/^\d{1,2}$/.test(s) || Number(s) > 17)
      )
        throw new Error(
          "Enter children's ages from 0 to 17, separated by commas, for example 6, 10.",
        );
      const current = validateTrip(
        restore?.trip || { ...trip, childAges: ageTokens.map(Number) },
        minArrivalDate,
      );
      const next = await build(
        current,
        restore ? restore.routeId.startsWith("custom:") : customOnly,
      );
      if (version !== generation.current) return;
      const chosen = restore
        ? next.find((r) => r.id === restore.routeId)
        : next[0];
      if (!chosen)
        throw new Error(
          "The saved route has changed. Please build a fresh draft.",
        );
      const dayChoices = restore
        ? validateChoices(restore.choices, chosen, current, properties)
        : defaultChoices(chosen);
      setTrip(current);
      setChildren(current.childAges.join(", "));
      setGeneratedTrip(current);
      setRoutes(next);
      routeChoices.current = {};
      setRouteId(chosen.id);
      setChoices(dayChoices);
      setActiveDay(1);
      setTierFilter("all");
      setSaved(null);
      window.setTimeout(
        () =>
          workspace.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        80,
      );
    } catch (cause) {
      if (version === generation.current)
        setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      if (version === generation.current) setBusy(false);
    }
  }
  function chooseRoute(next: CraftRoute) {
    if (next.id === routeId) return;
    routeChoices.current[routeId] = choices;
    generation.current++;
    setRouteId(next.id);
    setChoices(routeChoices.current[next.id] || defaultChoices(next));
    setActiveDay(1);
    setReceipt(null);
    setTierFilter("all");
  }
  function changeChoice(day: number, patch: Partial<DayChoice>) {
    generation.current++;
    setChoices((old) =>
      old.map((c) => (c.day === day ? { ...c, ...patch } : c)),
    );
    setReceipt(null);
  }
  function chooseProperty(day: CraftDay, property: Property | null) {
    if (!route || !generatedTrip) return;
    generation.current++;
    let first = day.day,
      last = day.day;
    if (sameStay) {
      while (
        first > 1 &&
        locationFor(route.days[first - 2]) === locationFor(day)
      )
        first--;
      while (
        last < route.days.length &&
        locationFor(route.days[last]) === locationFor(day)
      )
        last++;
    }
    setChoices((old) =>
      old.map((c) =>
        c.day >= first &&
        c.day <= last &&
        (!property ||
          propertiesFor(route.days[c.day - 1], generatedTrip, properties).some(
            (p) => p.id === property.id,
          ))
          ? { ...c, propertyId: property?.id || null }
          : c,
      ),
    );
    setReceipt(null);
  }
  function reset() {
    generation.current++;
    setBusy(false);
    setRoutes([]);
    setGeneratedTrip(null);
    setChoices([]);
    setSaved(null);
    setReceipt(null);
    setStorageMessage("");
    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* Device storage may be unavailable. */
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!route || !generatedTrip || sendLock.current) return;
    sendLock.current = true;
    const version = generation.current;
    setSending(true);
    setError("");
    try {
      const craft: CraftRequest = {
        version: 1,
        trip: generatedTrip,
        routeId: route.id,
        choices,
      };
      const result = await api<{
        success: boolean;
        stored: boolean;
        id: string;
        message: string;
      }>("/api/enquire", {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        travelDates: `${generatedTrip.arrivalDate} to ${route.days.at(-1)?.date}`,
        partySize: generatedTrip.adults + generatedTrip.childAges.length,
        message: `Please confirm availability and a complete dated quotation for my crafted Boker itinerary. ${contact.notes.trim()}`,
        craft,
      });
      if (!result.success || !result.stored || !result.id)
        throw new Error(
          "Your request was not confirmed saved. Please try again.",
        );
      if (version === generation.current) setReceipt(result);
      else
        setError(
          `Your earlier draft was saved as ${result.id}. Your latest changes need a new enquiry.`,
        );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Your request could not be saved. Please try again.",
      );
    } finally {
      setSending(false);
      sendLock.current = false;
    }
  }
  return (
    <div className="itinerary-studio">
      <section className="studio-hero">
        <div>
          <span className="studio-kicker">
            <Compass size={16} /> BOKER · ADVENTURES, YOUR WAY
          </span>
          <h1>
            Make this journey
            <br />
            <em>your own.</em>
          </h1>
          <p>
            A considered route is just the beginning. Choose where you sleep,
            shape each day, and picture yourself there.
          </p>
          <div className="studio-steps">
            <span>01 Choose your route</span>
            <span>02 Craft your days</span>
            <span>03 Get a confirmed quote</span>
          </div>
        </div>
        <div className="studio-hero-note">
          <span>BUILT AROUND REAL JOURNEYS</span>
          <strong>{brochureCatalogue.length}</strong>
          <p>
            prepared safaris and day outings, shaped by the people who know
            Tanzania.
          </p>
          <Link href="/packages">
            Explore the collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      {saved && (
        <div className="studio-resume">
          <Save size={20} />
          <span>Your previous draft is on this device.</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void generate(undefined, false, saved)}
          >
            Resume my draft
          </button>
          <button type="button" onClick={reset}>
            Discard draft
          </button>
        </div>
      )}
      <form
        className="studio-preferences"
        onSubmit={generate}
        aria-label="Trip preferences"
      >
        <div className="studio-section-title">
          <div>
            <span className="studio-kicker">01 / YOUR STARTING POINT</span>
            <h2>What does your adventure look like?</h2>
          </div>
          <p>
            {trip.days === 1
              ? "Day trips start from an existing hotel stay. Accommodation and airport transfers are separate."
              : "Safari length includes arrival and the final travel day. You can mix accommodation styles later."}
          </p>
        </div>
        <fieldset disabled={!hydrated || busy}>
          <legend className="sr-only">Choose your safari preferences</legend>
          <div className="studio-field-grid">
            <label>
              {trip.days === 1 ? "Activity date" : "Arrival date"}
              <input
                aria-label={trip.days === 1 ? "Activity date" : "Arrival date"}
                required
                type="date"
                min={minArrivalDate}
                max={maxArrivalDate}
                value={trip.arrivalDate}
                onChange={(e) => update({ arrivalDate: e.target.value })}
              />
            </label>
            <label>
              Trip length
              <select
                aria-label="Trip length"
                value={trip.days}
                onChange={(e) => {
                  const days = Number(e.target.value);
                  const placeIds = trip.placeIds.filter((id) =>
                    places.some(
                      (p) => p.id === id && (!p.dayTripOnly || days === 1),
                    ),
                  );
                  update({
                    days,
                    placeIds: placeIds.length ? placeIds : ["tarangire"],
                    style:
                      days === 1
                        ? "Day trip"
                        : trip.style === "Day trip"
                          ? "Any"
                          : trip.style,
                  });
                }}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n === 1
                      ? "1 day / no overnight"
                      : `${n} days / ${n - 1} nights`}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Adults
              <input
                required
                type="number"
                min={1}
                max={20}
                value={trip.adults}
                onChange={(e) => update({ adults: Number(e.target.value) })}
              />
            </label>
            <label>
              Children&apos;s ages
              <input
                placeholder="e.g. 6, 10 · leave blank for none"
                value={children}
                onChange={(e) => {
                  setChildren(e.target.value);
                  update({});
                }}
              />
            </label>
            <label>
              Comfort preference
              <select
                aria-label="Comfort preference"
                value={trip.budgetTier}
                onChange={(e) =>
                  update({
                    budgetTier: e.target.value as LearnedTrip["budgetTier"],
                  })
                }
              >
                <option value="midrange">
                  Midrange · comfortable lodges & camps
                </option>
                <option value="luxury">Luxury · more space & refinement</option>
                <option value="budget">
                  Budget · ask for simpler alternatives
                </option>
              </select>
            </label>
            <label>
              Journey style
              <select
                aria-label="Journey style"
                value={trip.style}
                onChange={(e) => update({ style: e.target.value })}
              >
                {journeyStyles.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Safari circuit
              <select
                aria-label="Safari circuit"
                value={trip.circuit}
                onChange={(e) =>
                  update({
                    circuit: e.target.value as LearnedTrip["circuit"],
                    placeIds:
                      e.target.value === "northern"
                        ? ["tarangire", "ngorongoro"]
                        : ["ruaha"],
                  })
                }
              >
                <option value="northern">Northern Tanzania</option>
                <option value="southern">Southern Tanzania</option>
              </select>
            </label>
            <label>
              Park fee category
              <select
                aria-label="Park fee category"
                value={trip.travellerFeeCategory}
                onChange={(e) =>
                  update({ travellerFeeCategory: e.target.value })
                }
              >
                <option value="non-east-african">
                  Non East African visitor
                </option>
                <option value="expatriate-resident">Expatriate resident</option>
                <option value="east-african-citizen">
                  East African citizen
                </option>
              </select>
            </label>
          </div>
          <div className="studio-places">
            <span>Places you want to include</span>
            <div>
              {places
                .filter(
                  (p) =>
                    p.circuit === trip.circuit &&
                    (!p.dayTripOnly || trip.days === 1) &&
                    (trip.days !== 1 ||
                      ![
                        "serengeti",
                        "lake-eyasi",
                        "lake-natron",
                        "ol-doinyo-lengai",
                      ].includes(p.id)),
                )
                .map((p) => (
                  <label
                    key={p.id}
                    className={trip.placeIds.includes(p.id) ? "chosen" : ""}
                  >
                    <input
                      type="checkbox"
                      checked={trip.placeIds.includes(p.id)}
                      onChange={(e) =>
                        update({
                          placeIds: e.target.checked
                            ? [...trip.placeIds, p.id]
                            : trip.placeIds.filter((id) => id !== p.id),
                        })
                      }
                    />
                    {p.name}
                  </label>
                ))}
            </div>
          </div>
          <div className="studio-form-footer">
            <p>
              Prepared routes keep their original pace and programme. For other
              combinations, we&apos;ll explore a bespoke route.
            </p>
            <button className="studio-primary" type="submit">
              {busy ? "Shaping your journey…" : "Build my itinerary"}
              <ArrowRight size={18} />
            </button>
          </div>
        </fieldset>
      </form>
      {error && (
        <p className="studio-error" role="alert">
          {error}
        </p>
      )}
      {!route && nearby.length > 0 && (
        <section className="studio-inspiration">
          <span className="studio-kicker">
            JOURNEYS THAT INCLUDE YOUR PLACES
          </span>
          <div className="studio-scroll">
            {nearby.map((pkg) => (
              <article key={pkg.slug}>
                <span>
                  {pkg.duration} ·{" "}
                  {pkg.kind === "day-trip"
                    ? `from ${pkg.departureTown}`
                    : pkg.category}
                </span>
                <h3>{pkg.name}</h3>
                <p>{pkg.summary}</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    update({ days: pkg.days, style: pkg.category })
                  }
                >
                  Use this trip length <ArrowRight size={16} />
                </button>
                <a href={`/packages/${pkg.slug}`}>Read the full journey ↗</a>
              </article>
            ))}
          </div>
        </section>
      )}
      {route && generatedTrip && (
        <section
          className="studio-workspace"
          ref={workspace}
          aria-label="Your itinerary draft"
        >
          <div className="studio-section-title">
            <div>
              <span className="studio-kicker">02 / MAKE IT YOURS</span>
              <h2>Your adventure, day by day.</h2>
            </div>
            <span className="studio-draft-badge">
              DRAFT · NOT A RESERVATION
            </span>
          </div>
          <div className="studio-route-options studio-scroll">
            {routes.map((r, i) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={r.id === routeId}
                onClick={() => chooseRoute(r)}
              >
                <span>
                  {r.origin === "brochure"
                    ? i === 0
                      ? "Recommended prepared route"
                      : "Another prepared route"
                    : "Bespoke route to refine"}
                </span>
                <strong>{r.title}</strong>
                <small>
                  {r.kind === "day-trip"
                    ? `1 day · from ${r.departureTown} · no overnight`
                    : `${r.days.length} days · ${r.days.length - 1} nights`}
                </small>
                {r.id === routeId && <Check size={20} />}
              </button>
            ))}
          </div>
          <p className="studio-route-note">
            {route.note}{" "}
            {route.origin === "brochure" && (
              <a href={`/packages/${route.packageSlug}`}>
                See the full package and budget basis ↗
              </a>
            )}
          </p>
          <div className="studio-layout">
            <div className="studio-days">
              <nav className="studio-day-rail" aria-label="Jump to a day">
                {route.days.map((d) => (
                  <button
                    key={d.day}
                    type="button"
                    aria-pressed={activeDay === d.day}
                    onClick={() => {
                      setActiveDay(d.day);
                      document
                        .getElementById(`craft-day-${d.day}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                  >
                    Day {d.day}
                    <small>{displayDate(d.date)}</small>
                    {choices[d.day - 1]?.propertyId && <Check size={12} />}
                  </button>
                ))}
              </nav>
              {route.days.map((day) => {
                const choice = choices[day.day - 1];
                if (!choice) return null;
                const available = propertiesFor(day, generatedTrip, properties);
                const visible = available.filter(
                  (p) => tierFilter === "all" || p.tier === tierFilter,
                );
                const selectedProperty = properties.find(
                  (p) => p.id === choice.propertyId,
                );
                const offeredServices = servicesFor(day, route, generatedTrip);
                const overnight = locationFor(day);
                return (
                  <article
                    className={`studio-day ${activeDay === day.day ? "expanded" : ""}`}
                    key={day.day}
                    id={`craft-day-${day.day}`}
                  >
                    <button
                      className="studio-day-heading"
                      type="button"
                      aria-expanded={activeDay === day.day}
                      onClick={() => setActiveDay(day.day)}
                    >
                      <span className="studio-day-number">
                        {String(day.day).padStart(2, "0")}
                      </span>
                      <span>
                        <small>{displayDate(day.date)}</small>
                        <strong>{day.title}</strong>
                        <em>
                          {selectedProperty
                            ? selectedProperty.name
                            : overnight
                              ? `Overnight: ${overnight} · choose your stay`
                              : route.kind === "day-trip"
                                ? `Day outing from ${route.departureTown} · no accommodation`
                                : "Final day · no overnight stay"}
                        </em>
                      </span>
                      {activeDay === day.day ? (
                        <Moon size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                    {activeDay === day.day && (
                      <div className="studio-day-body">
                        <p className="studio-programme">{day.description}</p>
                        <div className="studio-day-facts">
                          <span>
                            <strong>Meals</strong>
                            {day.meals}
                          </span>
                          <span>
                            <strong>Day rhythm</strong>
                            {day.timing}
                          </span>
                        </div>
                        {overnight && (
                          <section
                            className="studio-stays"
                            aria-label={`Accommodation for Day ${day.day}`}
                          >
                            <div className="studio-stay-heading">
                              <div>
                                <span className="studio-kicker">
                                  YOUR PLACE TO REST
                                </span>
                                <h3>Stay in {overnight}</h3>
                              </div>
                              <label>
                                Show
                                <select
                                  aria-label="Accommodation comfort filter"
                                  value={tierFilter}
                                  onChange={(e) =>
                                    setTierFilter(e.target.value)
                                  }
                                >
                                  <option value="all">All styles</option>
                                  <option value="midrange">Midrange</option>
                                  <option value="luxury">Luxury</option>
                                </select>
                              </label>
                            </div>
                            <p className="studio-small">
                              Swipe or scroll to explore. These are preferences;
                              rooms, operating dates and prices need
                              confirmation.
                            </p>
                            <div className="studio-stay-controls">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={sameStay}
                                  onChange={(e) =>
                                    setSameStay(e.target.checked)
                                  }
                                />
                                Keep this lodge for consecutive nights at this
                                stop
                              </label>
                              <button
                                type="button"
                                onClick={() => chooseProperty(day, null)}
                                aria-pressed={!choice.propertyId}
                              >
                                Let Boker choose
                              </button>
                            </div>
                            {visible.length ? (
                              <div
                                className="studio-stay-carousel studio-scroll"
                                tabIndex={0}
                                aria-label={`Scrollable accommodation options for Day ${day.day}`}
                              >
                                {visible.map((property) => (
                                  <article
                                    className={`studio-property ${choice.propertyId === property.id ? "selected" : ""}`}
                                    key={property.id}
                                  >
                                    <button
                                      type="button"
                                      className="studio-property-photo"
                                      onClick={() => setGallery(property)}
                                      aria-label={`Preview ${property.name}`}
                                    >
                                      <SupplierPhoto property={property} />
                                      <span>View lodge & rooms ↗</span>
                                    </button>
                                    <div className="studio-property-copy">
                                      <span className="studio-kicker">
                                        {property.tier} · {property.location}
                                      </span>
                                      <h4>{property.name}</h4>
                                      <ul>
                                        {property.facts.slice(0, 2).map((f) => (
                                          <li key={f}>{f}</li>
                                        ))}
                                      </ul>
                                      {property.operationNote && (
                                        <p className="studio-small">
                                          {property.operationNote}
                                        </p>
                                      )}
                                      <button
                                        type="button"
                                        className="studio-select-stay"
                                        aria-pressed={
                                          choice.propertyId === property.id
                                        }
                                        onClick={() =>
                                          chooseProperty(day, property)
                                        }
                                      >
                                        {choice.propertyId === property.id ? (
                                          <>
                                            <Check size={16} /> Selected stay
                                          </>
                                        ) : (
                                          "Choose this stay"
                                        )}
                                      </button>
                                      <a
                                        href={property.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="studio-credit"
                                      >
                                        Photos & details: {property.credit} ↗
                                      </a>
                                    </div>
                                  </article>
                                ))}
                              </div>
                            ) : (
                              <p className="studio-empty">
                                {available.length
                                  ? "No stays in this style for this night. Show all styles to explore alternatives."
                                  : "The team will shortlist suitable lodges for this stop and your dates. Keep your room preferences and notes below."}
                              </p>
                            )}
                            <label className="studio-room">
                              Room preference
                              <select
                                aria-label="Room preference"
                                value={choice.room}
                                onChange={(e) =>
                                  changeChoice(day.day, {
                                    room: e.target.value,
                                  })
                                }
                              >
                                {roomChoices.map((r) => (
                                  <option key={r}>{r}</option>
                                ))}
                              </select>
                              <small>
                                Room allocation and any single supplement will
                                be quoted for your party.
                              </small>
                            </label>
                          </section>
                        )}
                        <section className="studio-services">
                          <span className="studio-kicker">
                            SMALL DETAILS, YOUR WAY
                          </span>
                          <h3>Shape the experience</h3>
                          <div>
                            {offeredServices.map((service) => (
                              <label
                                key={service.id}
                                className={
                                  choice.services.includes(service.id)
                                    ? "chosen"
                                    : ""
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={choice.services.includes(service.id)}
                                  onChange={(e) =>
                                    changeChoice(day.day, {
                                      services: e.target.checked
                                        ? [...choice.services, service.id]
                                        : choice.services.filter(
                                            (id) => id !== service.id,
                                          ),
                                    })
                                  }
                                />
                                <span>
                                  <strong>{service.name}</strong>
                                  <p>{service.description}</p>
                                  <small>{service.kind}</small>
                                </span>
                              </label>
                            ))}
                          </div>
                          <label className="studio-day-note">
                            Anything else for this day?
                            <textarea
                              aria-label="Anything else for this day?"
                              maxLength={500}
                              rows={2}
                              placeholder="Celebration, accessibility needs, dietary details, something you would love to see…"
                              value={choice.note}
                              onChange={(e) =>
                                changeChoice(day.day, { note: e.target.value })
                              }
                            />
                          </label>
                        </section>
                        <div className="studio-day-next">
                          <button
                            type="button"
                            disabled={day.day === 1}
                            onClick={() => setActiveDay(day.day - 1)}
                          >
                            <ChevronLeft size={16} />
                            Previous day
                          </button>
                          <button
                            type="button"
                            disabled={day.day === route.days.length}
                            onClick={() => {
                              setActiveDay(day.day + 1);
                              document
                                .getElementById(`craft-day-${day.day + 1}`)
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            }}
                          >
                            Next day
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
              <details className="studio-inclusions">
                <summary>What&apos;s included in this route?</summary>
                {route.includes.length ? (
                  <>
                    <h3>Original programme</h3>
                    <ul>
                      {route.includes.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                    <h3>Not included</h3>
                    <ul>
                      {route.excludes.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                    <p>
                      Selected alternatives and extras may change the original
                      package. The team will confirm your final inclusions in
                      writing.
                    </p>
                  </>
                ) : (
                  <p>
                    For this bespoke route, accommodation, meals, transport,
                    permits and activities will be itemised in your quotation.
                  </p>
                )}
              </details>
            </div>
            <aside className="studio-summary">
              <span className="studio-kicker">YOUR JOURNEY SO FAR</span>
              <h3>{route.title}</h3>
              <p>
                {displayDate(generatedTrip.arrivalDate)} –{" "}
                {displayDate(route.days.at(-1)!.date)}{" "}
                {generatedTrip.arrivalDate.slice(0, 4)}
              </p>
              <div className="studio-summary-stats">
                <span>
                  <strong>{generatedTrip.days}</strong>days
                </span>
                <span>
                  <strong>{generatedTrip.days - 1}</strong>nights
                </span>
                <span>
                  <strong>
                    {generatedTrip.adults + generatedTrip.childAges.length}
                  </strong>
                  travellers
                </span>
              </div>
              {generatedTrip.days > 1 ? (
                <div className="studio-progress">
                  <span>
                    {selectedNights} of {generatedTrip.days - 1} nights
                    personalised
                  </span>
                  <progress
                    value={selectedNights}
                    max={generatedTrip.days - 1}
                  />
                  <small>
                    Unselected nights: let the team recommend a stay.
                  </small>
                </div>
              ) : (
                <p className="studio-small">
                  Pickup and return: central {route.departureTown} hotel. Be in
                  town before the activity day. No accommodation or airport
                  transfers included.
                </p>
              )}
              <ol className="studio-selected-stays">
                {route.days
                  .filter((d) => locationFor(d))
                  .map((d) => (
                    <li key={d.day}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDay(d.day);
                          document
                            .getElementById(`craft-day-${d.day}`)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }}
                      >
                        <span>
                          Day {d.day} · {locationFor(d)}
                        </span>
                        <strong>
                          {properties.find(
                            (p) => p.id === choices[d.day - 1]?.propertyId,
                          )?.name || "Boker to recommend"}
                        </strong>
                      </button>
                    </li>
                  ))}
              </ol>
              <p className="studio-small">
                {serviceCount} experience preferences added
              </p>
              <div className="studio-budget">
                <span className="studio-kicker">YOUR PRICE</span>
                <strong>A quote for your exact choices</strong>
                <p>
                  Selected stays, rooms and optional services are priced after
                  availability is checked. No total has been assumed.
                </p>
                {route.pricing?.ranges.length ? (
                  <details>
                    <summary>View original brochure budget</summary>
                    <p>{route.pricing.basis}</p>
                    {route.pricing.ranges.map((r) => (
                      <p key={r.tier}>
                        {r.tier}: USD {r.minUsd.toLocaleString("en-US")}–
                        {r.maxUsd.toLocaleString("en-US")} per person
                      </p>
                    ))}
                    <small>
                      {route.pricing.note} These ranges describe the original
                      package, not the personalised trip or a live supplier
                      rate.
                    </small>
                  </details>
                ) : null}
              </div>
              <a href="#studio-quote" className="studio-primary">
                Request my quotation
                <ArrowRight size={18} />
              </a>
              <button
                type="button"
                className="studio-print"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Print / save as PDF
              </button>
              <p role="status" className="studio-small">
                <Save size={14} />
                {storageMessage}
              </p>
              <button className="studio-reset" type="button" onClick={reset}>
                Start a new draft
              </button>
            </aside>
          </div>
          {route.kind !== "day-trip" &&
            generatedTrip.circuit === "northern" && (
              <section
                className="studio-inspiration"
                aria-label="Separate day outings"
              >
                <span className="studio-kicker">ROOM FOR ANOTHER DAY?</span>
                <h2>Coffee, a lake or a little city life.</h2>
                <p>
                  These outings need a separate activity day before or after
                  your safari, from an existing Arusha hotel stay. They are
                  quoted separately and do not fit into your arrival or transfer
                  day automatically.
                </p>
                <div className="studio-scroll">
                  {brochureCatalogue
                    .filter((p) =>
                      [
                        "BA-DT-DULUTI",
                        "BA-DT-TENGERU-COFFEE",
                        "BA-DT-ARUSHA-CITY",
                      ].includes(p.code || ""),
                    )
                    .map((p) => (
                      <article key={p.slug}>
                        <span>
                          {p.duration} · from {p.departureTown}
                        </span>
                        <h3>{p.name}</h3>
                        <p>{p.summary}</p>
                        <Link href={`/packages/${p.slug}`}>
                          Explore this separate day out ↗
                        </Link>
                      </article>
                    ))}
                </div>
                <Link href="/packages?days=1">
                  See all Arusha and Moshi day outings →
                </Link>
              </section>
            )}
          <section className="studio-quote" id="studio-quote">
            <div>
              <span className="studio-kicker">03 / BRING IT TO LIFE</span>
              <h2>
                Let&apos;s turn your draft
                <br />
                into an adventure.
              </h2>
              <p>
                Your dates, complete daily programme, selected stays, room
                requests, services and notes will travel with this enquiry. The
                team checks availability and returns a complete quotation.
              </p>
              <p className="studio-small">
                No payment or reservation is made here. You can leave any night
                to the team.
              </p>
            </div>
            {receipt ? (
              <div className="studio-receipt" role="status">
                <Check size={32} />
                <h3>Your itinerary enquiry is saved.</h3>
                <p>{receipt.message}</p>
                <strong>Reference: {receipt.id}</strong>
                <p>
                  You can still adjust your draft and send an updated enquiry.
                </p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label>
                  Full name
                  <input
                    required
                    minLength={2}
                    maxLength={150}
                    autoComplete="name"
                    value={contact.name}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, name: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Email address
                  <input
                    required
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, email: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Phone / WhatsApp (optional)
                  <input
                    type="tel"
                    maxLength={80}
                    autoComplete="tel"
                    value={contact.phone}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, phone: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Anything for the whole journey?
                  <textarea
                    rows={3}
                    maxLength={4900}
                    value={contact.notes}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, notes: e.target.value }))
                    }
                    placeholder="Flight times, your occasion, preferred pace, room arrangements…"
                  />
                </label>
                <p className="studio-small">
                  By sending, you agree to our{" "}
                  <a href="/privacy">privacy policy</a>. Your choices are
                  requests until confirmed.
                </p>
                <button
                  className="studio-primary"
                  disabled={sending}
                  type="submit"
                >
                  {sending
                    ? "Saving your itinerary…"
                    : "Send my crafted itinerary"}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </section>
          {error && (
            <p role="alert" className="studio-error">
              {error}
            </p>
          )}
          <div className="studio-print-plan">
            <h1>Boker · Adventures</h1>
            <h2>{route.title}</h2>
            <p>
              {generatedTrip.arrivalDate} – {route.days.at(-1)?.date} ·{" "}
              {generatedTrip.adults} adults
              {generatedTrip.childAges.length
                ? ` · children's ages: ${generatedTrip.childAges.join(", ")}`
                : ""}
            </p>
            <p>
              Draft preferences. Availability, services and final pricing need
              confirmation.
            </p>
            {route.days.map((d, i) => (
              <section key={d.day}>
                <h3>
                  Day {d.day} · {d.date} · {d.title}
                </h3>
                <p>{d.description}</p>
                <p>
                  {d.meals} · {d.timing}
                </p>
                <p>
                  Stay:{" "}
                  {properties.find((p) => p.id === choices[i]?.propertyId)
                    ?.name ||
                    (locationFor(d)
                      ? `Boker to recommend in ${locationFor(d)}`
                      : "No overnight stay")}
                </p>
                {locationFor(d) && <p>Room preference: {choices[i]?.room}</p>}
                <p>
                  {servicesFor(d, route, generatedTrip)
                    .filter((s) => choices[i]?.services.includes(s.id))
                    .map((s) => `${s.name} (${s.kind})`)
                    .join("; ")}
                </p>
                <p>{choices[i]?.note}</p>
              </section>
            ))}
            <h3>Original programme inclusions</h3>
            {route.includes.map((x) => (
              <p key={x}>{x}</p>
            ))}
            <h3>Original exclusions</h3>
            {route.excludes.map((x) => (
              <p key={x}>{x}</p>
            ))}
            <p>
              Personalised alternatives and extras will be itemised in the
              quotation.
            </p>
          </div>
        </section>
      )}
      <dialog
        className="studio-gallery"
        ref={dialog}
        onClose={() => setGallery(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setGallery(null);
        }}
      >
        {gallery && (
          <div>
            <button
              type="button"
              autoFocus
              className="studio-gallery-close"
              aria-label="Close lodge preview"
              onClick={() => setGallery(null)}
            >
              <X size={22} />
            </button>
            <span className="studio-kicker">
              {gallery.location} · {gallery.tier}
            </span>
            <h2>{gallery.name}</h2>
            <div className="studio-gallery-images">
              {gallery.images.slice(0, 3).map((_, i) => (
                <SupplierPhoto
                  property={gallery}
                  key={`${gallery.id}-${i}`}
                  index={i}
                />
              ))}
            </div>
            <ul>
              {gallery.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p>
              Supplier photographs show the property, not a guaranteed room
              allocation. Room types and availability will be confirmed for your
              party.
            </p>
            <a href={gallery.url} target="_blank" rel="noopener noreferrer">
              Explore the official lodge website · {gallery.credit} ↗
            </a>
          </div>
        )}
      </dialog>
    </div>
  );
}
