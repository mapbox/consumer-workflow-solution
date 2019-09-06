import React, { PureComponent, Fragment } from "react";
import { DestinationWithProperties } from "../../authoring/data/AuthorState";

interface Props {
  stop: DestinationWithProperties;
}

export class DestinationDetails extends PureComponent<Props> {
  render() {
    const { title, description, imageURL, pois } = this.props.stop;
    const poiList = pois.map((poi, index) => {
      return <li key={index}>{poi.name}</li>;
    });
    return (
      <Fragment>
        <h2>{title}</h2>
        {imageURL && <img src={imageURL} alt={title} />}
        {description && <p>{description}</p>}
        {poiList.length > 0 && (
          <Fragment>
            <h3>Things to Do</h3>
            <ul>{poiList}</ul>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
