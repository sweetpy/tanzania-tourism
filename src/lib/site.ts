/**
 * Central brand + IA config. Rename siteConfig.name / tagline here to rebrand
 * without hunting through pages.
 */
export const siteConfig = {
  name: "Tanzania Journeys",
  shortName: "TJ",
  tagline: "The digital gateway to Tanzania",
  description:
    "Plan Tanzania safaris, Kilimanjaro climbs, and Zanzibar stays — or partner as an outbound tour operator to resell packages. A platform-scale gateway for travellers and the trade.",
  url: "https://tanzania-tourism-production.up.railway.app",
  locale: "en_US",
  contactEmail: "hello@tanzaniajourneys.example",
  partnerEmail: "partners@tanzaniajourneys.example",
  social: {
    twitter: "@tanzaniajourneys",
  },
  ambition:
    "Building toward a dominant digital gateway for Tanzania visits — travellers discover and enquire; outbound operators browse, white-label, and resell.",
};

/** Primary traveler navigation */
export const navLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/experiences", label: "Experiences" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
  { href: "/operators", label: "For operators" },
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
    note: "We align messaging with official destination narratives and welcome collaboration on trade campaigns.",
  },
  {
    name: "Ministry of Natural Resources & Tourism (MNRT)",
    role: "Sector policy & statistics",
    note: "Trust signals on this site cite MNRT and Exit Survey publications — not private estimates.",
  },
  {
    name: "TATO / licensed inbound operators",
    role: "Ground delivery network",
    note: "Outbound partners connect through licensed Tanzanian DMCs for parks, vehicles, and guiding.",
  },
];
