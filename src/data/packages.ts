import curated from "./curatedPackages.json";
import type { Package, PackagePrice } from "@/lib/packageTypes";
export type { Package } from "@/lib/packageTypes";
export { packagePriceLabel } from "@/lib/packageTypes";

const landscape =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Serengeti-Landscape-2012.JPG/1280px-Serengeti-Landscape-2012.JPG";
const rift =
  "https://upload.wikimedia.org/wikipedia/commons/2/21/Lake_Manyara.jpg";
const onRequest: PackagePrice = {
  status: "on-request",
  currency: "USD",
  basis: "Quoted for your dates and party.",
  ranges: [],
  note: "A bespoke journey: route, services and price are confirmed in your quotation.",
};

const crafted: Package[] = curated.map((pkg) => ({
  ...pkg,
  image: pkg.imageKey === "serengeti" ? landscape : rift,
  imageAlt:
    pkg.imageKey === "serengeti"
      ? "Savannah and acacia trees in Serengeti National Park"
      : "Lake Manyara and the Rift Valley landscape in northern Tanzania",
  imageCredit:
    pkg.imageKey === "serengeti"
      ? "https://commons.wikimedia.org/wiki/File:Serengeti-Landscape-2012.JPG"
      : "https://commons.wikimedia.org/wiki/File:Lake_Manyara.jpg",
  pricing: { ...pkg.pricing, status: "planning" },
}));

const customJourneys: Package[] = [
  {
    slug: "kilimanjaro-lemosho",
    days: 8,
    category: "Custom journey",
    plannerParkIds: [],
    seasonMonths: [],
    pricing: onRequest,
    name: "Kilimanjaro Lemosho Trek",
    duration: "8 days on the mountain",
    summary:
      "A scenic western approach with strong acclimatisation — rainforest, Shira Plateau, and a midnight push for Uhuru Peak.",
    highlights: [
      "8-day Lemosho itinerary",
      "Experienced mountain guides & porters",
      "Time for acclimatisation",
      "Optional safari add-on after descent",
    ],
    includes: [
      "Park fees and rescue fees",
      "Tents, meals, and mountain crew",
      "Airport transfers (JRO / ARK area)",
      "Pre-climb briefing in Moshi / Arusha",
    ],
    idealFor: "Fit travellers seeking a well-paced summit attempt",
    destinations: ["kilimanjaro"],
    image:
      "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1600&q=80",
    imageAlt: "Mount Kilimanjaro peak above clouds for Lemosho trek climbers",
    featured: false,
  },
  {
    slug: "safari-and-zanzibar",
    days: 10,
    nights: 9,
    category: "Custom journey",
    plannerParkIds: [],
    seasonMonths: [],
    pricing: onRequest,
    name: "Safari & Zanzibar Escape",
    duration: "10 days / 9 nights",
    summary:
      "A northern safari followed by Zanzibar’s beaches, with the balance of safari days, transfers and beach nights tailored to you.",
    highlights: [
      "Serengeti & Ngorongoro wildlife days",
      "Domestic flight to Zanzibar",
      "Beach resort stay (north or east coast)",
      "Optional Stone Town & spice tour",
    ],
    includes: [
      "Safari park fees and full-board camps",
      "Domestic flight to Zanzibar",
      "Beach hotel with breakfast",
      "Key transfers throughout",
    ],
    idealFor: "Couples, honeymooners, and balanced itineraries",
    destinations: ["serengeti", "ngorongoro", "zanzibar"],
    image:
      "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1600&q=80",
    imageAlt: "Zanzibar beach retreat after a Tanzania safari adventure",
    featured: false,
  },
  {
    slug: "southern-wild-ruaha",
    days: 6,
    nights: 5,
    category: "Custom journey",
    plannerParkIds: ["ruaha"],
    seasonMonths: [],
    pricing: onRequest,
    name: "Southern Wild: Ruaha",
    duration: "6 days / 5 nights",
    summary:
      "Fly into Ruaha for intimate game viewing among baobabs and riverine woodland — fewer vehicles, bigger wilderness.",
    highlights: [
      "Fly-in safari logistics",
      "Elephant and predator focus",
      "Walking safari options (seasonal)",
      "Boutique bush camps",
    ],
    includes: [
      "Domestic flights (shared charter / scheduled)",
      "Park fees and full-board camping/lodging",
      "Game drives and guided activities",
      "Dar es Salaam or Arusha connections support",
    ],
    idealFor: "Return visitors and travellers seeking exclusivity",
    destinations: ["ruaha"],
    image:
      "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1600&q=80",
    imageAlt: "Elephants in wild southern Tanzania parkland near Ruaha",
    featured: false,
  },
];

export const packages = [...crafted, ...customJourneys];
export function getPackage(slug: string) {
  return packages.find((pkg) => pkg.slug === slug);
}
export function getFeaturedPackages() {
  return packages.filter((pkg) => pkg.featured);
}
