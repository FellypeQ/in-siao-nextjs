"use client"

import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { useServerInsertedHTML } from "next/navigation"
import { useState, type ReactNode } from "react"

type EmotionRegistryProps = {
  children: ReactNode
}

export function EmotionRegistry({ children }: EmotionRegistryProps) {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache({ key: "css" })
    emotionCache.compat = true

    const prevInsert = emotionCache.insert.bind(emotionCache)
    let inserted: string[] = []

    emotionCache.insert = (...args) => {
      const [, serialized] = args
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }

    return {
      cache: emotionCache,
      flush: () => {
        const names = inserted
        inserted = []
        return names
      }
    }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) return null

    let styles = ""
    for (const name of names) {
      styles += cache.inserted[name] ?? ""
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}
