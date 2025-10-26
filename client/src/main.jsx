import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// imports the styles
import "./index.css";
import "./App.css";

// main component
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);