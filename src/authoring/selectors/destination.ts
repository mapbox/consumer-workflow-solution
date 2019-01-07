import AuthorState, { DestinationWithProperties } from "../data/AuthorState";
import { POI } from "../data/POI";

export function getDestinationWithProperties(state: AuthorState, id: string): DestinationWithProperties {
  return { ...state.itineraryDestinations[id], ...state.itineraryDestinationProperties[id] };
}

export function getDestinationPOIs(state: AuthorState, id: string): POI[] {
  return state.itineraryDestinationProperties[id].pois;
}
