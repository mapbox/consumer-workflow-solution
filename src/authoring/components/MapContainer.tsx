import React, { PureComponent, Fragment } from "react";
import ReactDOM from "react-dom/server";
import mapboxgl, { GeoJSONSource, LngLatBounds } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Feature } from "geojson";
import { DestinationProperties } from "../data/AuthorState";
import { distance } from "@turf/turf";
import { remap } from "../../utility/math";
import { POI } from "../data/POI";
import { addEmptyGeoJSONSource } from "../../utility/addEmptyGeoJSONSource";
import { transformRequest } from "../../utility/transformRequest";

export interface Props {
  accessToken: string;
  paths: FeatureCollection;
  stops: FeatureCollection;
  pois: FeatureCollection | null;
  selectedPois: Feature[];
  itineraryBounds: LngLatBounds;
  onMapCreated?: (map: mapboxgl.Map) => any; // called when the map is constructed
  stopProperties: { [id: string]: DestinationProperties };
  focalPoint?: [number, number];
  centerOnFocalPoint: boolean;
  onPOISelected: (poi: POI) => void;
}

interface State {
  map?: mapboxgl.Map;
}

const ITINERARY_STOP_LAYER = "stop-layer";
const ITINERARY_STOP_SOURCE = "stop-source";
const ITINERARY_ROUTE_SOURCE = "route-source";
const ITINERARY_ROUTE_LAYER = "route-layer";
const SELECTED_POI_LAYER = "selected-poi-layer";
const POI_LABELS_LAYER = "poi-labels-layer";
const POI_SOURCE = "poi-source";
const SELECTED_POI_SOURCE = "selected-poi-source";

export class MapContainer extends PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
  mapContainer: React.RefObject<HTMLDivElement>;
  searchContainer: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    (mapboxgl as any).accessToken = props.accessToken;
    this.mapContainer = React.createRef();
    this.searchContainer = React.createRef();
    this.state = {};
  }

  componentDidMount() {
    this.initializeMap();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.updateMap(prevProps, prevState);
  }

  render() {
    const {
      accessToken,
      onMapCreated,
      stopProperties: _,
      itineraryBounds,
      centerOnFocalPoint,
      focalPoint,
      onPOISelected,
      selectedPois,
      ...props
    } = this.props;
    return (
      <Fragment>
        <div ref={this.mapContainer} {...props} />
        <div ref={this.searchContainer} />
      </Fragment>
    );
  }

  initializeMap() {
    const { onMapCreated } = this.props;
    const container = this.mapContainer.current;
    const searchContainer = this.searchContainer.current;
    if (container !== null && searchContainer !== null) {
      const map = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/light-v9",
        transformRequest
      });

      if (onMapCreated) {
        onMapCreated(map);
      }

      map.on("style.load", () => {
        // add empty sources to start, filled in by props later?
        addEmptyGeoJSONSource(map, ITINERARY_STOP_SOURCE);
        addEmptyGeoJSONSource(map, ITINERARY_ROUTE_SOURCE);
        addEmptyGeoJSONSource(map, POI_SOURCE);
        addEmptyGeoJSONSource(map, SELECTED_POI_SOURCE);

        // add layers rendering sources
        map.addLayer({
          id: ITINERARY_ROUTE_LAYER,
          type: "line",
          source: ITINERARY_ROUTE_SOURCE,
          paint: {
            "line-color": "#FFF",
            "line-dasharray": [4, 2],
            "line-width": 2
          }
        });

        map.addLayer({
          id: ITINERARY_STOP_LAYER,
          type: "circle",
          source: ITINERARY_STOP_SOURCE,
          paint: {
            "circle-color": "#469",
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 8, 10, 16],
            "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 4, 1, 10, 2],
            "circle-stroke-color": "#FFF"
          }
        });

        map.addLayer({
          id: POI_LABELS_LAYER,
          type: "symbol",
          source: POI_SOURCE,
          minzoom: 12,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-anchor": "top",
            "text-justify": "center",
            "text-font": ["literal", ["DIN Offc Pro Italic", "Arial Unicode MS Regular"]],
            "icon-image": "marker-11",
            "icon-anchor": "bottom",
            "icon-size": 1,
            "icon-allow-overlap": true,
            "text-allow-overlap": false
          } as any,
          paint: {
            // icon color doesn't seem to change anything
            "text-color": "#aaa"
          }
        });

        map.addLayer({
          id: SELECTED_POI_LAYER,
          type: "symbol",
          source: SELECTED_POI_SOURCE,
          minzoom: 12,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-anchor": "top",
            "text-justify": "center",
            "text-font": ["literal", ["DIN Offc Pro Italic", "Arial Unicode MS Regular"]],
            "icon-image": "marker-11",
            "icon-anchor": "bottom",
            "icon-size": 1,
            "icon-allow-overlap": true,
            "text-allow-overlap": true
          } as any,
          paint: {
            // icon color doesn't seem to change anything
            "text-color": "#000"
          }
        });

        this.setState({
          map
        });
      });
      this.setupEditGui(map);
      this.setupHoverInteraction(map);
    }
  }

  setupEditGui(map: mapboxgl.Map) {
    const { onPOISelected } = this.props;
    map.on("mousedown", POI_LABELS_LAYER, e => {
      const features = e.features;
      if (features) {
        const feature = features[0];
        onPOISelected({
          id: feature.id as any,
          name: feature.properties!.name,
          longitude: (feature.geometry as any).coordinates[0],
          latitude: (feature.geometry as any).coordinates[1]
        });
      }
    });
  }

  setupHoverInteraction(map: mapboxgl.Map) {
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.on("mouseenter", ITINERARY_STOP_LAYER, e => {
      const { stopProperties } = this.props;
      const feature: any = e.features![0];
      const coords = feature.geometry.coordinates.slice();
      const title = feature.properties.title;
      const url = stopProperties[feature.properties.id].imageURL;
      const content = ReactDOM.renderToStaticMarkup(
        <div>
          <p>{title}</p>
          {url && <img src={url} alt={title} />}
        </div>
      );

      popup
        .setLngLat(coords)
        .setHTML(content)
        .addTo(map);
    });

    map.on("mouseleave", ITINERARY_STOP_LAYER, e => {
      popup.remove();
    });
  }

  updateMap(prevProps: Props, prevState: State) {
    const { paths, stops, pois, selectedPois, itineraryBounds, centerOnFocalPoint, focalPoint } = this.props;
    const { map } = this.state;
    if (map) {
      const newMap = map !== prevState.map;
      if (paths !== prevProps.paths || newMap) {
        (map.getSource(ITINERARY_ROUTE_SOURCE) as GeoJSONSource).setData(paths);
      }
      if (stops !== prevProps.stops || newMap) {
        (map.getSource(ITINERARY_STOP_SOURCE) as GeoJSONSource).setData(stops);
      }
      let showPois = centerOnFocalPoint;
      if ((showPois && pois !== prevProps.pois) || newMap) {
        if (pois) {
          (map.getSource(POI_SOURCE) as GeoJSONSource).setData(pois);
        }
      }
      if (!showPois) {
        (map.getSource(POI_SOURCE) as GeoJSONSource).setData({ type: "FeatureCollection", features: [] });
      }

      if (selectedPois !== prevProps.selectedPois || newMap) {
        (map.getSource(SELECTED_POI_SOURCE) as GeoJSONSource).setData({
          type: "FeatureCollection",
          features: selectedPois
        });
      }

      // Map camera selection
      let frameLocation = centerOnFocalPoint;
      frameLocation =
        frameLocation && (focalPoint !== prevProps.focalPoint || centerOnFocalPoint !== prevProps.centerOnFocalPoint);
      if (frameLocation && focalPoint) {
        const { lng, lat } = map.getCenter();
        const delta = distance([lng, lat], focalPoint, { units: "kilometers" });
        const duration = remap(delta, 100, 2000, 800, 2500);
        map.flyTo({ center: focalPoint, zoom: 14, duration });
      }

      let frameItinerary = !centerOnFocalPoint && prevProps.centerOnFocalPoint;
      frameItinerary =
        frameItinerary || ((itineraryBounds !== prevProps.itineraryBounds || newMap) && !itineraryBounds.isEmpty());
      if (frameItinerary) {
        map.fitBounds(itineraryBounds, {
          easing: t => t * (2.0 - t),
          duration: 1000,
          padding: 35,
          maxZoom: 14
        });
      }
    }
  } // updateMap
} // class MapContainer

export default MapContainer;
