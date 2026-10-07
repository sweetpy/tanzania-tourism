import type { BokerConfig, BokerPreview } from "./bokerTypes";
import type { LearnedTrip } from "./itineraryLearning";
import { customRoute, parkIdFor } from "./itineraryCraft";
import { handleBokerRequest } from "./bokerGateway";
// Server rebuilds from trusted configuration and the current preview, never a client-supplied day plan.
export async function resolveCustomCraft(trip: LearnedTrip, id: string) {
  if (trip.days < 3)
    throw new Error(
      "Choose a prepared short safari or day trip for this duration.",
    );
  const configResponse = await handleBokerRequest(
    new Request(
      `https://boker.local/api/boker/config?date=${trip.arrivalDate}`,
    ),
    "config",
  );
  const config = (await configResponse.json()) as BokerConfig & {
    error?: string;
  };
  if (!configResponse.ok)
    throw new Error(
      config.error || "The route service is unavailable. Please try again.",
    );
  const destinations = trip.placeIds.map((place) =>
    config.destinations.find(
      (d) => d.parkId === parkIdFor(place) && d.circuit === trip.circuit,
    ),
  );
  if (destinations.some((d) => !d))
    throw new Error("These places need a tailor-made route from the team.");
  const request = {
    arrivalDate: trip.arrivalDate,
    days: trip.days,
    adults: trip.adults,
    childAges: trip.childAges,
    travellerFeeCategory: trip.travellerFeeCategory,
    destinationIds: destinations.map((d) => d!.id),
    budgetTier: trip.budgetTier,
    budgetGrade: trip.budgetTier === "budget" ? null : "classic",
  };
  const response = await handleBokerRequest(
    new Request("https://boker.local/api/boker/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ request }),
    }),
    "preview",
  );
  const preview = (await response.json()) as BokerPreview & { error?: string };
  if (!response.ok)
    throw new Error(
      preview.error || "Your route could not be checked. Please try again.",
    );
  const option = preview.options.find(
    (o) =>
      o.id === id &&
      o.circuit === trip.circuit &&
      trip.placeIds.every((place) =>
        o.route.some((stop) => stop.parkId === parkIdFor(place)),
      ),
  );
  if (!option)
    throw new Error("Your route has changed. Please generate a fresh draft.");
  return customRoute(option);
}
