"use client"

import { useState, useEffect } from "react"
import { useAnalytics } from "@lib/context/analytics-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CONSENT_DISMISSED_KEY = "bijou_consent_dismissed"

export const CookieConsentBanner = () => {
  const { hasConsent, setConsent } = useAnalytics()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    if (typeof window === "undefined") return

    const dismissed = localStorage.getItem(CONSENT_DISMISSED_KEY)
    if (!dismissed && !hasConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [hasConsent])

  const handleAccept = () => {
    setConsent(true)
    localStorage.setItem(CONSENT_DISMISSED_KEY, "true")
    setIsVisible(false)
  }

  const handleDecline = () => {
    setConsent(false)
    localStorage.setItem(CONSENT_DISMISSED_KEY, "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in-up">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              We value your privacy
            </h3>
            <p className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience, analyze site traffic,
              and personalize content. By clicking &quot;Accept&quot;, you consent to our use of cookies.{" "}
              <LocalizedClientLink
                href="/privacy-policy"
                className="text-gray-900 underline hover:text-gray-700"
              >
                Learn more
              </LocalizedClientLink>
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieConsentBanner
