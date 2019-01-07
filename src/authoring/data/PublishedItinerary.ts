import { FeatureCollection } from "@turf/turf";
import { DestinationWithProperties } from "./AuthorState";

/// Represents a Trip itinerary that can be viewed on a map.
/// Relevant stop data is duplicated in the stops array and the
/// points collection for ease of reading.
export interface PublishedItinerary {
  id?: string;
  title: string;
  description: string;
  stops: { [id: string]: DestinationWithProperties };
  sequence: string[];
  // The following data is used by the map; we provide it as GeoJSON,
  // but it can also be uploaded to Mapbox and referenced as a datasource.
  points: FeatureCollection;
  paths: FeatureCollection;
}
