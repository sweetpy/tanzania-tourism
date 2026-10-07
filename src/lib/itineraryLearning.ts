import type { Package } from "./packageTypes";

export type LearnedTrip = {
  arrivalDate: string;
  days: number;
  placeIds: string[];
  style: string;
  adults: number;
  childAges: number[];
  budgetTier: "budget" | "midrange" | "luxury";
  travellerFeeCategory: string;
  circuit: "northern" | "southern";
};
export type RankerModel = {
  version: string;
  featureNames: string[];
  weights: number[];
  corpusSha256: string;
  training: { documents: number; pairs: number; method: string };
};
export type LearningExample = Pick<
  Package,
  "slug" | "days" | "destinations" | "category" | "seasonMonths" | "source"
>;
export const FEATURE_NAMES = [
  "durationFit",
  "routeFocus",
  "styleFit",
  "seasonalFit",
];
export const journeyStyles = [
  "Any",
  "Classic safari",
  "Culture & landscapes",
  "Night safari",
  "Fly-in & fly-back",
  "Seasonal migration",
  "Active adventure",
  "Day trip",
];
export const canonicalPlace = (id: string) =>
  id.startsWith("serengeti-")
    ? "serengeti"
    : id === "manyara"
      ? "lake-manyara"
      : id;
export function routeFeatures(
  pkg: LearningExample,
  trip: Pick<LearnedTrip, "days" | "placeIds" | "style" | "arrivalDate">,
) {
  const requested = [...new Set(trip.placeIds.map(canonicalPlace))];
  return [
    1 / (1 + Math.abs(pkg.days - trip.days)),
    1 / (1 + pkg.destinations.filter((id) => !requested.includes(id)).length),
    trip.style === "Any" ? 0 : Number(pkg.category === trip.style),
    Number(pkg.seasonMonths.length > 0),
  ];
}
export function eligibleExample(
  pkg: LearningExample,
  trip: Pick<
    LearnedTrip,
    "placeIds" | "arrivalDate" | "style" | "childAges"
  > & { days?: number },
) {
  const date = new Date(`${trip.arrivalDate}T00:00:00Z`);
  if (
    !pkg.source ||
    !trip.placeIds.length ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== trip.arrivalDate
  )
    return false;
  const month = date.getUTCMonth() + 1;
  const travelMonths = Array.from(
    { length: trip.days || 1 },
    (_, offset) =>
      new Date(date.getTime() + offset * 86_400_000).getUTCMonth() + 1,
  );
  return (
    trip.placeIds
      .map(canonicalPlace)
      .every((id) => pkg.destinations.includes(id)) &&
    (!pkg.seasonMonths.length ||
      (pkg.seasonMonths.includes(month) &&
        travelMonths.every((m) => pkg.seasonMonths.includes(m)))) &&
    (pkg.category !== "Active adventure" ||
      (trip.style === "Active adventure" && trip.childAges.length === 0))
  );
}
export function rankBrochureRoutes<T extends LearningExample>(
  catalogue: T[],
  model: RankerModel,
  trip: LearnedTrip,
  exactDays = false,
) {
  return catalogue
    .filter(
      (pkg) =>
        eligibleExample(pkg, trip) && (!exactDays || pkg.days === trip.days),
    )
    .map((pkg) => ({
      pkg,
      score: routeFeatures(pkg, trip).reduce(
        (sum, value, index) => sum + value * model.weights[index],
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.pkg.slug.localeCompare(b.pkg.slug))
    .map((item) => item.pkg);
}
