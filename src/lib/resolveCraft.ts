import type { Package } from "./packageTypes";
import type { RankerModel, LearnedTrip } from "./itineraryLearning";
import type { CraftRequest, CraftRoute, Property } from "./itineraryCraft";
import {
  validateTrip,
  brochureRoute,
  serializeCraft,
} from "./itineraryCraft.ts";
export async function resolveCraft(
  value: unknown,
  catalogue: Package[],
  model: RankerModel,
  properties: Property[],
  customResolver?: (trip: LearnedTrip, id: string) => Promise<CraftRoute>,
) {
  if (!value || typeof value !== "object")
    throw new Error("Please provide your itinerary draft.");
  const input = value as CraftRequest;
  if (
    input.version !== 1 ||
    typeof input.routeId !== "string" ||
    input.routeId.length > 160
  )
    throw new Error("This saved draft needs to be rebuilt.");
  const trip = validateTrip(input.trip);
  let route: CraftRoute;
  if (input.routeId.startsWith("brochure:")) {
    const pkg = catalogue.find((p) => `brochure:${p.slug}` === input.routeId);
    if (!pkg)
      throw new Error(
        "This prepared journey is no longer available. Please rebuild your draft.",
      );
    route = brochureRoute(pkg, trip, model.version);
  } else if (input.routeId.startsWith("custom:") && customResolver) {
    route = await customResolver(trip, input.routeId.slice(7));
    if (route.id !== input.routeId || route.days.length !== trip.days)
      throw new Error(
        "Your custom route has changed. Please generate it again.",
      );
  } else throw new Error("Please choose a current itinerary route.");
  return serializeCraft(route, trip, input.choices, properties);
}
