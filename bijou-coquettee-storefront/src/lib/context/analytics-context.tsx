"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import posthog from "posthog-js"

// E-commerce event types for jewelry shop
export type EcommerceItem = {
  item_id: string
  item_name: string
  item_category?: string
  item_variant?: string
  price: number
  currency: string
  quantity?: number
}

export type AnalyticsContextType = {
  isReady: boolean
  hasConsent: boolean
  setConsent: (consent: boolean) => void
  // Page tracking
  trackPageView: (path: string, properties?: Record<string, any>) => void
  // E-commerce events
  trackViewItem: (item: EcommerceItem) => void
  trackViewItemList: (listName: string, items: EcommerceItem[]) => void
  trackAddToCart: (item: EcommerceItem) => void
  trackRemoveFromCart: (item: EcommerceItem) => void
  trackBeginCheckout: (items: EcommerceItem[], value: number, currency: string) => void
  trackAddShippingInfo: (shippingMethod: string, value: number, currency: string) => void
  trackAddPaymentInfo: (paymentMethod: string, value: number, currency: string) => void
  trackPurchase: (transactionId: string, value: number, currency: string, items: EcommerceItem[]) => void
  // Jewelry-specific events
  trackAddToWishlist: (item: EcommerceItem) => void
  trackRemoveFromWishlist: (item: EcommerceItem) => void
  trackViewSizeGuide: (productId?: string, guideType?: string) => void
  trackSearch: (searchTerm: string, resultsCount?: number) => void
  trackViewCollection: (collectionName: string, itemCount?: number) => void
  // Custom event
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
  // User identification
  identifyUser: (userId: string, traits?: Record<string, any>) => void
  resetUser: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider")
  }
  return context
}

const CONSENT_COOKIE_KEY = "bijou_analytics_consent"
const CONSENT_EXPIRY_DAYS = 365

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

type AnalyticsProviderProps = {
  children: React.ReactNode
  posthogKey?: string
  posthogHost?: string
}

export const AnalyticsProvider = ({
  children,
  posthogKey,
  posthogHost = "https://eu.i.posthog.com",
}: AnalyticsProviderProps) => {
  const [isReady, setIsReady] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)

  // Initialize PostHog
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check for existing consent
    const existingConsent = getCookie(CONSENT_COOKIE_KEY)
    const consentGiven = existingConsent === "true"
    setHasConsent(consentGiven)

    // Initialize PostHog if we have a key
    if (posthogKey && !posthog.__loaded) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        persistence: consentGiven ? "localStorage+cookie" : "memory",
        autocapture: consentGiven, // Only autocapture with consent
        capture_pageview: false, // We'll track manually for more control
        capture_pageleave: consentGiven,
        disable_session_recording: !consentGiven,
        opt_out_capturing_by_default: !consentGiven,
        loaded: () => {
          setIsReady(true)
        },
      })
    } else if (!posthogKey) {
      // No PostHog key, but still mark as ready for the API
      setIsReady(true)
    }
  }, [posthogKey, posthogHost])

  // Handle consent changes
  const setConsent = useCallback((consent: boolean) => {
    setHasConsent(consent)
    setCookie(CONSENT_COOKIE_KEY, consent.toString(), CONSENT_EXPIRY_DAYS)

    if (consent) {
      posthog.opt_in_capturing()
      // Update PostHog settings for full tracking
      if (posthog.__loaded) {
        posthog.set_config({
          persistence: "localStorage+cookie",
          autocapture: true,
          capture_pageleave: true,
          disable_session_recording: false,
        })
      }
    } else {
      posthog.opt_out_capturing()
    }
  }, [])

  // Page view tracking
  const trackPageView = useCallback((path: string, properties?: Record<string, any>) => {
    if (!isReady) return
    posthog.capture("$pageview", {
      $current_url: path,
      ...properties,
    })
  }, [isReady])

  // E-commerce: View item
  const trackViewItem = useCallback((item: EcommerceItem) => {
    if (!isReady) return
    posthog.capture("view_item", {
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      item_variant: item.item_variant,
      price: item.price,
      currency: item.currency,
    })
  }, [isReady])

  // E-commerce: View item list
  const trackViewItemList = useCallback((listName: string, items: EcommerceItem[]) => {
    if (!isReady) return
    posthog.capture("view_item_list", {
      item_list_name: listName,
      items: items.map((item, index) => ({
        ...item,
        index,
      })),
    })
  }, [isReady])

  // E-commerce: Add to cart
  const trackAddToCart = useCallback((item: EcommerceItem) => {
    if (!isReady) return
    posthog.capture("add_to_cart", {
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      item_variant: item.item_variant,
      price: item.price,
      currency: item.currency,
      quantity: item.quantity || 1,
      value: item.price * (item.quantity || 1),
    })
  }, [isReady])

  // E-commerce: Remove from cart
  const trackRemoveFromCart = useCallback((item: EcommerceItem) => {
    if (!isReady) return
    posthog.capture("remove_from_cart", {
      item_id: item.item_id,
      item_name: item.item_name,
      price: item.price,
      currency: item.currency,
      quantity: item.quantity || 1,
    })
  }, [isReady])

  // E-commerce: Begin checkout
  const trackBeginCheckout = useCallback((items: EcommerceItem[], value: number, currency: string) => {
    if (!isReady) return
    posthog.capture("begin_checkout", {
      items,
      value,
      currency,
      item_count: items.reduce((acc, item) => acc + (item.quantity || 1), 0),
    })
  }, [isReady])

  // E-commerce: Add shipping info
  const trackAddShippingInfo = useCallback((shippingMethod: string, value: number, currency: string) => {
    if (!isReady) return
    posthog.capture("add_shipping_info", {
      shipping_tier: shippingMethod,
      value,
      currency,
    })
  }, [isReady])

  // E-commerce: Add payment info
  const trackAddPaymentInfo = useCallback((paymentMethod: string, value: number, currency: string) => {
    if (!isReady) return
    posthog.capture("add_payment_info", {
      payment_type: paymentMethod,
      value,
      currency,
    })
  }, [isReady])

  // E-commerce: Purchase
  const trackPurchase = useCallback((transactionId: string, value: number, currency: string, items: EcommerceItem[]) => {
    if (!isReady) return
    posthog.capture("purchase", {
      transaction_id: transactionId,
      value,
      currency,
      items,
      item_count: items.reduce((acc, item) => acc + (item.quantity || 1), 0),
    })
  }, [isReady])

  // Jewelry-specific: Add to wishlist
  const trackAddToWishlist = useCallback((item: EcommerceItem) => {
    if (!isReady) return
    posthog.capture("add_to_wishlist", {
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      price: item.price,
      currency: item.currency,
    })
  }, [isReady])

  // Jewelry-specific: Remove from wishlist
  const trackRemoveFromWishlist = useCallback((item: EcommerceItem) => {
    if (!isReady) return
    posthog.capture("remove_from_wishlist", {
      item_id: item.item_id,
      item_name: item.item_name,
    })
  }, [isReady])

  // Jewelry-specific: View size guide
  const trackViewSizeGuide = useCallback((productId?: string, guideType?: string) => {
    if (!isReady) return
    posthog.capture("view_size_guide", {
      product_id: productId,
      guide_type: guideType,
    })
  }, [isReady])

  // Search
  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    if (!isReady) return
    posthog.capture("search", {
      search_term: searchTerm,
      results_count: resultsCount,
    })
  }, [isReady])

  // View collection
  const trackViewCollection = useCallback((collectionName: string, itemCount?: number) => {
    if (!isReady) return
    posthog.capture("view_collection", {
      collection_name: collectionName,
      item_count: itemCount,
    })
  }, [isReady])

  // Generic event tracking
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (!isReady) return
    posthog.capture(eventName, properties)
  }, [isReady])

  // User identification
  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
    if (!isReady) return
    posthog.identify(userId, traits)
  }, [isReady])

  // Reset user (logout)
  const resetUser = useCallback(() => {
    if (!isReady) return
    posthog.reset()
  }, [isReady])

  return (
    <AnalyticsContext.Provider
      value={{
        isReady,
        hasConsent,
        setConsent,
        trackPageView,
        trackViewItem,
        trackViewItemList,
        trackAddToCart,
        trackRemoveFromCart,
        trackBeginCheckout,
        trackAddShippingInfo,
        trackAddPaymentInfo,
        trackPurchase,
        trackAddToWishlist,
        trackRemoveFromWishlist,
        trackViewSizeGuide,
        trackSearch,
        trackViewCollection,
        trackEvent,
        identifyUser,
        resetUser,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}
