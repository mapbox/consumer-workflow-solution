import Destination from "./Destination";
import { PublishedItinerary } from "./PublishedItinerary";
import { FeatureCollection, Feature } from "geojson";
import { POI } from "./POI";

export default interface AuthorState {
  error?: string;
  title: string;
  description: string;
  itinerarySequence: string[];
  itineraryDestinations: ItineraryStopList;
  itineraryDestinationProperties: { [id: string]: DestinationProperties };
  imageSources: string[];
  focusedDestinationID: string;
  doShowNearby: boolean;
  nearbyPOIs: FeatureCollection | null;
  selectedPOIs: Feature[];
  output?: PublishedItinerary;
}

export interface ItineraryStopList {
  [id: string]: Destination;
}

/// Attributes describing the destination.
/// Separated from the Destination to simplify editing.
/// This allows us to update data without needing to rebuild the map.
export interface DestinationProperties {
  lengthOfStay: number;
  imageURL?: string;
  description?: string;
  pois: POI[];
}

export interface DestinationWithProperties extends Destination, DestinationProperties {}
