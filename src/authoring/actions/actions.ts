import { PublishedItinerary } from "../data/PublishedItinerary";
import Destination from "../data/Destination";
import { POI } from "../data/POI";

export enum Actions {
  ADD_BASE_ITINERARY = "ADD_BASE_ITINERARY",
  PARSE_CSV_FOR_BASE_ITINERARY = "PARSE_CSV_FOR_BASE_ITINERARY",
  ADD_DESTINATION_PROPERTY = "ADD_DESTINATION_PROPERTY",
  ADD_DESTINATION_POI = "ADD_DESTINATION_POI",
  REMOVE_DESTINATION_POI = "REMOVE_DESTINATION_POI",
  INSERT_DESTINATION = "INSERT_DESTINATION",
  REMOVE_DESTINATION = "REMOVE_DESTINATION",
  ADD_ERROR = "ADD_ERROR",
  CLEAR_ERRORS = "CLEAR_ERRORS",
  ADD_IMAGE_SOURCES = "ADD_IMAGE_SOURCES",
  ASSIGN_DESTINATION_IMAGE = "ASSIGN_DESTINATION_IMAGE",
  SAVE_OUTPUT_ITINERARY = "SAVE_OUTPUT_ITINERARY",
  SET_ITINERARY_TITLE = "SET_ITINERARY_TITLE",
  SET_ITINERARY_DESCRIPTION = "SET_ITINERARY_DESCRIPTION",
  SET_FOCUSED_DESTINATION = "SET_FOCUSED_DESTINATION",
  SHOW_NEARBY_POIS = "SHOW_NEARBY_POIS",
  FIND_NEARBY_POIS = "FIND_NEARBY_POIS",
  SET_NEARBY_POIS = "SET_NEARBY_POIS",
  GENERATE_OUTPUT_ITINERARY = "GENERATE_OUTPUT_ITINERARY"
}

export const addBaseItinerary = (itinerary: Destination[]) => {
  return {
    type: Actions.ADD_BASE_ITINERARY,
    itinerary
  };
};

export const parseCSVForBaseItinerary = (file: Blob) => {
  return {
    type: Actions.PARSE_CSV_FOR_BASE_ITINERARY,
    file
  };
};

/// Associate a property with a stop
export const addDestinationProperty = (stopId: string, key: string, value: any) => {
  return {
    type: Actions.ADD_DESTINATION_PROPERTY,
    id: stopId,
    key,
    value
  };
};

export const addDestinationPOI = (stopId: string, poi: POI) => {
  return {
    type: Actions.ADD_DESTINATION_POI,
    id: stopId,
    poi
  };
};

export const removeDestinationPOI = (stopId: string, poiId: string) => {
  return {
    type: Actions.REMOVE_DESTINATION_POI,
    id: stopId,
    poiId
  };
};

export const insertDestination = (destination: Destination, position: number) => {
  return {
    type: Actions.INSERT_DESTINATION,
    position,
    destination
  };
};

export const removeDestination = (id: string) => {
  return {
    type: Actions.REMOVE_DESTINATION,
    id
  };
};

export const addError = (error: string) => {
  return {
    type: Actions.ADD_ERROR,
    error
  };
};

export const addImageSources = (sources: string[]) => {
  return {
    type: Actions.ADD_IMAGE_SOURCES,
    sources
  };
};

export const assignDestinationImage = (id: string, imageURL: string) => {
  return {
    type: Actions.ASSIGN_DESTINATION_IMAGE,
    id,
    src: imageURL
  };
};

export const setItineraryTitle = (title: string) => {
  return {
    type: Actions.SET_ITINERARY_TITLE,
    title
  };
};

export const setItineraryDescription = (description: string) => {
  return {
    type: Actions.SET_ITINERARY_DESCRIPTION,
    description
  };
};

export const saveOutputItinerary = (itinerary: PublishedItinerary) => {
  return {
    type: Actions.SAVE_OUTPUT_ITINERARY,
    itinerary
  };
};

export const clearErrors = () => {
  return { type: Actions.CLEAR_ERRORS };
};

export const setFocusedDestination = (id: string, focused: boolean) => {
  return {
    type: Actions.SET_FOCUSED_DESTINATION,
    id,
    focused
  };
};

export const showNearbyPOIs = (show: boolean) => {
  return {
    type: Actions.SHOW_NEARBY_POIS,
    show
  };
};

export const setNearbyPOIs = (pois: any) => {
  return {
    type: Actions.SET_NEARBY_POIS,
    pois
  };
};

export const searchForPois = (tileset: string, lnglat: [number, number]) => {
  return {
    type: Actions.FIND_NEARBY_POIS,
    tileset,
    lnglat
  };
};

export const generateOutputItinerary = () => {
  return {
    type: Actions.GENERATE_OUTPUT_ITINERARY
  };
};
