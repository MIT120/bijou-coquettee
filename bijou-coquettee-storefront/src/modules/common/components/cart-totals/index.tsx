"use client"

import { useParams } from "next/navigation"
import { convertToLocale } from "@lib/util/money"
import React, { useEffect, useState } from "react"
import { getLocale, t } from "@lib/util/translations"

// Fixed BGN/EUR exchange rate (Bulgarian currency board peg)
const BGN_TO_EUR = 1.9558
const ECONT_STORAGE_KEY = "econt-shipping-cost"

function convertEcontPrice(
  price: number,
  econtCurrency: string,
  cartCurrency: string
): number {
  const src = econtCurrency?.toLowerCase() || "bgn"
  const dst = cartCurrency?.toLowerCase() || "eur"

  if (src === dst) return price
  if (src === "bgn" && dst === "eur")
    return Math.round((price / BGN_TO_EUR) * 100) / 100
  if (src === "eur" && dst === "bgn")
    return Math.round(price * BGN_TO_EUR * 100) / 100
  return price
}

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const locale = getLocale(countryCode)
  const {
    currency_code,
    total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  // Econt-calculated shipping cost (already converted to cart currency)
  const [econtShippingCost, setEcontShippingCost] = useState<number | null>(
    null
  )

  const isBulgaria = countryCode === "bg"

  useEffect(() => {
    if (!isBulgaria) return

    // Helper to parse and convert stored/event Econt price
    const processEcontPrice = (totalPrice: number, currency: string) => {
      const converted = convertEcontPrice(totalPrice, currency, currency_code)
      setEcontShippingCost(converted)
    }

    // 1. Read from localStorage immediately (handles race condition on mount)
    try {
      const stored = localStorage.getItem(ECONT_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.totalPrice != null) {
          processEcontPrice(parsed.totalPrice, parsed.currency || "BGN")
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    // 2. Listen for CustomEvent (handles real-time updates when user saves)
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.totalPrice != null) {
        processEcontPrice(detail.totalPrice, detail.currency || "BGN")
      }
    }
    window.addEventListener("econt-shipping-calculated", handler)

    // 3. Listen for storage events (handles cross-tab updates)
    const storageHandler = (e: StorageEvent) => {
      if (e.key === ECONT_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed?.totalPrice != null) {
            processEcontPrice(parsed.totalPrice, parsed.currency || "BGN")
          }
        } catch {
          // Ignore parse errors
        }
      } else if (e.key === ECONT_STORAGE_KEY && !e.newValue) {
        setEcontShippingCost(null)
      }
    }
    window.addEventListener("storage", storageHandler)

    return () => {
      window.removeEventListener("econt-shipping-calculated", handler)
      window.removeEventListener("storage", storageHandler)
    }
  }, [isBulgaria, currency_code])

  const shippingDisplay =
    econtShippingCost != null ? econtShippingCost : (shipping_subtotal ?? 0)

  const totalDisplay =
    econtShippingCost != null
      ? (item_subtotal ?? 0) - (discount_subtotal ?? 0) + econtShippingCost
      : (total ?? 0)

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>
            {t("cart.subtotalExclShippingTaxes", locale).replace(
              / и данъци| and taxes/gi,
              ""
            )}
          </span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("cart.shipping", locale)}</span>
          <span data-testid="cart-shipping" data-value={shippingDisplay}>
            {convertToLocale({
              amount: shippingDisplay,
              currency_code,
            })}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>{t("cart.discount", locale)}</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>{t("cart.total", locale)}</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={totalDisplay}
        >
          {convertToLocale({ amount: totalDisplay, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
