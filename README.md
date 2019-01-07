# Consumer Workflows Solution

This project has two main components: [Authoring](src/authoring/components/Authoring.tsx) and [Display](src/display/components/Display.tsx).

Asynchronous behavior like geocoding and file loading is handled through [Sagas](https://redux-saga.js.org/).

You can read more about the motivation behind this example in the related [Blog Post](https://blog.mapbox.com/friendly-workflows-for-creating-maps-da97cf825c79).

# Create-React-App Generated Info

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
