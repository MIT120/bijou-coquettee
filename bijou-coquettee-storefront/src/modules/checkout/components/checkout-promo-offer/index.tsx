"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { addPromoToCart } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import Thumbnail from "@modules/products/components/thumbnail"
import type { CheckoutPromo } from "@/types/checkout-promo"

type Props = {
    promo: CheckoutPromo
    product: HttpTypes.StoreProduct
    cart: HttpTypes.StoreCart
    countryCode: string
}

export default function CheckoutPromoOffer({
    promo,
    product,
    cart,
    countryCode,
}: Props) {
    const [adding, setAdding] = useState(false)
    const [added, setAdded] = useState(false)

    // Check if promo variant is already in the cart
    const alreadyInCart = cart.items?.some(
        (item) => item.variant_id === promo.variant_id
    )

    if (alreadyInCart || added) {
        return null
    }

    // Find the variant and its price
    const variant = product.variants?.find((v) => v.id === promo.variant_id)
    const price = variant?.calculated_price

    const handleAdd = async () => {
        setAdding(true)
        try {
            await addPromoToCart({
                variantId: promo.variant_id,
                countryCode,
                promotionCode: promo.promotion_code,
            })
            setAdded(true)
        } catch (error) {
            console.error("Failed to add promo product to cart:", error)
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="border border-ui-border-base rounded-lg p-4 bg-ui-bg-subtle">
            {promo.heading && (
                <p className="text-sm font-semibold text-ui-fg-base mb-2">
                    {promo.heading}
                </p>
            )}
            {promo.description && (
                <p className="text-xs text-ui-fg-subtle mb-3">
                    {promo.description}
                </p>
            )}

            <div className="flex gap-3 items-center">
                <div className="w-16 flex-shrink-0">
                    <Thumbnail
                        thumbnail={product.thumbnail}
                        images={product.images}
                        size="square"
                        className="!w-16"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ui-fg-base truncate">
                        {product.title}
                    </p>
                    {variant?.title && variant.title !== "Default" && (
                        <p className="text-xs text-ui-fg-subtle">
                            {variant.title}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        {price && (
                            <span className="text-sm text-ui-fg-base">
                                {convertToLocale({
                                    amount: price.calculated_amount!,
                                    currency_code:
                                        cart.currency_code || price.currency_code!,
                                })}
                            </span>
                        )}
                        {promo.discount_percent && promo.discount_percent > 0 && (
                            <span className="text-xs font-medium text-ui-fg-interactive bg-ui-bg-interactive-subtle px-1.5 py-0.5 rounded">
                                -{promo.discount_percent}%
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="flex-shrink-0 text-xs font-medium px-3 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-lg hover:bg-ui-button-neutral-hover transition-colors disabled:opacity-50"
                >
                    {adding ? "Adding..." : "Add"}
                </button>
            </div>
        </div>
    )
}
