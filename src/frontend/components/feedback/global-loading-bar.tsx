"use client"

import { Box, LinearProgress } from "@mui/material"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const START_PROGRESS = 10
const MAX_PROGRESS_BEFORE_DONE = 92

export function GlobalLoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  const activeFetchesRef = useRef(0)
  const navigationPendingRef = useRef(false)
  const initialRouteLoadedRef = useRef(false)

  function startLoading() {
    setVisible(true)
    setProgress((current) => (current < START_PROGRESS ? START_PROGRESS : current))
  }

  function completeLoading() {
    setProgress(100)

    window.setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 220)
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (!visible) {
          return current
        }

        if (current >= MAX_PROGRESS_BEFORE_DONE) {
          return current
        }

        const increment = Math.random() * 7 + 1
        return Math.min(current + increment, MAX_PROGRESS_BEFORE_DONE)
      })
    }, 180)

    return () => {
      window.clearInterval(interval)
    }
  }, [visible])

  useEffect(() => {
    const originalFetch = window.fetch.bind(window)

    const patchedFetch: typeof window.fetch = async (...args) => {
      activeFetchesRef.current += 1
      startLoading()

      try {
        return await originalFetch(...args)
      } finally {
        activeFetchesRef.current -= 1

        if (activeFetchesRef.current <= 0 && !navigationPendingRef.current) {
          completeLoading()
        }
      }
    }

    window.fetch = patchedFetch

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const target = event.target as HTMLElement | null
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null

      if (!anchor) {
        return
      }

      const href = anchor.getAttribute("href")

      if (!href || href.startsWith("#")) {
        return
      }

      const url = new URL(anchor.href, window.location.href)

      if (url.origin !== window.location.origin) {
        return
      }

      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return
      }

      navigationPendingRef.current = true
      startLoading()
    }

    document.addEventListener("click", clickHandler, { capture: true })

    return () => {
      document.removeEventListener("click", clickHandler, { capture: true })
    }
  }, [])

  useEffect(() => {
    if (!initialRouteLoadedRef.current) {
      initialRouteLoadedRef.current = true
      return
    }

    navigationPendingRef.current = false

    if (activeFetchesRef.current === 0) {
      completeLoading()
    }
  }, [pathname, searchParams])

  if (!visible) {
    return null
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.tooltip + 1
      }}
    >
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  )
}
