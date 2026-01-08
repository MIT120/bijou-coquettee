import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import AnalyticsWrapper from "@lib/components/analytics-wrapper"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  // Default to English, will be overridden by locale detection in middleware
  const lang = "en"

  return (
    <html lang={lang} data-mode="light">
      <body>
        <AnalyticsWrapper>
          <main className="relative">{props.children}</main>
        </AnalyticsWrapper>
      </body>
    </html>
  )
}
