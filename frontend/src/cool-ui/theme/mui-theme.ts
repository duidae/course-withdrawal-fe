import { createTheme } from "@mui/material/styles";
import palette from "./mui-theme.module.scss";

// You need to make sure that the typings for the theme's typography variants and the Typography's variant prop reflects the new set of variants.
declare module "@mui/material/styles" {
  interface TypographyVariants {
    highlight: React.CSSProperties;
    critical: React.CSSProperties;
    warning: React.CSSProperties;
    caution: React.CSSProperties;
    success: React.CSSProperties;
    disabled: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    highlight?: React.CSSProperties;
    critical?: React.CSSProperties;
    warning?: React.CSSProperties;
    caution?: React.CSSProperties;
    success?: React.CSSProperties;
    disabled?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    highlight: true;
    critical: true;
    warning: true;
    caution: true;
    success: true;
    disabled: true;
  }
}

const fontWeights: Record<string, number> = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
};

export let theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          boxShadow: theme.shadows[3],
          color: palette.textPrimaryColor,
          backgroundColor: palette.whiteColor,
          fontSize: theme.typography.body1.fontSize,
          fontWeight: theme.typography.body1.fontWeight,
        }),
      },
      defaultProps: {
        placement: "bottom-start",
        slotProps: {
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -12],
                },
              },
            ],
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${palette.grey300Color}`,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: palette.grey700Color,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: palette.grey700Color,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 30,
          width: "300px",
          borderRadius: 5,
        },
        colorPrimary: {
          backgroundColor: palette.grey100Color,
        },
        bar: {
          backgroundColor: palette.primaryMainColor,
        },
      },
    },
  },
  palette: {
    primary: {
      main: palette.primaryMainColor,
      light: palette.primaryLightColor,
      dark: palette.primaryDarkColor,
      contrastText: palette.primaryContrastTextColor,
    },
    secondary: {
      main: palette.secondaryMainColor,
      light: palette.secondaryLightColor,
      dark: palette.secondaryDarkColor,
      contrastText: palette.secondaryContrastTextColor,
    },
    error: {
      main: palette.errorMainColor,
      light: palette.errorLightColor,
      dark: palette.errorDarkColor,
      contrastText: palette.errorContrastTextColor,
    },
    warning: {
      main: palette.warningMainColor,
      light: palette.warningLightColor,
      dark: palette.warningDarkColor,
      contrastText: palette.warningContrastTextColor,
    },
    success: {
      main: palette.successMainColor,
      light: palette.successLightColor,
      dark: palette.successDarkColor,
      contrastText: palette.successContrastTextColor,
    },
    info: {
      main: palette.infoMainColor,
      light: palette.infoLightColor,
      dark: palette.infoDarkColor,
      contrastText: palette.infoContrastTextColor,
    },
    text: {
      primary: palette.textPrimaryColor,
      secondary: palette.textSecondaryColor,
      disabled: palette.textDisabledColor,
    },
    divider: palette.dividerColor,
  },
  typography: {
    // NOTE: font color is configured in src/theme/font.css
    fontFamily: [
      "Roboto",
      "Helvetica",
      "Arial",
      '"Microsoft JhengHei"',
      "Ubuntu",
      "sans-serif",
    ].join(","),
    fontSize: 16,
    htmlFontSize: 16,
    h1: {
      fontWeight: fontWeights.regular,
      fontSize: "2rem",
    },
    h2: {
      fontWeight: fontWeights.regular,
      fontSize: "1.75rem",
    },
    h3: {
      fontWeight: fontWeights.regular,
      fontSize: "1.5rem",
    },
    h4: {
      fontWeight: fontWeights.regular,
      fontSize: "1.25rem",
    },
    h5: {
      fontWeight: fontWeights.regular,
      fontSize: "1.125rem",
    },
    h6: {
      fontWeight: fontWeights.bold,
      fontSize: "1rem",
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: fontWeights.regular,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: fontWeights.medium,
    },
    button: {
      fontWeight: fontWeights.regular,
      fontSize: "1rem",
      textTransform: "none",
    },
    body1: {
      fontWeight: fontWeights.regular,
      fontSize: "1rem",
    },
    body2: {
      fontWeight: fontWeights.regular,
      fontSize: "0.875rem",
    },
    caption: {
      fontWeight: fontWeights.regular,
      fontSize: "0.75rem",
    },
    overline: {
      fontWeight: fontWeights.regular,
    },
  },
});

theme = createTheme(theme, {
  typography: {
    highlight: {
      ...theme.typography.body1,
      fontWeight: fontWeights.bold,
      color: palette.secondaryMainColor,
    },
    critical: {
      ...theme.typography.body1,
      fontWeight: fontWeights.bold,
      color: palette.errorDarkColor,
    },
    warning: {
      ...theme.typography.body1,
      color: palette.errorMainColor,
    },
    caution: {
      ...theme.typography.body1,
      color: palette.warningDarkColor,
    },
    success: {
      ...theme.typography.body1,
      color: palette.successMainColor,
    },
    disabled: {
      ...theme.typography.body1,
      color: palette.textDisabledColor,
    },
  },
});
