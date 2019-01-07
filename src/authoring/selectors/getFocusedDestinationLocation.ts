import { createSelector } from "reselect";
import AuthorState from "../data/AuthorState";
import Destination from "../data/Destination";

export const getFocusedDestinationLocation = createSelector(
  [(state: AuthorState) => state.focusedDestinationID, (state: AuthorState) => state.itineraryDestinations],
  (id, stops) => {
    const stop: Destination = stops[id];
    if (stop) {
      return [stop.longitude, stop.latitude];
    }
    return undefined;
  }
);
