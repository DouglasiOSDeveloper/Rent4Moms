import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App";
import { installGlobalErrorReporting } from "./services/observability/errorReporter";
import "./styles/index.css";

installGlobalErrorReporting();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
