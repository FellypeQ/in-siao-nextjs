import { createTheme } from "@mui/material/styles"
import type { Shadows } from "@mui/material/styles"

// Gradiente oficial da marca
export const brandGradient =
  "linear-gradient(90deg, #FF6D00 0%, #FF8C1A 50%, #FFA94D 100%)"

// Tons principais da identidade visual
export const colors = {
  black: "#000000",
  white: "#FFFFFF",

  orangePrimary: "#FF6D00",
  orangeSecondary: "#FF8C1A",
  orangeLight: "#FFA94D",

  grayDark: "#1A1A1A",
  grayMedium: "#6B7280",
  grayLight: "#F9FAFB"
}

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.orangePrimary,
      contrastText: colors.white
    },

    secondary: {
      main: "#424242",
      contrastText: colors.white
    },

    background: {
      default: "#F9FAFB",
      paper: "#FFFFFF"
    },

    text: {
      primary: "#1A1A1A",
      secondary: "#6B7280"
    }
  },

  typography: {
    fontFamily: "Inter, sans-serif",

    h1: {
      fontWeight: 700,
      fontSize: "32px"
    },

    h2: {
      fontWeight: 700,
      fontSize: "24px"
    },

    body1: {
      fontWeight: 400,
      fontSize: "16px"
    },

    caption: {
      fontWeight: 500,
      fontSize: "12px",
      letterSpacing: "0.05em"
    },

    button: {
      fontWeight: 600,
      fontSize: "14px",
      textTransform: "uppercase"
    }
  },

  spacing: 8,

  shape: {
    borderRadius: 8
  },

  // MUI requires exactly 25 shadow entries (indices 0–24).
  // Indices 0–3 are custom; 4–24 use MUI defaults.
  shadows: [
    "none",
    "0 2px 4px rgba(0,0,0,0.05)",
    "0 4px 12px rgba(0,0,0,0.1)",
    "0 0 8px rgba(255,109,0,0.2)",
    "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
    "0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)",
    "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
    "0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)",
    "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
    "0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)",
    "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
    "0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)",
    "0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)",
    "0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)",
    "0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)",
    "0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)",
    "0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)",
    "0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)",
    "0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)",
    "0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)",
    "0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)",
    "0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)",
    "0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)",
    "0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)",
    "0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)"
  ] as Shadows,

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingLeft: 16,
          paddingRight: 16,
          fontWeight: 600
        },

        contained: {
          background: brandGradient,
          color: colors.white,
          "&:hover": {
            opacity: 0.9
          }
        }
      }
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.black
        }
      }
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.black,
          color: colors.white
        }
      }
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8
          }
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }
      }
    }
  }
})
