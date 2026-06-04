import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store.js";
import App from "./App.jsx";
import "./index.css";

// The application entry point. Three things happen here:
//
//   1. React 18+ root API: createRoot replaces the older ReactDOM.render and
//      enables concurrent rendering features.
//
//   2. <Provider store={store}> from react-redux wraps the entire app and makes
//      the Redux store available to every component below via React Context.
//      Without this wrapper, useSelector and useDispatch would throw.
//
//   3. <React.StrictMode> turns on development-only checks (double-invocation of
//      reducers and effects, deprecation warnings, etc.). It has no effect in
//      production builds.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
