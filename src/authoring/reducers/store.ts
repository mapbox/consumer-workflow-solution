import createSagaMiddleware from "@redux-saga/core";
import { Feature, FeatureCollection } from "geojson";
import { produce } from "immer";
import { AnyAction, applyMiddleware, compose, createStore } from "redux";
import { PublishedItinerary } from "../data/PublishedItinerary";
import Destination from "../data/Destination";
import { Actions, rootSaga } from "../actions";
import AuthorState, { ItineraryStopList, DestinationProperties } from "../data/AuthorState";

const itinerarySequenceReducer = (state: string[] | undefined, action: AnyAction): string[] => {
  if (state === undefined) {
    return [];
  }
  switch (action.type) {
    case Actions.ADD_BASE_ITINERARY:
      return action.itinerary.map((place: Destination) => place.id);
    case Actions.INSERT_DESTINATION:
      const { destination, position } = action;
      return produce(state, draft => {
        draft.splice(position, 0, destination.id);
      });
    case Actions.REMOVE_DESTINATION:
      const { id } = action;
      return state.filter(seqId => seqId !== id);
    case Actions.ADD_DESTINATION_PROPERTY:
      break;
    default:
      break;
  }
  return state;
};

const itineraryStopReducer = (state: ItineraryStopList | undefined, action: AnyAction): ItineraryStopList => {
  if (state === undefined) {
    return {};
  }
  switch (action.type) {
    case Actions.ADD_BASE_ITINERARY:
      return (action.itinerary as Destination[]).reduce<{ [key: string]: Destination }>((dict, stop) => {
        dict[stop.id] = stop;
        return dict;
      }, {});
    case Actions.INSERT_DESTINATION:
      const { destination } = action;
      return produce(state, draft => {
        draft[destination.id] = destination;
      });
    case Actions.REMOVE_DESTINATION:
      const { id } = action;
      return produce(state, draft => {
        delete draft[id];
      });
    default:
      return state;
  }
};

const stopPropertiesReducer = (
  state: { [id: string]: DestinationProperties } | undefined,
  action: AnyAction
): { [id: string]: DestinationProperties } => {
  if (state === undefined) {
    return {};
  }

  switch (action.type) {
    case Actions.ADD_BASE_ITINERARY:
      return (action.itinerary as Destination[]).reduce<{ [key: string]: DestinationProperties }>((dict, stop) => {
        dict[stop.id] = {
          lengthOfStay: 1,
          pois: []
        };
        return dict;
      }, {});
    case Actions.ADD_DESTINATION_PROPERTY:
      return produce(state, draft => {
        const stop = state[action.id] || {};
        let value = action.value;
        if (Array.isArray(value)) {
          value = value.slice();
        } else if (typeof value === "object") {
          value = { ...value };
        }
        draft[action.id] = produce(stop, stopDraft => {
          stopDraft[action.key] = value; // what about reference values?
        });
      });
    case Actions.ADD_DESTINATION_POI:
      return produce(state, draft => {
        const stop = state[action.id] || {};
        draft[action.id] = produce(stop, stopDraft => {
          stopDraft.pois.push(action.poi);
        });
      });
    case Actions.REMOVE_DESTINATION_POI:
      return produce(state, draft => {
        const stop = state[action.id] || {};
        draft[action.id] = produce(stop, stopDraft => {
          if (stopDraft.pois) {
            stopDraft.pois = stopDraft.pois.filter(poi => poi.id !== action.poiId);
          } else {
            stopDraft.pois = [];
          }
        });
      });
    case Actions.INSERT_DESTINATION:
      const { destination } = action;
      return produce(state, draft => {
        draft[destination.id] = state[destination.id] || {
          lengthOfStay: 1,
          pois: []
        };
      });
    case Actions.ASSIGN_DESTINATION_IMAGE:
      return produce(state, draft => {
        const stop = state[action.id];
        if (stop) {
          draft[action.id] = produce(stop, stopDraft => {
            stopDraft.imageURL = action.src;
          });
        } else {
          console.warn(`No stop properties found for id: ${action.id}`);
        }
      });
    default:
      break;
  }

  return state;
};

const imageSourcesReducer = (state: string[] | undefined, action: AnyAction): string[] => {
  if (state === undefined) {
    return [];
  }
  switch (action.type) {
    case Actions.ADD_IMAGE_SOURCES:
      return action.sources;
    default:
      break;
  }
  return state;
};

const errorReducer = (state: string | undefined, action: AnyAction): string | undefined => {
  switch (action.type) {
    case Actions.ADD_ERROR:
      return action.error;
    case Actions.CLEAR_ERRORS:
      return undefined;
    default:
      break;
  }
  return state;
};

const outputReducer = (state: PublishedItinerary | undefined, action: AnyAction) => {
  switch (action.type) {
    case Actions.SAVE_OUTPUT_ITINERARY:
      return action.itinerary;
    default:
      break;
  }
  return state;
};

const titleReducer = (state: string | undefined, action: AnyAction) => {
  if (state === undefined) {
    return "";
  }
  switch (action.type) {
    case Actions.SET_ITINERARY_TITLE:
      return action.title;
    default:
      break;
  }
  return state;
};

const descriptionReducer = (state: string | undefined, action: AnyAction) => {
  if (state === undefined) {
    return "";
  }
  switch (action.type) {
    case Actions.SET_ITINERARY_DESCRIPTION:
      return action.description;
    default:
      break;
  }
  return state;
};

const focusedDestinationIDReducer = (state: string | undefined, action: AnyAction) => {
  if (state === undefined) {
    return "";
  }
  switch (action.type) {
    case Actions.SET_FOCUSED_DESTINATION:
      return action.focused && action.id;
    default:
      return state;
  }
};

const showNearbyReducer = (state: boolean | undefined, action: AnyAction) => {
  if (state === undefined) {
    return false;
  }
  switch (action.type) {
    case Actions.SHOW_NEARBY_POIS:
      return action.show;
    case Actions.SET_FOCUSED_DESTINATION:
      // stop showing nearby when panel is closed
      return state && action.focused;
    default:
      return state;
  }
};

const poiReducer = (state: FeatureCollection | null, action: AnyAction) => {
  if (state === undefined) {
    return null;
  }

  switch (action.type) {
    case Actions.SET_NEARBY_POIS:
      return action.pois;
    default:
      break;
  }
  return state;
};

const selectedPOIReducer = (state: Feature[], action: AnyAction) => {
  if (state === undefined) {
    return [];
  }

  switch (action.type) {
    case Actions.ADD_DESTINATION_POI:
      return produce(state, draft => {
        const { poi } = action;
        draft.push({
          type: "Feature",
          id: poi.id,
          properties: {
            name: poi.name
          },
          geometry: {
            type: "Point",
            coordinates: [poi.longitude, poi.latitude]
          }
        });
      });
    case Actions.REMOVE_DESTINATION_POI:
      return state.filter(feature => feature.id !== action.poiId);
    default:
      break;
  }

  return state;
};

/// Our root reducer function for the authoring state.
const authorReducer = (state: AuthorState | undefined, action: AnyAction): AuthorState => {
  const input = state || ({} as AuthorState);
  return {
    itinerarySequence: itinerarySequenceReducer(input.itinerarySequence, action),
    itineraryDestinations: itineraryStopReducer(input.itineraryDestinations, action),
    itineraryDestinationProperties: stopPropertiesReducer(input.itineraryDestinationProperties, action),
    imageSources: imageSourcesReducer(input.imageSources, action),
    error: errorReducer(input.error, action),
    output: outputReducer(input.output, action),
    title: titleReducer(input.title, action),
    description: descriptionReducer(input.description, action),
    focusedDestinationID: focusedDestinationIDReducer(input.focusedDestinationID, action),
    doShowNearby: showNearbyReducer(input.doShowNearby, action),
    nearbyPOIs: poiReducer(input.nearbyPOIs, action),
    selectedPOIs: selectedPOIReducer(input.selectedPOIs, action)
  };
};

export const createAuthorStore = () => {
  const w = window as any;
  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers = w.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(authorReducer, composeEnhancers(applyMiddleware(sagaMiddleware)));
  sagaMiddleware.run(rootSaga);
  return store;
};
