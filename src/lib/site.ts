/**
 * Central brand + IA config. Rename siteConfig.name / tagline here to rebrand
 * without hunting through pages.
 */
export const siteConfig = {
  name: "Wazi",
  shortName: "Wazi",
  tagline: "Open Tanzania.",
  description:
    "Wazi is the open digital layer for Tanzania tourism — safaris, Kilimanjaro, and Zanzibar for travellers, plus Wazi Trade for outbound operators who resell packages, in partnership with TTB.",
  url: "https://tanzania-tourism-production.up.railway.app",
  locale: "en_US",
  contactEmail: "hello@wazi.example",
  partnerEmail: "partners@wazi.example",
  social: {
    twitter: "@wazitz",
  },
  ambition:
    "Become the default digital layer for Tanzania travel — travellers discover and enquire; outbound operators browse, white-label, and resell via Wazi Trade.",
  tradeName: "Wazi Trade",
};

/** Primary traveler navigation */
export const navLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/experiences", label: "Experiences" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
  { href: "/operators", label: "Wazi Trade" },
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
    note: "Wazi aligns with official destination narratives and welcomes collaboration on trade campaigns — with Tanzania, not instead of TTB.",
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
