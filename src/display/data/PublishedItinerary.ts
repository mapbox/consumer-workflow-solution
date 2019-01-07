import { PublishedRoute } from "./PublishedRoute";
import { DestinationWithProperties } from "../../authoring/data/AuthorState";

export interface PublishedItinerary {
  destinations: { [id: string]: DestinationWithProperties };
  routes: PublishedRoute[];
}
