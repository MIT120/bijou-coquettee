"use client"

/**
 * useScrollDepth
 *
 * Tracks vertical scroll position and exposes:
 *   - `showBackToTop`: true once the user has scrolled past `threshold` px
 *   - `scrollToTop`: smooth-scrolls back to 0
 *
 * Uses a passive scroll listener attached once; cleans up on unmount.
 * Reading scrollY inside a passive listener is safe and does not block
 * the main thread.
 */

import { useCallback, useEffect, useState } from "react"

type UseScrollDepthOptions = {
  /** Pixels scrolled before the back-to-top button appears. Default: 600 */
  threshold?: number
}

type UseScrollDepthReturn = {
  showBackToTop: boolean
  scrollToTop: () => void
}

export function useScrollDepth(
  { threshold = 600 }: UseScrollDepthOptions = {}
): UseScrollDepthReturn {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > threshold)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    // Run once immediately in case the page restores scroll position.
    onScroll()

    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return { showBackToTop, scrollToTop }
}
