import React, { PureComponent, Fragment } from "react";
import { DestinationWithProperties } from "../../authoring/data/AuthorState";

interface Props {
  stop: DestinationWithProperties;
}

export class DestinationDetails extends PureComponent<Props> {
  render() {
    const { title, description, imageURL, pois } = this.props.stop;
    const poiNames = pois.map(poi => poi.name)
    const poiList = poiNames.map((poi,index) => {
      return (
        <li key={index}>{poi}</li>
      )
    })
    const thingsToDo : string = (pois.length > 0 ? "Things to Do": "")
    return (
      <Fragment>
        <h2>{title}</h2>
        {imageURL && <img src={imageURL} alt={title} />}
        {description && <p>{description}</p>} 
        {thingsToDo}
        <ul>{poiList}</ul>
      </Fragment>
    );
  }
}
