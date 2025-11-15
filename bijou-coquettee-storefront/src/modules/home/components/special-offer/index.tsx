"use client"

import { useState } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SpecialOffer = () => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <section className="content-container py-12 small:py-16 border-t border-grey-10 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50">
      <div className="max-w-4xl mx-auto text-center space-y-4 relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-0 right-0 text-grey-60 hover:text-grey-90 transition-colors duration-200"
          aria-label="Close offer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        <div className="inline-block mb-2">
          <span className="text-xs small:text-sm tracking-[0.3em] uppercase text-grey-70 font-light">
            Limited Time Offer
          </span>
        </div>
        <Heading
          level="h2"
          className="text-2xl small:text-3xl text-grey-90 font-light tracking-tight"
        >
          Free Shipping on Orders Over $100
        </Heading>
        <Text className="text-sm small:text-base text-grey-70 font-light">
          Plus, enjoy complimentary gift wrapping on all orders
        </Text>
        <div className="pt-2">
          <LocalizedClientLink href="/store">
            <Button
              size="small"
              className="bg-grey-90 hover:bg-grey-80 text-white px-6 py-2 rounded-none border border-grey-90 hover:border-grey-80 transition-all duration-300 font-light tracking-wide uppercase text-xs"
            >
              Shop Now
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default SpecialOffer

