"use client"

import { useState } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SpecialOfferData } from "@lib/data/special-offers"

const DEFAULT_OFFER = {
  subtitle: "Специална оферта",
  discount_percent: 20,
  title: "на всички бижута",
  description: "Използвай код при поръчка. Валидно за ограничен период.",
  discount_code: "BIJOU20",
  cta_text: "Пазарувай сега",
  cta_link: "/store",
}

const SpecialOffer = ({ offer }: { offer?: SpecialOfferData | null }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [copied, setCopied] = useState(false)

  const data = offer || DEFAULT_OFFER
  const discountCode = data.discount_code || DEFAULT_OFFER.discount_code
  const discountPercent = data.discount_percent || DEFAULT_OFFER.discount_percent
  const subtitle = data.subtitle || DEFAULT_OFFER.subtitle
  const title = data.title || DEFAULT_OFFER.title
  const description = data.description || DEFAULT_OFFER.description
  const ctaText = data.cta_text || DEFAULT_OFFER.cta_text
  const ctaLink = data.cta_link || DEFAULT_OFFER.cta_link

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isVisible) return null

  return (
    <section className="w-full py-12 small:py-20 border-t border-grey-10 bg-gradient-to-r from-grey-90 via-grey-80 to-grey-90 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-soft-gold blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-gold-200 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-0 right-0 text-white/50 hover:text-white transition-colors duration-200"
          aria-label="Close offer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="inline-block mb-2">
          <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-soft-gold font-normal">
            {subtitle}
          </span>
        </div>

        {/* Large discount display */}
        <div className="flex items-center justify-center gap-4 small:gap-6">
          <div className="font-display text-6xl small:text-8xl font-light text-white leading-none">
            -{discountPercent}<span className="text-soft-gold">%</span>
          </div>
        </div>

        <Heading
          level="h2"
          className="font-display text-xl small:text-3xl text-white font-light tracking-tight"
        >
          {title}
        </Heading>

        <Text className="text-sm small:text-base text-white/70 font-light">
          {description}
        </Text>

        {/* Discount code box */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2.5 backdrop-blur-sm">
            <span className="font-sans text-lg small:text-xl font-medium tracking-[0.12em] text-white">
              {discountCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="pt-3">
          <LocalizedClientLink href={ctaLink}>
            <Button
              size="large"
              className="bg-white hover:bg-grey-5 text-grey-90 px-8 py-3 rounded-full border border-white hover:border-grey-5 transition-all duration-300 font-sans font-medium tracking-[0.12em] uppercase text-sm shadow-warm-md"
            >
              {ctaText}
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default SpecialOffer
