"use client"

import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import type { ReactNode } from "react"

/**
 * Theme oficial do projeto In-Sião
 * Baseado na identidade visual da Igreja Batista Sião
 *
 * Cores principais:
 * - Preto
 * - Branco
 * - Laranja (degradê)
 */

// Gradiente oficial da marca
export const brandGradient =
  "linear-gradient(90deg, #FF6A00 0%, #FF8C1A 50%, #FFA94D 100%)"

// Tons principais extraídos do logo
export const colors = {
  black: "#000000",
  white: "#FFFFFF",

  orangePrimary: "#FF6A00",
  orangeSecondary: "#FF8C1A",
  orangeLight: "#FFA94D",

  grayDark: "#1A1A1A",
  grayMedium: "#666666",
  grayLight: "#F5F5F5"
}

export const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: colors.orangePrimary,
      contrastText: colors.white
    },

    secondary: {
      main: colors.black,
      contrastText: colors.white
    },

    background: {
      default: colors.white,
      paper: colors.white
    },

    text: {
      primary: colors.black,
      secondary: colors.grayMedium
    },

    divider: colors.grayLight
  },

  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif"
    ].join(","),

    h1: {
      fontWeight: 700
    },

    h2: {
      fontWeight: 700
    },

    h3: {
      fontWeight: 600
    },

    button: {
      textTransform: "none",
      fontWeight: 600
    }
  },

  shape: {
    borderRadius: 10
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
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
            borderRadius: 10
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

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
