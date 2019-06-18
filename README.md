# Consumer Workflows Solution

This is a demonstration project showing how you can make tools with Mapbox that accelerate the authoring of map-based content for your website, print collateral, or other application. Feel free to fork it and turn it into a tool that suits your needs.

This project has two main sections: [Authoring](src/authoring/components/Authoring.tsx) and [Display](src/display/components/Display.tsx). The authoring page presents a user interface for adding data to a map. The display page shows the "published" data on a map with basic user interactions.

User actions change the application state by dispatching events. If you have the [Redux dev tools](https://github.com/reduxjs/redux-devtools) installed, you can see the actions and how they change the application state as they occur. Asynchronous behavior like geocoding and file loading is handled through [Sagas](https://redux-saga.js.org/).

You can read more about the motivation behind this example in the related [Blog Post](https://blog.mapbox.com/friendly-workflows-for-creating-maps-da97cf825c79).

# Building and running

Quick start:
```
$ export REACT_APP_MAPBOX_API_KEY={your access token}
$ yarn install
$ yarn start
```

To use Mapbox services, you need to set your access token. You can do this in a couple of ways:
1) Set the value of the `REACT_APP_MAPBOX_API_KEY` variable in [.env](./.env).
2) Set the value of `REACT_APP_MAPBOX_API_KEY` as an environment variable in your terminal.

You can get an access token from your [Mapbox account](https://account.mapbox.com/). If you don't have an account yet, you can sign up and get started for free.

After adding your token, run `yarn install` to add the project dependencies.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts (Thanks to create-react-app)

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
