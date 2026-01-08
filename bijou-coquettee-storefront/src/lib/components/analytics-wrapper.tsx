"use client"

import { AnalyticsProvider } from "@lib/context/analytics-context"
import { MetaPixel } from "@lib/components/meta-pixel"
import CookieConsentBanner from "@modules/common/components/cookie-consent"

type AnalyticsWrapperProps = {
  children: React.ReactNode
}

export const AnalyticsWrapper = ({ children }: AnalyticsWrapperProps) => {
  // Get environment variables
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  return (
    <AnalyticsProvider posthogKey={posthogKey} posthogHost={posthogHost}>
      {children}
      <MetaPixel pixelId={metaPixelId} />
      <CookieConsentBanner />
    </AnalyticsProvider>
  )
}

export default AnalyticsWrapper
