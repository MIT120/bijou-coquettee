"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type WishlistButtonProps = {
    productId: string
    variantId?: string
    size?: "sm" | "md" | "lg"
    className?: string
}

export default function WishlistButton({
    productId,
    variantId,
    size = "md",
    className = "",
}: WishlistButtonProps) {
    const router = useRouter()
    const { isInWishlist, addToWishlist, removeFromWishlist, items } =
        useWishlist()
    const [isUpdating, setIsUpdating] = useState(false)
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    // Always render as "not in wishlist" on the server to avoid hydration mismatch.
    // The real state is applied after mount.
    const inWishlist = hasMounted && isInWishlist(productId, variantId)

    // Find the wishlist item ID if it exists
    const wishlistItem = items.find(
        (item) =>
            item.product_id === productId &&
            (!variantId || item.variant_id === variantId)
    )

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Check if user is logged in by seeing if wishlist context is available
        // If not logged in, redirect to login
        if (!items && !inWishlist) {
            router.push("/account/login?redirect=/products/" + productId)
            return
        }

        setIsUpdating(true)

        try {
            if (inWishlist && wishlistItem) {
                await removeFromWishlist(wishlistItem.id)
            } else {
                await addToWishlist(productId, variantId)
            }
        } catch (error) {
            console.error("Error updating wishlist:", error)
        } finally {
            setIsUpdating(false)
        }
    }

    // Size classes
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
    }

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        bg-white
        border border-gray-200
        hover:border-gray-300
        transition-all
        duration-200
        shadow-sm
        hover:shadow-md
        disabled:opacity-50
        disabled:cursor-not-allowed
        group
        ${className}
      `}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
            {inWishlist ? (
                // Filled heart (in wishlist)
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`${iconSizes[size]} text-red-500 group-hover:scale-110 transition-transform`}
                >
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>
            ) : (
                // Outline heart (not in wishlist)
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`${iconSizes[size]} text-gray-600 group-hover:text-red-500 group-hover:scale-110 transition-all`}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                </svg>
            )}
        </button>
    )
}

