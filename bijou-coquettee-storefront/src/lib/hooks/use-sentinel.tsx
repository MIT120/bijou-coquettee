"use client"

/**
 * useSentinel
 *
 * Attaches an IntersectionObserver to a ref'd element and calls
 * `onIntersect` exactly once per crossing. A 200 ms debounce guards
 * against Safari's rubber-band over-scroll firing the observer twice
 * in quick succession.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null)
 *   useSentinel(ref, onIntersect, { enabled: hasNextPage })
 */

import { RefObject, useEffect, useRef } from "react"

type UseSentinelOptions = {
  /** Set to false to disconnect the observer (e.g. no more pages). */
  enabled?: boolean
  /**
   * rootMargin passed to IntersectionObserver.
   * "200px" fires the callback before the sentinel is fully visible,
   * giving the fetch a head-start and making the experience feel instant.
   */
  rootMargin?: string
}

export function useSentinel(
  sentinelRef: RefObject<HTMLDivElement | null>,
  onIntersect: () => void,
  { enabled = true, rootMargin = "200px" }: UseSentinelOptions = {}
): void {
  // Stable ref to always point at the latest callback without recreating
  // the observer on every render.
  const callbackRef = useRef(onIntersect)
  callbackRef.current = onIntersect

  // Debounce timer ref — shared across renders, never causes re-renders.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return

    const el = sentinelRef.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        // Clear any previous pending debounce before scheduling a new one.
        if (timerRef.current) clearTimeout(timerRef.current)

        timerRef.current = setTimeout(() => {
          callbackRef.current()
        }, 200)
      },
      { rootMargin }
    )

    observer.observe(el)

    return () => {
      observer.unobserve(el)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled, sentinelRef, rootMargin])
}
