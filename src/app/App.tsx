import React from "react";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";
import { ErrorBoundary } from "./ErrorBoundary";
import { RouteEffects } from "./RouteEffects";

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouteEffects />
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}
