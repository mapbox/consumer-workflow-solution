# Consumer Workflows: Itinerary Builder

This repo contains the source code for the Mapbox Itinerary Builder. The core use-case is a fictional travel company looking to build an application for planning a vaction. This solution includes the following type of functionality:

1. Authoring environment for building the itinerary and adding custom metadata like points of interest, descriptions, and imagery.
2. Maps for visualizing stops and points-of-interest
3. Geocoding from CSV to plot the draft itinerary
4. Search for points-of-interest, powered by Mapbox Tilequery API
5. Display enviroment for publishing the completed itinerary

This workflow contains sample data, but individual datasets can be dragged into the **Authoring** environment and edited at will.

This workflow generates an interactive website with the completed itinerary, but this can be adapted to upload to external storage (such as S3 or any database) or generate a static image for print.

## Organization

This project has two main sections:

[**Authoring**](src/authoring/components/Authoring.tsx). The authoring page presents a user interface for adding data to a map.

[**Display**](src/display/components/Display.tsx). The display page shows the "published" data on a map with basic user interactions.

### Author Experience

When a user updates source data (via CSV) or metadata (in Authoring Environment), this dispatches events. These events can be tracked via the [Redux dev tools](https://github.com/reduxjs/redux-devtools).

Async updates, such as geocoding and file loading, are handled through [Sagas](https://redux-saga.js.org/).

Once the data has been updated, it can be exported into the **Display** environment. This is also handled via an event that populates the `output` object in Redux.

### Display Experience

Once `output` is populated, the `/display` route becomes available. This will render your published itinerary in a more shareable static format.

## Building and running

To use Mapbox services, you need to set your access token. You can get an access token from your [Mapbox account](https://account.mapbox.com/). If you don't have an account yet, you can sign up and get started for free.

Once you have copied your token, you must set it in your environment. There are a number of ways to do this:

1) Set the value of the `REACT_APP_MAPBOX_API_KEY` variable in [.env](./.env).
2) Set the value of `REACT_APP_MAPBOX_API_KEY` as an environment variable in your terminal.

Once your token is set:

```bash
yarn install
yarn start
```

This solution was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Please consult that project's documentation specific questions related to code organization, scripts, and deployments.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits. You will also see any lint errors in the console.

### `yarn run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.

For deployment to hosting providers, please see the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
