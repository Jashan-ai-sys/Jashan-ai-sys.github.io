import * as React from "react";
import ReactDOM from "react-dom/client";

import App from "./app";

import "./index.css";

const rootEl = document.getElementById("root");

// Render react app
ReactDOM.createRoot(rootEl!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
