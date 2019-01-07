import React, { PureComponent } from "react";
import { DestinationSidebarView } from "./DestinationSidebarView";
import { DisplayMapContainer } from "./DisplayMapContainer";
import "./display.css";
import { PublishedItinerary } from "../../authoring/data/PublishedItinerary";
import { DestinationDetails } from "./DestinationDetails";

interface Props {
  trip: PublishedItinerary | undefined;
}

interface State {
  focusedStopID: string | null;
}

export default class DisplayComponent extends PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      focusedStopID: null
    };
  }
  render() {
    const { trip } = this.props;
    if (trip) {
      const { description, sequence, stops, title, paths, points } = trip;
      const { focusedStopID } = this.state;

      return (
        <div className="page">
          <h1>{title}</h1>
          <p>{description}</p>
          <DisplayMapContainer
            focusedStop={focusedStopID ? stops[focusedStopID] : null}
            setFocus={this.setFocus}
            className="map"
            accessToken={process.env.REACT_APP_MAPBOX_API_KEY!}
            paths={paths}
            points={points}
          />
          <section className="sidebar">
            <section className="stops">
              {sequence.map(id => {
                const stop = stops[id];
                const focused = id === focusedStopID;
                return (
                  <DestinationSidebarView
                    key={stop.id}
                    focused={focused}
                    name={stop.title}
                    onClick={() => {
                      if (focusedStopID === id) {
                        this.setFocus(null);
                      } else {
                        this.setFocus(id);
                      }
                    }}
                  />
                );
              })}
            </section>
            <section>{focusedStopID && <DestinationDetails stop={stops[focusedStopID]} />}</section>
          </section>
        </div>
      );
    }
    return <h1>No trip itinerary given</h1>;
  }

  setFocus = (id: string | null) => {
    if (id) {
      this.setState({ focusedStopID: id });
    } else {
      this.setState({ focusedStopID: null });
    }
  };
}
