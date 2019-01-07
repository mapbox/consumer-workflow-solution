import React from "react";
import { Card } from "@material-ui/core";
import "./ImageChooser.css";

interface Props {
  imageURLs: string[];
  targetID: string;
  onChooseImage: (id: string, url: string) => void;
}

export class ImageChooser extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  render() {
    const { imageURLs, targetID, onChooseImage: onClick, ...props } = this.props;
    return (
      <Card className="image-chooser" {...props}>
        {imageURLs.map(url => {
          return <img className="choosable-image" key={url} src={url} onClick={() => onClick(targetID, url)} alt="" />;
        })}
      </Card>
    );
  }
}
