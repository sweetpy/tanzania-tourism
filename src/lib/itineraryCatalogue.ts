import { packages } from "@/data/packages";
import model from "@/data/training/itinerary-ranker.json";
import propertyData from "@/data/itineraryProperties.json";
import { rankBrochureRoutes, type LearnedTrip } from "./itineraryLearning";
import {
  brochureRoute,
  type Property,
  type CraftRoute,
} from "./itineraryCraft";
export const itineraryModel = model;
export const itineraryProperties = propertyData as Property[];
export const brochureCatalogue = packages.filter((p) => p.source);
export function preparedRoutes(trip: LearnedTrip): CraftRoute[] {
  return rankBrochureRoutes(brochureCatalogue, model, trip, true)
    .flatMap((pkg) => {
      try {
        return [brochureRoute(pkg, trip, model.version)];
      } catch {
        return [];
      }
    })
    .slice(0, 3);
}
