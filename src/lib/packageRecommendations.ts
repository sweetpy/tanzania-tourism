import type { Package } from "./packageTypes";

export type PackagePreferences = {
  parkIds: string[];
  days: number;
  arrivalDate: string;
};

/** Rank complete prepared routes; never use brochure budgets to price a custom trip. */
export function recommendPackages<
  T extends Pick<
    Package,
    "slug" | "days" | "plannerParkIds" | "seasonMonths" | "source"
  >,
>(catalogue: T[], trip: PackagePreferences, limit = 3) {
  const parks = [
    ...new Set(
      trip.parkIds.map((park) =>
        park.startsWith("serengeti-") ? "serengeti-central" : park,
      ),
    ),
  ];
  if (!parks.length || !Number.isFinite(trip.days)) return [];
  const month = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(trip.arrivalDate)
    ? Number(trip.arrivalDate.slice(5, 7))
    : 0;
  return catalogue
    .filter(
      (pkg) =>
        pkg.source &&
        pkg.plannerParkIds.length > 0 &&
        parks.every((park) => pkg.plannerParkIds.includes(park)) &&
        (!pkg.seasonMonths.length || pkg.seasonMonths.includes(month)),
    )
    .map((pkg) => ({
      pkg,
      score:
        Math.abs(pkg.days - trip.days) * 12 +
        pkg.plannerParkIds.filter((park) => !parks.includes(park)).length * 5 -
        (pkg.seasonMonths.length && pkg.days === trip.days ? 3 : 0),
    }))
    .sort((a, b) => a.score - b.score || a.pkg.slug.localeCompare(b.pkg.slug))
    .slice(0, limit)
    .map(({ pkg }) => pkg);
}

export function packageEnquiryHref(
  slug: string,
  trip: {
    arrivalDate: string;
    days: number;
    adults: number;
    childAges: number[];
    budgetTier: string;
    budgetGrade: string | null;
    travellerFeeCategory: string;
  },
  parkLabels: string[],
) {
  const query = new URLSearchParams({
    package: slug,
    travelDates: trip.arrivalDate,
    partySize: String(trip.adults + trip.childAges.length),
    message: `Please quote this prepared package and help adapt it to my trip. My builder preferences: ${trip.days} safari days; ${trip.adults} adults${trip.childAges.length ? `; children aged ${trip.childAges.join(", ")}` : ""}; ${trip.budgetTier}${trip.budgetGrade ? ` ${trip.budgetGrade}` : ""}; visitor category: ${trip.travellerFeeCategory}; chosen places: ${parkLabels.join(", ")}. Please confirm the full duration, stays, transfers and total price for our party.`,
  });
  return `/enquire?${query.toString()}`;
}
