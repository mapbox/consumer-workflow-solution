import React, { PureComponent, Fragment } from "react";
import {
  createMuiTheme,
  Paper,
  Typography,
  List,
  ListSubheader,
  Button,
  Snackbar,
  SnackbarContent,
  FormGroup,
  InputLabel,
  Input
} from "@material-ui/core";
import mapboxgl, { LngLatBounds } from "mapbox-gl";
import { ItineraryStopView } from "./DestinationView";
import MapContainer from "./MapContainer";
import Destination from "../data/Destination";
import AuthorState from "../data/AuthorState";
import { Redirect } from "react-router-dom";
import { FeatureCollection } from "@turf/turf";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./authoring.css";
import debounce from "lodash.debounce";
import { POI } from "../data/POI";
import defaultItinerary from "../data/defaultItinerary.json";
import { ThemeProvider } from "@material-ui/styles";

export interface Props extends AuthorState {
  clearErrors: () => void;
  addError: (_: string) => void;
  addBaseItinerary: (stops: Destination[]) => void;
  addDestinationProperty: (id: string, key: string, value: any) => void;
  addImageSources: (sources: string[]) => void;
  addDestinationImage: (id: string, url: string) => void;
  publishItinerary: () => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  addDestination: (destination: Destination, position: number) => void;
  onRemoveDestination: (id: string) => void;
  focusDestination: (id: string, focused: boolean) => void;
  showNearby: (show: boolean) => void;
  addPOI: (stopId: string, poi: POI) => void;
  removePOI: (stopId: string, poiId: string) => void;
  searchNearby: (tileset: string, lnglat: [number, number]) => void;
  parseCSVForBaseItinerary: (file: Blob) => void;
  geoJSONItinerary: { bounds: LngLatBounds; paths: FeatureCollection; stops: FeatureCollection };
  focalPoint?: [number, number];
}

interface State {
  redirectToDisplay: boolean;
  map?: mapboxgl.Map;
}

const theme = createMuiTheme({});

/// Controller component for authoring behavior.
/// Connected to Redux actions for UI and data loading actions.
export class AuthoringComponent extends PureComponent<Props, State> {
  mapContainer: React.RefObject<HTMLDivElement>;
  searchContainer: React.RefObject<HTMLDivElement>;
  csvInput: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    this.mapContainer = React.createRef();
    this.csvInput = React.createRef();
    this.searchContainer = React.createRef();

    this.state = {
      redirectToDisplay: false
    };
    this.loadImages();
    this.loadDefaultItinerary();
  }

  async loadImages() {
    const host = "https://static-assets.mapbox.com/demos/travel/";
    const json = require("../data/list.json");
    this.props.addImageSources(json.map((node: any) => host + node.filename));
  }

  loadDefaultItinerary() {
    this.props.addBaseItinerary(defaultItinerary);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { map } = this.state;
    if (map !== prevState.map) {
      const searchContainer = this.searchContainer.current;
      if (searchContainer) {
        const geocoder = new MapboxGeocoder({
          accessToken: process.env.REACT_APP_MAPBOX_API_KEY,
          mapboxgl,
          marker: false
        });

        while (searchContainer.firstChild) {
          searchContainer.removeChild(searchContainer.firstChild);
        }

        // associate geocoder with map and get its HTML element
        const element = geocoder.onAdd(map);
        searchContainer.appendChild(element);

        const { addDestination } = this.props;
        geocoder.on("result", ({ result }) => {
          geocoder.clear();
          addDestination(
            { id: result.id, title: result.text, longitude: result.center[0], latitude: result.center[1] },
            this.props.itinerarySequence.length
          );
        });

        if (map) {
          const moveHandler = () => {
            const { doShowNearby: showNearby, searchNearby } = this.props;
            const { lng, lat } = map.getCenter();
            geocoder.setProximity([lng || 0.1, lat || 0.1]);
            if (showNearby) {
              // specify the source of local data you want to search within
              // the tileset can be your own data source uploaded in studio
              const TILESET = "mapbox.mapbox-streets-v8";
              const { lng, lat } = map.getCenter();
              searchNearby(TILESET, [lng, lat]);
            }
          };
          const debouncedMoveHandler = debounce(moveHandler, 250);
          map.on("move", debouncedMoveHandler);
        }
      }
    }
  }

  render() {
    const {
      error,
      itineraryDestinations: itineraryStops,
      itinerarySequence,
      imageSources,
      clearErrors,
      // eslint-disable-next-line
      addDestination: _,
      parseCSVForBaseItinerary: dispatchParseCSVForBaseItinerary,
      onRemoveDestination,
      itineraryDestinationProperties: stopProperties,
      addDestinationProperty: addStopProperty,
      focusedDestinationID,
      addDestinationImage: assignStopImage,
      publishItinerary,
      output,
      geoJSONItinerary,
      title,
      description,
      setTitle,
      setDescription,
      focusDestination,
      showNearby: dispatchShowNearby,
      addPOI,
      removePOI,
      doShowNearby: showNearby,
      nearbyPOIs,
      selectedPOIs,
      focalPoint
    } = this.props;
    if (this.state.redirectToDisplay) {
      return <Redirect push={true} to="/display" />;
    }

    return (
      <Fragment>
        <MapContainer
          accessToken={process.env.REACT_APP_MAPBOX_API_KEY!}
          itineraryBounds={geoJSONItinerary.bounds}
          paths={geoJSONItinerary.paths as any}
          stops={geoJSONItinerary.stops as any}
          stopProperties={stopProperties}
          onMapCreated={map => this.onMapCreated(map)}
          centerOnFocalPoint={showNearby}
          focalPoint={focalPoint}
          pois={nearbyPOIs}
          selectedPois={selectedPOIs}
          onPOISelected={(poi: POI) => {
            const props = this.props.itineraryDestinationProperties[this.props.focusedDestinationID];
            if (props.pois.find(obj => obj.id === poi.id)) {
              removePOI(this.props.focusedDestinationID, poi.id);
            } else {
              addPOI(this.props.focusedDestinationID, poi);
            }
          }}
          className="map-container fullscreen"
        />
        <ThemeProvider theme={theme}>
          <Paper className="menu">
            <Typography variant="h4">Itinerary Builder</Typography>
            <FormGroup className="section">
              <InputLabel htmlFor="itinerary-title">Title</InputLabel>
              <Input name="itinerary-title" type="text" value={title} onChange={e => setTitle(e.target.value)} />
              <InputLabel htmlFor="itinerary-description">Description</InputLabel>
              <Input
                name="itinerary-description"
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </FormGroup>
            <FormGroup className="section">
              {itinerarySequence.length > 0 && (
                <List>
                  <ListSubheader>Destinations</ListSubheader>
                  {itinerarySequence.map(id => {
                    const stop = itineraryStops[id];
                    const properties = stopProperties[id];
                    return (
                      <ItineraryStopView
                        key={stop.id}
                        stop={stop}
                        properties={properties}
                        onEdit={addStopProperty}
                        onChooseImage={assignStopImage}
                        imageURLs={imageSources}
                        onRemoveDestination={onRemoveDestination}
                        onHighlightDestination={id => {
                          dispatchShowNearby(true);
                        }}
                        expanded={focusedDestinationID === stop.id}
                        onChange={(_, focused) => focusDestination(stop.id, focused)}
                      />
                    );
                  })}
                </List>
              )}
              <InputLabel htmlFor="search">Add a destination</InputLabel>
              <div className="search-container" ref={this.searchContainer} />
            </FormGroup>
            <FormGroup className="section">
              <Button
                onClick={_ => {
                  const input = this.csvInput.current;
                  if (input) {
                    return input.click();
                  }
                }}
              >
                <input
                  ref={this.csvInput}
                  type="file"
                  value=""
                  accept="text/csv"
                  onChange={event => {
                    const files = event.target.files;
                    if (files && files.length > 0) {
                      dispatchParseCSVForBaseItinerary(files[0]);
                    }
                  }}
                  hidden
                />
                Load Itinerary CSV
              </Button>
              {itinerarySequence.length > 0 && <Button onClick={publishItinerary}>Publish Itinerary</Button>}
              {output && (
                <Button onClick={() => this.setState({ redirectToDisplay: true })}>Go To Itinerary Display</Button>
              )}
            </FormGroup>
          </Paper>
          <Snackbar open={Boolean(error)} onClose={clearErrors} autoHideDuration={5000}>
            <SnackbarContent message={<span>{error}</span>} />
          </Snackbar>
        </ThemeProvider>
      </Fragment>
    );
  }

  onMapCreated(map: mapboxgl.Map) {
    this.setState({ map });
  }
}
