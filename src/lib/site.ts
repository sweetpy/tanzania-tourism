/**
 * Central brand + IA config. Rename siteConfig.name / tagline here to rebrand
 * without hunting through pages.
 */
export const siteConfig = {
  name: "Boker",
  shortName: "Boker",
  tagline: "Open Tanzania.",
  description:
    "Discover Tanzania with Boker. Build your safari itinerary, explore Serengeti, Kilimanjaro and Zanzibar, or partner through Boker Trade.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.bokeradventure.com",
  locale: "en_US",
  contactEmail: "support@pindestinations.com",
  partnerEmail: "support@pindestinations.com",
  ambition:
    "Discover Tanzania, build a safari around your dates, and make it your own. For outbound operators, Boker Trade connects inspiration with adaptable journeys.",
  tradeName: "Boker Trade",
};

/** Destination guide slugs mapped to parks supported by the itinerary service. */
export const plannerParks: Readonly<Partial<Record<string, string>>> = {
  serengeti: "serengeti-central",
  ngorongoro: "ngorongoro",
  "lake-manyara": "manyara",
  ruaha: "ruaha",
  tarangire: "tarangire",
  mikumi: "mikumi",
  nyerere: "nyerere",
};

/** Primary traveler navigation */
export const navLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/experiences", label: "Experiences" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
  { href: "/partners", label: "Partners" },
  { href: "/operators", label: "Boker Trade" },
];

/** Trade / partner secondary links */
export const operatorNavLinks = [
  { href: "/operators", label: "How it works" },
  { href: "/operators/catalog", label: "Partner catalog" },
  { href: "/operators/apply", label: "Apply to partner" },
];

/** Tasteful institutional framing — no logos, no fake endorsements */
export const ecosystemPartners = [
  {
    name: "Tanzania Tourist Board (TTB)",
    role: "National destination marketing",
    note: "Boker aligns with official destination narratives and welcomes collaboration on trade campaigns — with Tanzania, not instead of TTB.",
  },
  {
    name: "Ministry of Natural Resources & Tourism (MNRT)",
    role: "Sector policy & statistics",
    note: "Trust signals cite MNRT and Exit Survey publications — not private estimates.",
  },
  {
    name: "TATO / licensed inbound operators",
    role: "Ground delivery network",
    note: "Outbound partners connect through licensed Tanzanian DMCs for parks, vehicles, and guiding.",
  },
];
