import { Map } from "mapbox-gl";
/// Create a slot in the map where we can place data later.
export function addEmptyGeoJSONSource(map: Map, id: string) {
  map.addSource(id, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });
}
