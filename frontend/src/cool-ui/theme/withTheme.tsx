import { type ComponentType } from "react";

import { theme } from "./mui-theme";
import { ThemeProvider } from "@mui/material/styles";

import "./font.scss";

export function withTheme<P extends object>(
  WrappedComponent: ComponentType<P>,
): ComponentType<P> {
  const ComponentWithTheme = (props: P) => {
    return (
      <ThemeProvider theme={theme}>
        <WrappedComponent {...props} />
      </ThemeProvider>
    );
  };

  return ComponentWithTheme;
}
