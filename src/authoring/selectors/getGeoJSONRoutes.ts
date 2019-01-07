import { createSelector } from "reselect";
import { featureCollection, greatCircle, point } from "@turf/turf";
import { LngLatBounds, LngLat } from "mapbox-gl";
import AuthorState from "../data/AuthorState";

export const getSequence = (state: AuthorState) => state.itinerarySequence;
export const getStops = (state: AuthorState) => state.itineraryDestinations;
export const getStopProperties = (state: AuthorState) => state.itineraryDestinationProperties;

export const getGeoJSONRoutes = createSelector(
  [getSequence, getStops],
  (sequence, itineraryStops) => {
    const seq = sequence.map(id => itineraryStops[id]);
    // Convert new itinerary data to GeoJSON for display on the map
    const stops = featureCollection(
      seq.map(stop => point([stop.longitude, stop.latitude], { title: stop.title, id: stop.id }))
    );

    // Draw itinerary route as great circles for nice arcing look
    const greatCircles = seq
      .map(stop => [stop.longitude, stop.latitude])
      .map((stop, index, arr) => {
        if (index + 1 < arr.length) {
          return [stop, arr[index + 1]];
        }
        return null;
      })
      .filter(entry => entry !== null)
      .map(pair => greatCircle(pair![0], pair![1], { npoints: 50 }));
    const paths = featureCollection(greatCircles);

    // frame data
    const bounds = seq.reduce((bounds, stop) => {
      bounds.extend(new LngLat(stop.longitude, stop.latitude));
      return bounds;
    }, new LngLatBounds());

    return { bounds, paths, stops };
  }
);
