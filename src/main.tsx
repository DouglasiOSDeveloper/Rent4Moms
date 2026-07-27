import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App";
import { installGlobalErrorReporting } from "./services/observability/errorReporter";
import "./styles/index.css";

installGlobalErrorReporting();

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={routerBasename}>
    <App />
  </BrowserRouter>,
);
