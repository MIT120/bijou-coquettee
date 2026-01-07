"use client"

import { useEffect, useRef } from "react"
import { useAnalytics, EcommerceItem } from "@lib/context/analytics-context"
import { useMetaPixel } from "@lib/components/meta-pixel"
import { HttpTypes } from "@medusajs/types"

type ProductViewTrackerProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

export const ProductViewTracker = ({ product, region }: ProductViewTrackerProps) => {
  const { trackViewItem } = useAnalytics()
  const { trackViewContent } = useMetaPixel()
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per mount
    if (hasTracked.current || !product?.id) return
    hasTracked.current = true

    // Get the price from the first variant or the product itself
    const price = product.variants?.[0]?.calculated_price?.calculated_amount
      ? product.variants[0].calculated_price.calculated_amount / 100
      : 0

    const currency = region?.currency_code?.toUpperCase() || "USD"

    const item: EcommerceItem = {
      item_id: product.id,
      item_name: product.title || "",
      item_category: product.categories?.[0]?.name,
      price,
      currency,
    }

    // Track in PostHog
    trackViewItem(item)

    // Track in Meta Pixel
    trackViewContent(product.id, product.title || "", price, currency)
  }, [product, region, trackViewItem, trackViewContent])

  return null
}

export default ProductViewTracker
