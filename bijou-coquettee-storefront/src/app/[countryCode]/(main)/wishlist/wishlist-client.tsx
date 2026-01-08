"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { getProductsByIds } from "@lib/data/products"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { formatAmount } from "@lib/util/prices"
import { Trash, Heart } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

type WishlistPageClientProps = {
    countryCode: string
}

export default function WishlistPageClient({ countryCode }: WishlistPageClientProps) {
    const {
        items,
        itemCount,
        isLoading: wishlistLoading,
        isAuthenticated,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
    } = useWishlist()

    const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)
    const [isClearing, setIsClearing] = useState(false)

    // Fetch product details for wishlist items
    useEffect(() => {
        const fetchProducts = async () => {
            if (items.length === 0) {
                setProducts([])
                setIsLoadingProducts(false)
                return
            }

            setIsLoadingProducts(true)
            try {
                const productIds = items.map((item) => item.product_id)
                const fetchedProducts = await getProductsByIds({
                    ids: productIds,
                    countryCode,
                })
                setProducts(fetchedProducts)
            } catch (error) {
                console.error("Error fetching wishlist products:", error)
            } finally {
                setIsLoadingProducts(false)
            }
        }

        if (!wishlistLoading) {
            fetchProducts()
        }
    }, [items, countryCode, wishlistLoading])

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to clear your entire wishlist?")) {
            return
        }

        setIsClearing(true)
        await clearWishlist()
        await refreshWishlist()
        setIsClearing(false)
    }

    const handleRemove = async (itemId: string) => {
        await removeFromWishlist(itemId)
    }

    const isLoading = wishlistLoading || isLoadingProducts

    if (isLoading) {
        return (
            <div className="content-container py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 p-4 border rounded">
                                    <div className="w-24 h-24 bg-gray-200 rounded"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="content-container py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Heart className="w-16 h-16 text-gray-300 mb-4" />
                        <h1 className="text-2xl font-semibold mb-2">Your wishlist is empty</h1>
                        <p className="text-gray-500 mb-8">
                            Start adding items you love to your wishlist!
                        </p>
                        <LocalizedClientLink href="/store">
                            <Button variant="secondary">Browse Products</Button>
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>
        )
    }

    // Create a map of products by ID for easy lookup
    const productMap = new Map(products.map((p) => [p.id, p]))

    return (
        <div className="content-container py-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-semibold">Wishlist</h1>
                        <Button
                            variant="transparent"
                            onClick={handleClearAll}
                            disabled={isClearing}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Clear all ({itemCount})
                        </Button>
                    </div>
                    <p className="text-gray-500">
                        {itemCount} {itemCount === 1 ? "item" : "items"} saved
                        {!isAuthenticated && (
                            <span className="ml-2 text-sm">
                                (
                                <LocalizedClientLink
                                    href="/account"
                                    className="text-blue-600 hover:underline"
                                >
                                    Sign in
                                </LocalizedClientLink>{" "}
                                to save your wishlist across devices)
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {items.map((item) => {
                        const product = productMap.get(item.product_id)
                        const variant = item.variant_id
                            ? product?.variants?.find((v) => v.id === item.variant_id)
                            : product?.variants?.[0]

                        if (!product) {
                            // Product not found - maybe deleted
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                                >
                                    <span className="text-gray-500">
                                        Product no longer available
                                    </span>
                                    <Button
                                        variant="transparent"
                                        onClick={() => handleRemove(item.id)}
                                        className="p-2 hover:bg-gray-200"
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash className="text-gray-500" />
                                    </Button>
                                </div>
                            )
                        }

                        // Get price from variant
                        const price = variant?.calculated_price?.calculated_amount

                        return (
                            <div
                                key={item.id}
                                className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 p-4 border border-gray-200 rounded-lg"
                            >
                                <LocalizedClientLink
                                    href={`/products/${product.handle}`}
                                    className="w-full"
                                >
                                    <Thumbnail
                                        thumbnail={product.thumbnail}
                                        images={product.images}
                                        size="square"
                                    />
                                </LocalizedClientLink>

                                <div className="flex flex-col justify-between min-w-0">
                                    <div className="flex-1">
                                        <LocalizedClientLink
                                            href={`/products/${product.handle}`}
                                            className="hover:underline"
                                        >
                                            <h3 className="font-medium truncate">
                                                {product.title}
                                            </h3>
                                        </LocalizedClientLink>

                                        {variant && variant.title !== "Default" && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {variant.title}
                                            </p>
                                        )}

                                        {price && (
                                            <p className="font-medium mt-2">
                                                {formatAmount({
                                                    amount: price,
                                                    region: {
                                                        currency_code:
                                                            variant?.calculated_price
                                                                ?.currency_code || "usd",
                                                    } as any,
                                                })}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <LocalizedClientLink
                                            href={`/products/${product.handle}`}
                                            className="flex-1"
                                        >
                                            <Button variant="secondary" className="w-full">
                                                View Product
                                            </Button>
                                        </LocalizedClientLink>

                                        <Button
                                            variant="transparent"
                                            onClick={() => handleRemove(item.id)}
                                            className="p-2 hover:bg-gray-100"
                                            aria-label="Remove from wishlist"
                                        >
                                            <Trash className="text-gray-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-8">
                    <LocalizedClientLink href="/store">
                        <Button variant="secondary">Continue Shopping</Button>
                    </LocalizedClientLink>
                </div>
            </div>
        </div>
    )
}
