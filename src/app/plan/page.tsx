import type { Metadata } from "next";
import ItineraryStudio from "@/components/boker/ItineraryStudio";
import { getPackage } from "@/data/packages";

export const metadata: Metadata = {
  title: "Build your Tanzania itinerary",
  description:
    "Create your own Tanzania safari with Boker. Choose your dates, parks and comfort level, compare day-by-day routes, and request a confirmed quote.",
  alternates: { canonical: "/plan" },
};

// The date boundaries must remain current and identical on the server and client.
export const dynamic = "force-dynamic";

const parkIds = new Set([
  "serengeti-central",
  "ngorongoro",
  "tarangire",
  "manyara",
  "ruaha",
  "mikumi",
  "nyerere",
]);

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{
    park?: string | string[];
    package?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const requestedPackage =
    typeof query.package === "string" ? getPackage(query.package) : undefined;
  const initialPackage = requestedPackage?.source
    ? requestedPackage
    : undefined;
  const park =
    typeof query.park === "string" && parkIds.has(query.park) ? query.park : "";
  const today = new Date();
  const dateAt = (offset: number) =>
    new Date(today.getTime() + offset * 86_400_000).toISOString().slice(0, 10);

  let initialDate = dateAt(30);
  if (initialPackage?.seasonMonths.length) {
    const candidate = new Date(`${initialDate}T00:00:00Z`);
    while (!initialPackage.seasonMonths.includes(candidate.getUTCMonth() + 1))
      candidate.setUTCDate(candidate.getUTCDate() + 1);
    initialDate = candidate.toISOString().slice(0, 10);
  }
  return (
    <div className="boker-site">
      <ItineraryStudio
        key={initialPackage?.slug || park}
        initialPackageSlug={initialPackage?.slug}
        initialParkId={park}
        initialArrivalDate={initialDate}
        minArrivalDate={dateAt(0)}
        maxArrivalDate={dateAt(730)}
      />
    </div>
  );
}
