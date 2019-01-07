import React, { PureComponent, Fragment } from "react";
import { DestinationWithProperties } from "../../authoring/data/AuthorState";

interface Props {
  stop: DestinationWithProperties;
}

export class DestinationDetails extends PureComponent<Props> {
  render() {
    const { title, description, imageURL } = this.props.stop;
    return (
      <Fragment>
        <h2>{title}</h2>
        {imageURL && <img src={imageURL} alt={title} />}
        {description && <p>{description}</p>}
      </Fragment>
    );
  }
}
