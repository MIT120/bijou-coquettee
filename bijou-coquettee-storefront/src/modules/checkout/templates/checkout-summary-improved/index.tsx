"use client"

import { Heading, Text } from "@medusajs/ui"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import TrustSignals from "@modules/checkout/components/trust-signals"
import { convertToLocale } from "@lib/util/money"
import { useState } from "react"

const CheckoutSummaryImproved = ({ cart }: { cart: any }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const itemCount = cart?.items?.length || 0

  return (
    <>
      {/* Mobile: Collapsible Summary */}
      <div className="small:hidden sticky top-0 bg-white border-b z-10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <Text className="font-medium">
              {isExpanded ? "Hide" : "Show"} order summary
            </Text>
            <span className="text-gray-500 text-sm">({itemCount} items)</span>
          </div>
          <Text className="font-semibold text-lg">
            {cart?.total ? convertToLocale({ amount: cart.total, currency_code: cart.region?.currency_code || "eur" }) : ""}
          </Text>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 border-t">
            <div className="py-4">
              <CartTotals totals={cart} />
            </div>
            <Divider className="my-4" />
            <ItemsPreviewTemplate cart={cart} />
            <div className="my-4">
              <DiscountCode cart={cart} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Sticky Sidebar */}
      <div className="hidden small:block sticky top-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
          <div>
            <Heading level="h2" className="text-2xl font-semibold mb-2">
              Order Summary
            </Heading>
            <Text className="text-sm text-gray-600">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Text>
          </div>

          <Divider />

          <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <ItemsPreviewTemplate cart={cart} />
          </div>

          <Divider />

          <DiscountCode cart={cart} />

          <Divider />

          <CartTotals totals={cart} />

          <Divider />

          <TrustSignals />
        </div>
      </div>
    </>
  )
}

export default CheckoutSummaryImproved
