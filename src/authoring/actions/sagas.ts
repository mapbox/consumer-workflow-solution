import { all, put, select, takeLatest } from "redux-saga/effects";
import { PublishedItinerary } from "../data/PublishedItinerary";
import AuthorState from "../data/AuthorState";
import { getGeoJSONRoutes } from "../selectors/getGeoJSONRoutes";
import { Actions, addBaseItinerary, addError, saveOutputItinerary, setNearbyPOIs } from "./actions";
import { parseCSVOrGeocodeLocations } from "../../utility/parseCSVOrGeocodeForLocations";

// =====
// Sagas
// =====

export function* searchForPoisSaga(action) {
  const { tileset, lnglat } = action;
  const [lng, lat] = lnglat;
  const query = `https://api.mapbox.com/v4/${tileset}/tilequery/${lng},${lat}.json?access_token=${
    process.env.REACT_APP_MAPBOX_API_KEY
  }&radius=10000&geometry=point&layers=poi_label&limit=20`;
  const json = yield fetch(query).then(resp => resp.json());
  yield put(setNearbyPOIs(json));
}

export function* generateOutputItinerarySaga() {
  const state: AuthorState = yield select();
  const { itineraryDestinations, itinerarySequence, itineraryDestinationProperties, title, description } = state;
  const stops = itinerarySequence
    .map(id => {
      return {
        ...itineraryDestinations[id],
        ...itineraryDestinationProperties[id]
      };
    })
    .reduce((accum, stop) => {
      accum[stop.id] = stop;
      return accum;
    }, {});

  // associate additional properties with geojson points
  const { paths, stops: points } = yield select(getGeoJSONRoutes);
  points.features.forEach(feature => {
    feature.properties = { ...feature.properties, ...itineraryDestinationProperties[feature.properties!.id] };
  });

  const itinerary: PublishedItinerary = {
    title,
    description,
    stops,
    sequence: itinerarySequence,
    paths,
    points
  };

  yield put(saveOutputItinerary(itinerary));
}

export function* loadItineraryFromCSVSaga(action) {
  const { file } = action;
  try {
    const contents = yield new Promise<string>((resolve, _) => {
      const reader = new FileReader();
      reader.onload = e => resolve((e.target! as any).result);
      reader.readAsText(file);
    });

    const places = yield parseCSVOrGeocodeLocations(contents);

    yield put(addBaseItinerary(places));
  } catch (err) {
    yield put(addError(`Failed to read itinerary file ${err.message}`));
  }
}

export function* rootSaga() {
  yield all([
    yield takeLatest(Actions.FIND_NEARBY_POIS, searchForPoisSaga),
    yield takeLatest(Actions.GENERATE_OUTPUT_ITINERARY, generateOutputItinerarySaga),
    yield takeLatest(Actions.PARSE_CSV_FOR_BASE_ITINERARY, loadItineraryFromCSVSaga)
  ]);
}
