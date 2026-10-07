export type PackagePrice = {
  status: "planning" | "on-request";
  currency: string;
  basis: string;
  ranges: { tier: string; minUsd: number; maxUsd: number }[];
  note: string;
};

export type Package = {
  slug: string;
  name: string;
  duration: string;
  days: number;
  kind?: "day-trip";
  departureTown?: string;
  finishNote?: string;
  planningReference?: string;
  nights?: number;
  code?: string;
  summary: string;
  highlights: string[];
  includes: string[];
  excludes?: string[];
  idealFor: string;
  destinations: string[];
  plannerParkIds: string[];
  category: string;
  travelStyle?: string;
  travelWindow?: string;
  seasonMonths: number[];
  paceNote?: string;
  itinerary?: {
    day: number;
    title: string;
    description: string;
    overnight: string;
    meals: string;
    timing: string;
  }[];
  stays?: {
    location: string;
    nights: number;
    midrange: string[];
    luxury: string[];
    note: string;
  }[];
  pricing: PackagePrice;
  image: string;
  imageAlt: string;
  imageCredit?: string;
  featured?: boolean;
  source?: {
    document: string;
    sha256: string;
    pricePage: number;
    receivedDate: string;
    programmePage?: number;
  };
};

export function formatRange(range: { minUsd: number; maxUsd: number }) {
  return `$${range.minUsd.toLocaleString("en-US")}–$${range.maxUsd.toLocaleString("en-US")}`;
}

export function packagePriceLabel(
  pkg: Pick<Package, "pricing">,
  tier = "midrange",
) {
  if (pkg.pricing.status === "on-request") return "Price on request";
  const range = pkg.pricing.ranges.find((item) => item.tier === tier);
  return range
    ? `${formatRange(range)} USD pp · ${tier === "midrange" ? "midrange" : tier} planning range`
    : "Price on request";
}
