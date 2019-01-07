import csv from "csvtojson";
import { DestinationInput } from "../authoring/data/Destination";
import { uuid } from "../authoring/data/Identifier";

/// Reads a CSV into an array of DestinationInputs
/// If the input data does not have "latitude" and "longitude" columns, assumes
/// each line is the name of a place and uses the the Mapbox Geocoding API to
/// find latitude and longitude for each place.
export async function parseCSVOrGeocodeLocations(contents: string): Promise<DestinationInput[]> {
  const firstNewline = contents.indexOf("\n");
  const header = contents.substring(0, firstNewline).toLowerCase();
  if (header.indexOf("latitude") !== -1 && header.indexOf("longitude") !== -1) {
    const withLowercaseHeader = header + contents.substring(firstNewline);
    const rows = await csv().fromString(withLowercaseHeader);
    const places = rows.map((row: any) => {
      const { latitude, longitude, ...properties } = row;
      return {
        latitude,
        longitude,
        title: properties.title || "",
        id: properties.id || uuid(),
        properties
      };
    });

    return places;
  }

  // geocode locations
  const places = await Promise.all(
    contents
      .split("\n")
      .filter(Boolean)
      .map(async row => {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(row)}.json?access_token=${
            process.env.REACT_APP_MAPBOX_API_KEY
          }`
        );
        const json: GeocodingResponse = await response.json();
        const { features } = json;
        if (features.length > 0) {
          const feature = features[0];
          return {
            longitude: feature.center[0],
            latitude: feature.center[1],
            title: row,
            id: uuid(),
            properties: {}
          };
        } else {
          return {
            latitude: 0,
            longitude: 0,
            title: row,
            id: uuid(),
            properties: {
              notFound: "The query above returned no results from our Geocoder"
            }
          };
        }
      })
  );

  return places;
}

interface GeocodingResponse {
  type: string;
  query: string[];
  features: any[];
  attribution: string;
}
