/**
 * Central brand + IA config. Rename siteConfig.name / tagline here to rebrand
 * without hunting through pages.
 */
export const siteConfig = {
  name: "Boker",
  shortName: "Boker",
  tagline: "Adventures",
  description:
    "Discover Tanzania with Boker. Build your safari itinerary, explore Serengeti, Kilimanjaro and Zanzibar, or partner through Boker Trade.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.bokeradventure.com",
  locale: "en_US",
  contactEmail: "support@pindestinations.com",
  partnerEmail: "support@pindestinations.com",
  ambition:
    "Plan a Tanzania safari, climb or beach stay. Tour operators can request itineraries and commercial terms through Boker Trade.",
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

/** Tasteful institutional framing; no logos, no fake endorsements */
export const ecosystemPartners = [
  {
    name: "Tanzania Tourist Board (TTB)",
    role: "National destination marketing",
    note: "The Tanzania Tourist Board promotes Tanzania as a travel destination.",
  },
  {
    name: "Ministry of Natural Resources & Tourism (MNRT)",
    role: "Sector policy & statistics",
    note: "Tourism figures on this site come from MNRT publications and the International Visitors’ Exit Survey.",
  },
  {
    name: "TATO / licensed inbound operators",
    role: "Ground delivery network",
    note: "Licensed Tanzanian operators arrange park visits, vehicles and guiding for travellers and trade partners.",
  },
];
