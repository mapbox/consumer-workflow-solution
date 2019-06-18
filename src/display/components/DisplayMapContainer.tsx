import React, { PureComponent, Fragment } from "react";
import ReactDOM from "react-dom/server";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, bbox } from "@turf/turf";
import { BBox2d } from "@turf/helpers/lib/geojson";
import { DestinationWithProperties } from "../../authoring/data/AuthorState";
import { transformRequest } from "../../utility/transformRequest";

interface Props {
  accessToken: string;
  paths: FeatureCollection;
  points: FeatureCollection;
  setFocus: (id: string | null) => void;
  focusedStop: DestinationWithProperties | null;
}

interface State {
  map?: mapboxgl.Map;
}

const ITINERARY_STOP_LAYER = "stop-layer";
const ITINERARY_STOP_SOURCE = "stop-source";
const ITINERARY_ROUTE_SOURCE = "route-source";
const ITINERARY_ROUTE_LAYER = "route-layer";

export class DisplayMapContainer extends PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
  mapContainer: React.RefObject<HTMLDivElement>;
  popup: mapboxgl.Popup;

  constructor(props: Props) {
    super(props);
    (mapboxgl as any).accessToken = props.accessToken;
    this.mapContainer = React.createRef();
    this.state = {};

    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
  }

  componentDidMount() {
    this.initializeMap();
  }

  componentDidUpdate(prevProps: Props) {
    const { focusedStop } = this.props;
    const { focusedStop: prevFocus } = prevProps;
    const { map } = this.state;
    if (map && focusedStop !== prevFocus) {
      if (focusedStop) {
        const coords = [focusedStop.longitude, focusedStop.latitude] as LngLatLike;
        const title = focusedStop.title;
        const url = focusedStop.imageURL;

        const content = ReactDOM.renderToStaticMarkup(
          <Fragment>
            <h2>{title}</h2>
            {url && <img src={url} alt={title} />}
          </Fragment>
        );
        this.popup
          .setLngLat(coords)
          .setHTML(content)
          .addTo(map);
      } else {
        this.popup.remove();
      }
    }
  }

  render() {
    const { accessToken, points, paths, setFocus, focusedStop, ...props } = this.props;
    return <div ref={this.mapContainer} {...props} />;
  }

  initializeMap() {
    const container = this.mapContainer.current;
    if (container !== null) {
      const map = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/light-v9",
        transformRequest
      });
      this.setupHoverInteraction(map);
      map.on("style.load", () => {
        const { points, paths } = this.props;

        map.addSource(ITINERARY_ROUTE_SOURCE, { type: "geojson", data: paths } as any);
        map.addSource(ITINERARY_STOP_SOURCE, { type: "geojson", data: points } as any);

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
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 6, 10, 32],
            "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 4, 1, 10, 2],
            "circle-stroke-color": "#FFF"
          }
        });

        // frame data
        const bounds = bbox(points) as BBox2d;
        map.fitBounds(bounds, {
          easing: t => t * (2.0 - t),
          duration: 0,
          padding: 35
        });

        this.setState({
          map
        });
      });
    }
  }

  setupHoverInteraction(map: mapboxgl.Map) {
    map.on("mouseenter", ITINERARY_STOP_LAYER, e => {
      const feature: any = e.features![0];
      const id = feature.properties.id;
      this.props.setFocus(id);
    });

    map.on("mouseleave", ITINERARY_STOP_LAYER, e => {
      this.props.setFocus(null);
    });
  }
}
