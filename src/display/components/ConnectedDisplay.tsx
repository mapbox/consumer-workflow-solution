import DisplayComponent from "./Display";
import { connect } from "react-redux";
import AuthorState from "../../authoring/data/AuthorState";

export const ConnectedDisplay = connect((state: AuthorState) => {
  return { trip: state.output };
})(DisplayComponent);
