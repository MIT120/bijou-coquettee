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

    const alreadyInCart = cart.items?.some(
        (item) => item.variant_id === promo.variant_id
    )

    if (alreadyInCart || added) {
        return null
    }

    const variant = product.variants?.find((v) => v.id === promo.variant_id)
    const price = variant?.calculated_price

    const hasDiscount =
        promo.discount_percent != null && promo.discount_percent > 0

    const originalAmount = price?.calculated_amount ?? null
    const discountedAmount =
        hasDiscount && originalAmount != null
            ? originalAmount * (1 - promo.discount_percent! / 100)
            : null

    const currencyCode = cart.currency_code || price?.currency_code || ""

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
        <div className="relative overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm">
            {/* Accent top border */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

            <div className="p-4 pt-5">
                {/* Heading row */}
                {promo.heading && (
                    <div className="flex items-center gap-1.5 mb-1">
                        {/* Sparkle icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3.5 h-3.5 flex-shrink-0 text-amber-500"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                            {promo.heading}
                        </p>
                    </div>
                )}

                {promo.description && (
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        {promo.description}
                    </p>
                )}

                {/* Product row */}
                <div className="flex gap-4 items-center">
                    {/* Larger thumbnail */}
                    <div className="w-20 flex-shrink-0 rounded-md overflow-hidden ring-1 ring-amber-100">
                        <Thumbnail
                            thumbnail={product.thumbnail}
                            images={product.images}
                            size="square"
                            className="!w-20"
                        />
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-snug truncate">
                            {product.title}
                        </p>
                        {variant?.title && variant.title !== "Default" && (
                            <p className="text-xs text-gray-400 mt-0.5">
                                {variant.title}
                            </p>
                        )}

                        {/* Price block */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Discounted (final) price */}
                            {discountedAmount != null && (
                                <span className="text-sm font-semibold text-gray-900">
                                    {convertToLocale({
                                        amount: discountedAmount,
                                        currency_code: currencyCode,
                                    })}
                                </span>
                            )}

                            {/* Original price with strikethrough */}
                            {originalAmount != null && hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">
                                    {convertToLocale({
                                        amount: originalAmount,
                                        currency_code: currencyCode,
                                    })}
                                </span>
                            )}

                            {/* Non-discounted price when no discount applied */}
                            {originalAmount != null && !hasDiscount && (
                                <span className="text-sm font-semibold text-gray-900">
                                    {convertToLocale({
                                        amount: originalAmount,
                                        currency_code: currencyCode,
                                    })}
                                </span>
                            )}

                            {/* Discount badge */}
                            {hasDiscount && (
                                <span className="text-xs font-semibold text-white bg-amber-500 px-1.5 py-0.5 rounded">
                                    -{promo.discount_percent}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Add button */}
                    <button
                        onClick={handleAdd}
                        disabled={adding}
                        className="flex-shrink-0 text-xs font-semibold px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {adding ? "Adding..." : "Add to cart"}
                    </button>
                </div>
            </div>
        </div>
    )
}
