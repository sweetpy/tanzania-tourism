import type { Metadata } from "next";
import BokerPlanner from "@/components/boker/BokerPlanner";

export const metadata: Metadata = {
  title: "Build your Tanzania itinerary",
  description: "Create your own Tanzania safari with Boker. Choose your dates, parks and comfort level, compare day-by-day routes, and request a confirmed quote.",
  alternates: { canonical: "/plan" },
};

// The date boundaries must remain current and identical on the server and client.
export const dynamic = "force-dynamic";

const parkIds = new Set(["serengeti-central", "ngorongoro", "tarangire", "manyara", "ruaha", "mikumi", "nyerere"]);

export default async function PlanPage({ searchParams }: {
  searchParams: Promise<{ park?: string | string[] }>;
}) {
  const query = await searchParams;
  const park = typeof query.park === "string" && parkIds.has(query.park) ? query.park : "";
  const today = new Date();
  const dateAt = (offset: number) => new Date(today.getTime() + offset * 86_400_000).toISOString().slice(0, 10);

  return <div className="boker-site">
    <BokerPlanner key={park} initialParkId={park} initialArrivalDate={dateAt(30)} minArrivalDate={dateAt(0)} maxArrivalDate={dateAt(730)} />
  </div>;
}
