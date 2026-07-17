import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { withIntl } from "./translations/withIntl";
import { withTheme } from "./cool-ui/theme/withTheme";
import { ErrorBoundary } from "./cool-ui/components/error-boundary/ErrorBoundary";

import { App } from "./App";

let Application: React.ComponentType = App;
Application = withIntl(Application);
Application = withTheme(Application);

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Application />
    </ErrorBoundary>
  </React.StrictMode>,
);
