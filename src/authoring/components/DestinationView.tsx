import React, { PureComponent } from "react";
import Destination from "../data/Destination";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Input,
  InputLabel,
  FormGroup,
  Button,
  Modal,
  List,
  Typography,
  ListItem
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { DestinationProperties } from "../data/AuthorState";
import { ImageChooser } from "./ImageChooser";
import { ExpansionPanelProps } from "@material-ui/core/ExpansionPanel";
import { POI } from "../data/POI";
import "./DestinationView.css";

export interface ItineraryStopProps extends ExpansionPanelProps {
  stop: Destination;
  properties: DestinationProperties;
  onEdit: (id: string, key: string, value: any) => void;
  onChooseImage: (id: string, url: string) => void;
  onHighlightDestination: (id: string) => void;
  onRemoveDestination: (id: string) => void;
  imageURLs: string[];
}

interface State {
  imageChooserOpen: boolean;
}

export class ItineraryStopView extends PureComponent<ItineraryStopProps, State> {
  constructor(props: ItineraryStopProps) {
    super(props);
    this.state = {
      imageChooserOpen: false
    };
  }
  openImageChooser = () => {
    this.setState({ imageChooserOpen: true });
  };
  render() {
    const {
      imageURLs,
      stop,
      properties,
      onEdit,
      onChooseImage,
      onHighlightDestination,
      onRemoveDestination,
      ...rest
    } = this.props;
    const { imageChooserOpen } = this.state;
    const value = properties.lengthOfStay || 1;
    const pois = properties.pois;
    return (
      <ExpansionPanel {...rest}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>{stop.title}</ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <FormGroup>
            <InputLabel htmlFor="description">Description</InputLabel>
            <Input
              name="description"
              type="text"
              value={properties.description}
              onChange={e => onEdit(stop.id, "description", e.target.value)}
            />
            <InputLabel className="left-label" htmlFor="value">
              Length of Stay (days)
            </InputLabel>
            <Input
              name="value"
              type="number"
              value={value}
              onChange={e => onEdit(stop.id, "lengthOfStay", e.target.value)}
            />
            {properties.imageURL ? (
              <img onClick={this.openImageChooser} src={properties.imageURL} width={"100%"} alt="" />
            ) : (
              <Button className="ui-button" variant="outlined" onClick={this.openImageChooser}>
                Add Image
              </Button>
            )}
            <Button className="ui-button" variant="outlined" onClick={() => onHighlightDestination(stop.id)}>
              Find Things Nearby
            </Button>
            {pois.length > 0 && (
              <React.Fragment>
                <Typography variant="subtitle1">Nearby points of interest:</Typography>
                <List>{pois.map(POIView)}</List>
              </React.Fragment>
            )}
            <Button className="ui-button" variant="outlined" onClick={() => onRemoveDestination(stop.id)}>
              Remove Destination
            </Button>
          </FormGroup>
          <Modal open={imageChooserOpen} onClose={() => this.setState({ imageChooserOpen: false })}>
            <ImageChooser onChooseImage={onChooseImage} targetID={stop.id} imageURLs={imageURLs} />
          </Modal>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

const POIView = (poi: POI) => {
  return (
    <ListItem key={poi.id} className="poi">
      {poi.name}
    </ListItem>
  );
};
