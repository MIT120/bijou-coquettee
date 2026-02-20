import { Cormorant_Garamond, DM_Sans } from "next/font/google"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import AnalyticsWrapper from "@lib/components/analytics-wrapper"

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  // Default to English, will be overridden by locale detection in middleware
  const lang = "en"

  return (
    <html
      lang={lang}
      data-mode="light"
      className={`${cormorantGaramond.variable} ${dmSans.variable}`}
    >
      <body>
        <AnalyticsWrapper>
          <main className="relative">{props.children}</main>
        </AnalyticsWrapper>
      </body>
    </html>
  )
}
