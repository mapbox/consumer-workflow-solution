import { createAuthorStore } from "./store";
import {
  addDestinationProperty,
  addBaseItinerary,
  addError,
  clearErrors,
  addImageSources,
  assignDestinationImage,
  setItineraryTitle,
  setItineraryDescription,
  insertDestination,
  addDestinationPOI,
  removeDestinationPOI,
  removeDestination,
  generateOutputItinerary
} from "../actions";
import Destination from "../data/Destination";
import { getDestinationPOIs } from "../selectors/destination";

jest.mock("mapbox-gl", () => {
  class LngLatBounds {
    extend() {}
  }
  class LngLat {}
  return {
    LngLat,
    LngLatBounds
  };
});

describe("Authoring Actions", () => {
  const store = createAuthorStore();

  test("default state is valid", () => {
    const state = store.getState();
    expect(state).toBeDefined();
  });

  test("adding a title", () => {
    const before = store.getState();
    expect(before).toHaveProperty("title", "");
    const title = "Special Title";
    store.dispatch(setItineraryTitle(title));
    const after = store.getState();
    expect(after).toHaveProperty("title", title);
  });

  test("adding a description", () => {
    const before = store.getState();
    expect(before).toHaveProperty("description", "");
    const description = "Description for Itinerary as a whole.";
    store.dispatch(setItineraryDescription(description));
    const after = store.getState();
    expect(after).toHaveProperty("description", description);
  });

  test("a complete itinerary can be loaded", () => {
    const a: Destination = { id: "1a", title: "1", latitude: 0, longitude: 0 };
    const b: Destination = { id: "2b", title: "2", latitude: 0, longitude: 0 };
    const c: Destination = { id: "3c", title: "3", latitude: 0, longitude: 0 };
    store.dispatch(addBaseItinerary([a, b, c]));
    const state = store.getState();
    expect(state.itinerarySequence).toEqual(["1a", "2b", "3c"]);
    expect(state.itineraryDestinations).toEqual({ "1a": a, "2b": b, "3c": c });
  });

  test("a single destination can be added", () => {
    const id = "test";
    const stop: Destination = { id, title: "solo destination", latitude: 10, longitude: -10 };
    const position = 1;
    store.dispatch(insertDestination(stop, position));
    const state = store.getState();
    expect(state.itinerarySequence).toContain("test");
    expect(state.itinerarySequence.indexOf("test")).toBe(position);
    expect(state.itineraryDestinations[id]).toEqual(stop);
    expect(state.itineraryDestinationProperties[id]).toBeDefined();
  });

  test("a destination can be removed", () => {
    const id = "removable";
    const stop: Destination = { id, title: "some place", latitude: 5, longitude: 10 };
    const position = 1;
    store.dispatch(insertDestination(stop, position));
    const withStop = store.getState();
    expect(withStop.itinerarySequence).toContain(id);
    expect(withStop.itineraryDestinations[id]).toEqual(stop);

    store.dispatch(removeDestination(id));
    const stopRemoved = store.getState();
    expect(stopRemoved.itinerarySequence).not.toContain(id);
    expect(stopRemoved.itineraryDestinations[id]).toBeUndefined();
  });

  describe("error reporting", () => {
    test("reporting an error to the user", () => {
      store.dispatch(addError("message"));
      const state = store.getState();
      expect(state.error).toBe("message");
    });

    test("clearing error", () => {
      store.dispatch(addError("message"));
      store.dispatch(clearErrors());
      const state = store.getState();
      expect(state.error).toBe(undefined);
    });
  });

  describe("adding information about an itinerary stop", () => {
    test("adding a string property", () => {
      const id = "2";
      store.dispatch(addDestinationProperty(id, "hello", "there"));
      const state = store.getState();
      expect(state.itineraryDestinationProperties[id]).toHaveProperty("hello", "there");
    });

    test("adding a numeric property", () => {
      // e.g., the day of the trip; length of stay
      const id = "3";
      store.dispatch(addDestinationProperty(id, "number", 5));
      const state = store.getState();
      expect(state.itineraryDestinationProperties[id]).toHaveProperty("number", 5);
    });

    test("adding an array property", () => {
      // e.g. nearby things like restaurants or attractions
      const id = "1";
      const arr = [1, 2, 3];
      store.dispatch(addDestinationProperty(id, "array", arr));
      const state = store.getState();
      expect(state.itineraryDestinationProperties[id]).toHaveProperty("array", arr);
      // reference values are copied to avoid mutability problems
      expect(state.itineraryDestinationProperties[id]["array"]).not.toBe(arr);
    });
    test("adding an object property (not recommended)", () => {
      // e.g. nearby things like restaurants or attractions
      const id = "1";
      const obj = { a: "1", b: "2", c: "3" };
      store.dispatch(addDestinationProperty(id, "object", obj));
      const state = store.getState();
      expect(state.itineraryDestinationProperties[id]).toHaveProperty("object", obj);
      // reference values are copied to avoid mutability problems
      expect(state.itineraryDestinationProperties[id]["object"]).not.toBe(obj);
    });
  });

  describe("image usage", () => {
    test("adding image sources stores the given array", () => {
      const images = ["a.jpg", "b.jpg"];
      store.dispatch(addImageSources(images));
      const withImages = store.getState();
      expect(withImages.imageSources).toEqual(images);
    });

    test("logs an error when attempting to associate an image with a missing stop", () => {
      const state = store.getState();
      expect(state.itinerarySequence).not.toContain("nonexistant_stop");
      global.console.warn = jest.fn();
      store.dispatch(assignDestinationImage("nonexistant_stop", "a.jpg"));
      expect(console.warn).toBeCalledWith("No stop properties found for id: nonexistant_stop");
    });

    test("associating an image with a stop", () => {
      store.dispatch(assignDestinationImage("1a", "a.jpg"));
      const withAssociation = store.getState();
      expect(withAssociation.itineraryDestinationProperties["1a"].imageURL).toBe("a.jpg");
    });
  });

  describe("pois", () => {
    const poi = { id: "12345", longitude: 10, latitude: 5, name: "test-poi" };
    const stopId = "1a";
    test("adding a poi to a stop", () => {
      store.dispatch(addDestinationPOI(stopId, poi));
      const state = store.getState();
      expect(getDestinationPOIs(state, stopId)).toHaveLength(1);
      expect(getDestinationPOIs(state, stopId)).toContainEqual(poi);
    });
    test("removing a poi from a stop", () => {
      const state = store.getState();
      expect(getDestinationPOIs(state, stopId)).toHaveLength(1);
      store.dispatch(removeDestinationPOI(stopId, poi.id));
      expect(getDestinationPOIs(store.getState(), stopId)).toHaveLength(0);
    });
  });

  describe("publishing an itinerary", () => {
    const a: Destination = { id: "1a", title: "1", latitude: 0, longitude: 0 };
    const b: Destination = { id: "2b", title: "2", latitude: 0, longitude: 0 };
    const c: Destination = { id: "3c", title: "3", latitude: 0, longitude: 0 };
    store.dispatch(addBaseItinerary([a, b, c]));
    store.dispatch(generateOutputItinerary());

    const state = store.getState();

    test("it stores an output itinerary", () => {
      expect(state.output).toBeDefined();
    });

    test("it includes the title and description of the itinerary", () => {
      expect(state.output).toHaveProperty("title", state.title);
      expect(state.output).toHaveProperty("description", state.description);
    });

    test("it stores stops with their associated metadata", () => {
      const stops = state.output!.stops;

      expect(stops["1a"]).not.toEqual(a);
      let { id, title, latitude, longitude, pois, lengthOfStay } = stops["1a"];
      expect({ id, title, latitude, longitude }).toEqual(a);
      expect(lengthOfStay).toBeDefined();
      expect(pois).toBeDefined();
    });

    test("it generates GeoJSON lines for the route between each stop", () => {
      expect(state.output).toHaveProperty("paths");
      expect(state.output!.paths!.features).toHaveLength(2);
    });

    test("it generates GeoJSON points for each stop with metadata", () => {
      expect(state.output).toHaveProperty("points");
      expect(state.output!.points!.features).toHaveLength(3);
    });
  });
});
