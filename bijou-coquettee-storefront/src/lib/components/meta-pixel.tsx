"use client"

import { useEffect } from "react"
import { useAnalytics } from "@lib/context/analytics-context"

type FbqFunction = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue: unknown[][]
  push: FbqFunction
  loaded: boolean
  version: string
}

declare global {
  interface Window {
    fbq: FbqFunction
    _fbq: FbqFunction
  }
}

type MetaPixelProps = {
  pixelId?: string
}

export const MetaPixel = ({ pixelId }: MetaPixelProps) => {
  const { hasConsent } = useAnalytics()

  useEffect(() => {
    // Only load Meta Pixel if we have consent and a pixel ID
    if (!hasConsent || !pixelId || typeof window === "undefined") return

    // Check if already loaded
    if (typeof window.fbq === "function" && window.fbq.loaded) return

    // Initialize fbq function
    const fbq: FbqFunction = function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args)
      } else {
        fbq.queue.push(args)
      }
    } as FbqFunction

    fbq.queue = []
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = "2.0"

    window.fbq = fbq
    if (!window._fbq) window._fbq = fbq

    // Load the script
    const script = document.createElement("script")
    script.async = true
    script.src = "https://connect.facebook.net/en_US/fbevents.js"
    document.head.appendChild(script)

    // Initialize pixel
    window.fbq("init", pixelId)
    window.fbq("track", "PageView")

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector('script[src="https://connect.facebook.net/en_US/fbevents.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [hasConsent, pixelId])

  // Don't render anything if no consent or no pixel ID
  if (!hasConsent || !pixelId) return null

  // Noscript fallback for users with JS disabled
  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )
}

// Helper hook for Meta Pixel events
export const useMetaPixel = () => {
  const { hasConsent } = useAnalytics()

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (!hasConsent || typeof window === "undefined" || !window.fbq) return
    window.fbq("track", eventName, parameters)
  }

  const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (!hasConsent || typeof window === "undefined" || !window.fbq) return
    window.fbq("trackCustom", eventName, parameters)
  }

  return {
    // Standard events
    trackPageView: () => trackEvent("PageView"),
    trackViewContent: (contentId: string, contentName: string, value?: number, currency?: string) =>
      trackEvent("ViewContent", {
        content_ids: [contentId],
        content_name: contentName,
        content_type: "product",
        value,
        currency,
      }),
    trackAddToCart: (contentId: string, contentName: string, value: number, currency: string) =>
      trackEvent("AddToCart", {
        content_ids: [contentId],
        content_name: contentName,
        content_type: "product",
        value,
        currency,
      }),
    trackAddToWishlist: (contentId: string, contentName: string, value?: number, currency?: string) =>
      trackEvent("AddToWishlist", {
        content_ids: [contentId],
        content_name: contentName,
        content_type: "product",
        value,
        currency,
      }),
    trackInitiateCheckout: (contentIds: string[], value: number, currency: string, numItems: number) =>
      trackEvent("InitiateCheckout", {
        content_ids: contentIds,
        content_type: "product",
        value,
        currency,
        num_items: numItems,
      }),
    trackAddPaymentInfo: () => trackEvent("AddPaymentInfo"),
    trackPurchase: (contentIds: string[], value: number, currency: string, numItems: number) =>
      trackEvent("Purchase", {
        content_ids: contentIds,
        content_type: "product",
        value,
        currency,
        num_items: numItems,
      }),
    trackSearch: (searchString: string) =>
      trackEvent("Search", {
        search_string: searchString,
      }),
    // Custom events
    trackCustomEvent,
  }
}
