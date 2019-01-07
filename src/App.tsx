import React, { Component } from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { ConnectedAuthoring } from "./authoring/components/ConnectedAuthoring";
import { createAuthorStore } from "./authoring/reducers/store";
import { ConnectedDisplay } from "./display/components/ConnectedDisplay";
import { Provider } from "react-redux";

const authorStore = createAuthorStore();

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Provider store={authorStore}>
          <Switch>
            <Redirect exact from="/" to="/authoring" />
            <Route path="/authoring">
              <ConnectedAuthoring />
            </Route>
            <Route path="/display">
              <ConnectedDisplay />
            </Route>
          </Switch>
        </Provider>
      </HashRouter>
    );
  }
}

export default App;
