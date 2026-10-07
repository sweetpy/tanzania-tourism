import type { Package } from "./packageTypes";
import type { BokerOption, BokerTripRequest } from "./bokerTypes";
import {
  journeyStyles,
  canonicalPlace,
  eligibleExample,
  type LearnedTrip,
} from "./itineraryLearning.ts";

export const places = [
  { id: "tarangire", name: "Tarangire", circuit: "northern" },
  { id: "ngorongoro", name: "Ngorongoro Crater", circuit: "northern" },
  { id: "serengeti", name: "Serengeti", circuit: "northern" },
  { id: "lake-manyara", name: "Lake Manyara", circuit: "northern" },
  { id: "lake-eyasi", name: "Lake Eyasi", circuit: "northern" },
  { id: "lake-natron", name: "Lake Natron", circuit: "northern" },
  { id: "ol-doinyo-lengai", name: "Ol Doinyo Lengai", circuit: "northern" },
  { id: "ruaha", name: "Ruaha", circuit: "southern" },
  { id: "mikumi", name: "Mikumi", circuit: "southern" },
  { id: "nyerere", name: "Nyerere", circuit: "southern" },
  {
    id: "arusha-national-park",
    name: "Arusha National Park",
    circuit: "northern",
  },
  {
    id: "lake-duluti",
    name: "Lake Duluti",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "tengeru",
    name: "Tengeru coffee & cooking",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "mto-wa-mbu",
    name: "Mto wa Mbu village",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "olpopongi",
    name: "Olpopongi cultural village",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "arusha-city",
    name: "Arusha city",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "materuni",
    name: "Materuni waterfall & coffee",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "marangu",
    name: "Marangu heritage",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "chemka",
    name: "Chemka springs",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "lake-chala",
    name: "Lake Chala",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "lake-jipe",
    name: "Lake Jipe",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "rau-forest",
    name: "Rau Forest",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "moshi-town",
    name: "Moshi town",
    circuit: "northern",
    dayTripOnly: true,
  },
  {
    id: "kilimanjaro",
    name: "Kilimanjaro day hike",
    circuit: "northern",
    dayTripOnly: true,
  },
  { id: "mkomazi", name: "Mkomazi", circuit: "northern", dayTripOnly: true },
];
export type Property = {
  id: string;
  name: string;
  location: string;
  tier: "midrange" | "luxury";
  url: string;
  images: string[];
  facts: string[];
  credit: string;
  checkedAt: string;
  closedMonths?: number[];
  minAge?: number;
  operationNote?: string;
};
export type CraftDay = {
  day: number;
  date: string;
  title: string;
  description: string;
  overnight: string;
  meals: string;
  timing: string;
};
export type CraftRoute = {
  id: string;
  title: string;
  origin: "brochure" | "custom";
  packageSlug?: string;
  days: CraftDay[];
  includes: string[];
  excludes: string[];
  note: string;
  source?: Package["source"];
  pricing?: Package["pricing"];
  modelVersion?: string;
  kind?: "day-trip";
  departureTown?: string;
};
export type DayChoice = {
  day: number;
  propertyId: string | null;
  room: string;
  services: string[];
  note: string;
};
export type CraftRequest = {
  version: 1;
  trip: LearnedTrip;
  routeId: string;
  choices: DayChoice[];
  customRequest?: BokerTripRequest;
};
export const roomChoices = [
  "Let the team advise",
  "Double",
  "Twin",
  "Single rooms",
  "Family arrangement",
];
export function dateAt(start: string, offset: number) {
  return new Date(new Date(`${start}T00:00:00Z`).getTime() + offset * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function validateTrip(
  value: unknown,
  today = new Date().toISOString().slice(0, 10),
): LearnedTrip {
  if (!value || typeof value !== "object")
    throw new Error("Please complete your trip preferences.");
  const t = value as LearnedTrip;
  const date = new Date(`${t.arrivalDate}T00:00:00Z`);
  if (
    typeof t.arrivalDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(t.arrivalDate) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== t.arrivalDate ||
    t.arrivalDate < today ||
    t.arrivalDate > dateAt(today, 730)
  )
    throw new Error("Choose an arrival date within the next two years.");
  if (!Number.isInteger(t.days) || t.days < 1 || t.days > 20)
    throw new Error("Choose a day trip or a journey of 2 to 20 days.");
  if (
    !Number.isInteger(t.adults) ||
    t.adults < 1 ||
    t.adults > 20 ||
    !Array.isArray(t.childAges) ||
    t.childAges.some((age) => !Number.isInteger(age) || age < 0 || age > 17) ||
    t.adults + t.childAges.length > 20
  )
    throw new Error(
      "Include 1 to 20 travellers; children's ages must be 0 to 17.",
    );
  if (
    !["northern", "southern"].includes(t.circuit) ||
    !Array.isArray(t.placeIds) ||
    !t.placeIds.length ||
    t.placeIds.length > 7 ||
    new Set(t.placeIds).size !== t.placeIds.length ||
    t.placeIds.some(
      (id) =>
        !places.some(
          (p) =>
            p.id === id &&
            p.circuit === t.circuit &&
            (!p.dayTripOnly || t.days === 1),
        ),
    )
  )
    throw new Error("Choose places in the same safari circuit.");
  if (
    !journeyStyles.includes(t.style) ||
    !["budget", "midrange", "luxury"].includes(t.budgetTier) ||
    ![
      "non-east-african",
      "expatriate-resident",
      "east-african-citizen",
    ].includes(t.travellerFeeCategory)
  )
    throw new Error("Please check your trip preferences.");
  return {
    arrivalDate: t.arrivalDate,
    days: t.days,
    adults: t.adults,
    childAges: [...t.childAges],
    placeIds: [...t.placeIds],
    style: t.style,
    budgetTier: t.budgetTier,
    travellerFeeCategory: t.travellerFeeCategory,
    circuit: t.circuit,
  };
}
export function brochureRoute(
  pkg: Package,
  trip: LearnedTrip,
  modelVersion: string,
): CraftRoute {
  if (
    pkg.days !== trip.days ||
    !eligibleExample(pkg, trip) ||
    !pkg.itinerary?.length
  )
    throw new Error("This prepared route does not fit your dates and places.");
  // Seasonal journeys must remain inside their brochure window for every day.
  if (
    pkg.seasonMonths.length &&
    Array.from(
      { length: trip.days },
      (_, i) =>
        new Date(`${dateAt(trip.arrivalDate, i)}T00:00:00Z`).getUTCMonth() + 1,
    ).some((month) => !pkg.seasonMonths.includes(month))
  )
    throw new Error(
      "This migration journey extends outside its seasonal window. Try different dates.",
    );
  return {
    id: `brochure:${pkg.slug}`,
    title: pkg.name,
    origin: "brochure",
    packageSlug: pkg.slug,
    kind: pkg.kind,
    departureTown: pkg.departureTown,
    days: pkg.itinerary.map((d) => ({
      ...d,
      date: dateAt(trip.arrivalDate, d.day - 1),
    })),
    includes: pkg.includes,
    excludes: pkg.excludes || [],
    note: pkg.paceNote || pkg.finishNote || pkg.summary,
    source: pkg.source,
    pricing: pkg.pricing,
    modelVersion,
  };
}
export function customRoute(option: BokerOption): CraftRoute {
  const displayText = (value: string) => value.replace(/\s*\u2014\s*/g, ", ");
  return {
    id: `custom:${option.id}`,
    title: displayText(option.title),
    origin: "custom",
    days: option.days.map((d) => ({
      day: d.day,
      date: d.date,
      title: displayText(d.parkName),
      description: displayText(d.summary),
      overnight: displayText(d.overnight || "None"),
      meals: "Confirmed in your quotation",
      timing: displayText(
        d.travelNote || "Your guide confirms departure and activity times.",
      ),
    })),
    includes: [],
    excludes: [],
    note: "A bespoke route. The team will confirm arrival logistics, daily activities, accommodation, meals and the final price before booking.",
  };
}
export function locationFor(day: CraftDay): string {
  const text = day.overnight.toLowerCase();
  if (text === "none" || !text) return "";
  if (text.includes("northern serengeti") || text.includes("mara"))
    return "Northern Serengeti";
  if (text.includes("western serengeti") || text.includes("grumeti"))
    return "Western Serengeti";
  if (text.includes("ndutu")) return "Ndutu area";
  if (text.includes("serengeti")) return "Central Serengeti";
  if (text.includes("karatu") || text.includes("ngorongoro")) return "Karatu";
  if (text.includes("tarangire")) return "Tarangire National Park";
  if (text.includes("eyasi")) return "Lake Eyasi";
  if (text.includes("natron") || text.includes("lengai")) return "Lake Natron";
  if (text.includes("manyara") || text.includes("mto wa mbu"))
    return "Mto wa Mbu / Manyara";
  if (text.includes("arusha")) return "Arusha";
  if (text.includes("ruaha")) return "Ruaha";
  if (text.includes("mikumi")) return "Mikumi";
  if (text.includes("nyerere") || text.includes("selous")) return "Nyerere";
  return day.overnight;
}
export function propertiesFor(
  day: CraftDay,
  trip: LearnedTrip,
  properties: Property[],
) {
  const month = new Date(`${day.date}T00:00:00Z`).getUTCMonth() + 1;
  return properties
    .filter(
      (p) =>
        p.location === locationFor(day) &&
        !p.closedMonths?.includes(month) &&
        (!p.minAge || trip.childAges.every((age) => age >= (p.minAge || 0))),
    )
    .sort(
      (a, b) =>
        Number(b.tier === trip.budgetTier) - Number(a.tier === trip.budgetTier),
    );
}
export const services = [
  {
    id: "photo-focus",
    name: "Photography focus",
    description:
      "Ask your guide to prioritise light, patient sightings and time for photographs.",
    kind: "Preference; no extra service assumed",
  },
  {
    id: "balloon",
    name: "Sunrise balloon enquiry",
    description:
      "Ask about a flight in this Serengeti region, with a revised morning programme. Operator age limits, weather and availability apply.",
    kind: "Optional; priced separately",
  },
  {
    id: "night-drive",
    name: "After-dark game drive",
    description:
      "Request a lodge-operated night drive in Tarangire. Permits, vehicle, guide and lodge access must be confirmed.",
    kind: "Optional; priced separately",
  },
  {
    id: "unhurried",
    name: "Unhurried afternoon",
    description:
      "Ask for a later start or more time at a stop where the route allows. Your guide will balance travel, opening hours and access.",
    kind: "Pace preference",
  },
  {
    id: "dietary",
    name: "Dietary care",
    description:
      "Flag dietary requirements for every lodge and your guide. Add the details in your day notes.",
    kind: "Preference; confirmation required",
  },
];
export function servicesFor(
  day: CraftDay,
  route: CraftRoute,
  trip: LearnedTrip,
) {
  const text = `${day.title} ${day.description}`.toLowerCase();
  const fullSafari =
    day.day > 1 &&
    day.day < route.days.length &&
    !/fly|flight|airstrip|transfer|drive to|return to|depart|arrival/.test(
      day.title.toLowerCase(),
    );
  const previous = route.days[day.day - 2];
  return services.filter(
    (s) =>
      s.id === "dietary" ||
      s.id === "unhurried" ||
      (s.id === "photo-focus" &&
        day.day > 1 &&
        day.day < route.days.length &&
        /game|safari|wildlife/.test(text)) ||
      (s.id === "balloon" &&
        fullSafari &&
        locationFor(day).includes("Serengeti") &&
        previous &&
        locationFor(previous) === locationFor(day) &&
        trip.childAges.length === 0 &&
        !route.includes.some(
          (item) =>
            /balloon/i.test(item) &&
            !/optional|excluded|not included/i.test(item),
        )) ||
      (s.id === "night-drive" &&
        locationFor(day) === "Tarangire National Park" &&
        fullSafari &&
        !route.days.some((d) =>
          /night (game )?drive|after.dark/.test(d.description.toLowerCase()),
        )),
  );
}
export function defaultChoices(route: CraftRoute): DayChoice[] {
  return route.days.map((day) => ({
    day: day.day,
    propertyId: null,
    room: roomChoices[0],
    services: [],
    note: "",
  }));
}
export function validateChoices(
  value: unknown,
  route: CraftRoute,
  trip: LearnedTrip,
  properties: Property[],
): DayChoice[] {
  if (!Array.isArray(value) || value.length !== route.days.length)
    throw new Error("Your draft must include a selection for every day.");
  return route.days.map((day) => {
    const matches = value.filter((c) => c && c.day === day.day);
    if (matches.length !== 1)
      throw new Error("Your day selections are incomplete or duplicated.");
    const c = matches[0] as DayChoice;
    if (
      c.propertyId !== null &&
      (typeof c.propertyId !== "string" ||
        !propertiesFor(day, trip, properties).some(
          (p) => p.id === c.propertyId,
        ))
    )
      throw new Error(
        `Please choose an accommodation option offered for Day ${day.day}.`,
      );
    if (
      !roomChoices.includes(c.room) ||
      !Array.isArray(c.services) ||
      new Set(c.services).size !== c.services.length ||
      c.services.some(
        (id) => !servicesFor(day, route, trip).some((s) => s.id === id),
      ) ||
      typeof c.note !== "string" ||
      c.note.length > 500
    )
      throw new Error(
        `Please check the services and room preference for Day ${day.day}.`,
      );
    return {
      day: day.day,
      propertyId: c.propertyId,
      room: c.room,
      services: [...c.services],
      note: c.note.trim(),
    };
  });
}
export function serializeCraft(
  route: CraftRoute,
  trip: LearnedTrip,
  choices: DayChoice[],
  properties: Property[],
) {
  const safe = validateChoices(choices, route, trip, properties);
  return {
    version: 1,
    trip,
    routeId: route.id,
    title: route.title,
    origin: route.origin,
    source: route.source || null,
    modelVersion: route.modelVersion || null,
    kind: route.kind || "safari",
    departureTown: route.departureTown || null,
    priceStatus: "dated-quote-required",
    days: route.days.map((day, i) => ({
      ...day,
      accommodation: safe[i].propertyId
        ? properties.find((p) => p.id === safe[i].propertyId)
        : null,
      roomPreference: safe[i].room,
      services: servicesFor(day, route, trip).filter((s) =>
        safe[i].services.includes(s.id),
      ),
      notes: safe[i].note,
    })),
    includes: route.includes,
    excludes: route.excludes,
  };
}
export function parkIdFor(id: string) {
  return id === "serengeti"
    ? "serengeti-central"
    : id === "lake-manyara"
      ? "manyara"
      : canonicalPlace(id);
}
