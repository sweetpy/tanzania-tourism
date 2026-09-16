export type Package = {
  slug: string;
  name: string;
  duration: string;
  fromPriceUsd: number;
  summary: string;
  highlights: string[];
  includes: string[];
  idealFor: string;
  destinations: string[];
  image: string;
  imageAlt: string;
  featured?: boolean;
};

export const packages: Package[] = [
  {
    slug: "classic-northern-safari",
    name: "Classic Northern Safari",
    duration: "7 days / 6 nights",
    fromPriceUsd: 2890,
    summary:
      "Tarangire or Manyara, Ngorongoro Crater, and the Serengeti — Tanzania's most loved wildlife circuit in one seamless week.",
    highlights: [
      "Ngorongoro Crater full-day game drive",
      "Serengeti plains and predator viewing",
      "Comfortable mid-range lodges & tented camps",
      "Private safari vehicle and driver-guide",
    ],
    includes: [
      "Park fees and crater service fees",
      "Full-board safari accommodation",
      "Airport transfers (Kilimanjaro / Arusha)",
      "Bottled water on game drives",
    ],
    idealFor: "First-time safari travellers and families",
    destinations: ["lake-manyara", "ngorongoro", "serengeti"],
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80",
    imageAlt: "Open savannah landscape with acacia trees during a northern Tanzania safari",
    featured: true,
  },
  {
    slug: "migration-and-crater",
    name: "Migration & Crater Explorer",
    duration: "9 days / 8 nights",
    fromPriceUsd: 4250,
    summary:
      "Follow migration herds in the Serengeti, then descend into Ngorongoro for dense Big Five viewing — timed to the season you travel.",
    highlights: [
      "Season-optimised Serengeti positioning",
      "Optional hot-air balloon safari",
      "Ngorongoro Crater rim stay",
      "Flexible private itinerary pacing",
    ],
    includes: [
      "All park and conservation fees",
      "Full-board lodges / tented camps",
      "Private 4x4 with pop-up roof",
      "Arusha briefings and transfers",
    ],
    idealFor: "Wildlife enthusiasts and photographers",
    destinations: ["serengeti", "ngorongoro"],
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80",
    imageAlt: "Dramatic crater and highland landscape suited to migration safari itineraries",
    featured: true,
  },
  {
    slug: "kilimanjaro-lemosho",
    name: "Kilimanjaro Lemosho Trek",
    duration: "8 days on the mountain",
    fromPriceUsd: 2680,
    summary:
      "A scenic western approach with strong acclimatisation — rainforest, Shira Plateau, and a midnight push for Uhuru Peak.",
    highlights: [
      "8-day Lemosho itinerary",
      "Experienced mountain guides & porters",
      "High summit-success pacing",
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
    featured: true,
  },
  {
    slug: "safari-and-zanzibar",
    name: "Safari & Zanzibar Escape",
    duration: "10 days / 9 nights",
    fromPriceUsd: 3890,
    summary:
      "Six days of northern safari highlights followed by four nights on Zanzibar's beaches — bush then barefoot bliss.",
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
    featured: true,
  },
  {
    slug: "southern-wild-ruaha",
    name: "Southern Wild: Ruaha",
    duration: "6 days / 5 nights",
    fromPriceUsd: 3450,
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

export function getPackage(slug: string) {
  return packages.find((p) => p.slug === slug);
}

export function getFeaturedPackages() {
  return packages.filter((p) => p.featured);
}
