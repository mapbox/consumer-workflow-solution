import { AuthoringComponent, Props } from "./Authoring";
import { connect } from "react-redux";
import * as Actions from "../actions";
import { getGeoJSONRoutes } from "../selectors/getGeoJSONRoutes";
import { getFocusedDestinationLocation } from "../selectors/getFocusedDestinationLocation";
import AuthorState from "../data/AuthorState";

/// turn redux store values into props
const mapStateToProps = (state: AuthorState) => {
  return {
    geoJSONItinerary: getGeoJSONRoutes(state),
    focalPoint: getFocusedDestinationLocation(state),
    ...state
  };
};

const mappedDispatchers: Partial<Props> = {
  addError: Actions.addError,
  clearErrors: Actions.clearErrors,
  addBaseItinerary: Actions.addBaseItinerary,
  addDestinationProperty: Actions.addDestinationProperty,
  addImageSources: Actions.addImageSources,
  addDestinationImage: Actions.assignDestinationImage,
  addDestination: Actions.insertDestination,
  onRemoveDestination: Actions.removeDestination,
  publishItinerary: Actions.generateOutputItinerary,
  setTitle: Actions.setItineraryTitle,
  setDescription: Actions.setItineraryDescription,
  focusDestination: Actions.setFocusedDestination,
  showNearby: Actions.showNearbyPOIs,
  searchNearby: Actions.searchForPois,
  addPOI: Actions.addDestinationPOI,
  removePOI: Actions.removeDestinationPOI,
  parseCSVForBaseItinerary: Actions.parseCSVForBaseItinerary
};

export const ConnectedAuthoring = connect(
  mapStateToProps,
  mappedDispatchers
)(AuthoringComponent as any);
