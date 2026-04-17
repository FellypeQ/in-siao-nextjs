"use client"

import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { Suspense, type ReactNode } from "react"

import { GlobalLoadingBar } from "@/frontend/components/feedback/global-loading-bar"
import { theme, colors, brandGradient } from "@/lib/theme"

export { theme, colors, brandGradient }

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={null}>
        <GlobalLoadingBar />
      </Suspense>
      {children}
    </ThemeProvider>
  )
}
