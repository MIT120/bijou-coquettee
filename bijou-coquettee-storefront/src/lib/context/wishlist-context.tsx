"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
    getWishlist,
    addToWishlist as addToWishlistAPI,
    removeFromWishlist as removeFromWishlistAPI,
    clearWishlist as clearWishlistAPI,
    type Wishlist,
    type WishlistItem,
} from "@lib/data/wishlist"

type WishlistContextType = {
    wishlist: Wishlist | null
    items: WishlistItem[]
    itemCount: number
    isLoading: boolean
    isInWishlist: (productId: string, variantId?: string) => boolean
    addToWishlist: (productId: string, variantId?: string) => Promise<boolean>
    removeFromWishlist: (itemId: string) => Promise<boolean>
    clearWishlist: () => Promise<boolean>
    refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export const useWishlist = () => {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error("useWishlist must be used within WishlistProvider")
    }
    return context
}

type WishlistProviderProps = {
    children: React.ReactNode
    initialWishlist?: Wishlist | null
}

export const WishlistProvider = ({
    children,
    initialWishlist = null,
}: WishlistProviderProps) => {
    const [wishlist, setWishlist] = useState<Wishlist | null>(initialWishlist)
    const [isLoading, setIsLoading] = useState(false)

    const items = wishlist?.items || []
    const itemCount = items.length

    // Fetch wishlist on mount
    useEffect(() => {
        if (!initialWishlist) {
            refreshWishlist()
        }
    }, [initialWishlist])

    const refreshWishlist = async () => {
        setIsLoading(true)
        try {
            const data = await getWishlist()
            setWishlist(data)
        } catch (error) {
            console.error("Error fetching wishlist:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const isInWishlistFunc = (productId: string, variantId?: string): boolean => {
        if (!wishlist) return false

        return items.some(
            (item) =>
                item.product_id === productId &&
                (!variantId || item.variant_id === variantId)
        )
    }

    const addToWishlistFunc = async (
        productId: string,
        variantId?: string
    ): Promise<boolean> => {
        try {
            const success = await addToWishlistAPI(productId, variantId)
            if (success) {
                await refreshWishlist()
            }
            return success
        } catch (error) {
            console.error("Error adding to wishlist:", error)
            return false
        }
    }

    const removeFromWishlistFunc = async (itemId: string): Promise<boolean> => {
        try {
            const success = await removeFromWishlistAPI(itemId)
            if (success) {
                // Optimistically update UI
                setWishlist((prev) =>
                    prev
                        ? {
                            ...prev,
                            items: prev.items.filter((item) => item.id !== itemId),
                        }
                        : null
                )
            }
            return success
        } catch (error) {
            console.error("Error removing from wishlist:", error)
            return false
        }
    }

    const clearWishlistFunc = async (): Promise<boolean> => {
        try {
            const success = await clearWishlistAPI()
            if (success) {
                setWishlist((prev) => (prev ? { ...prev, items: [] } : null))
            }
            return success
        } catch (error) {
            console.error("Error clearing wishlist:", error)
            return false
        }
    }

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                items,
                itemCount,
                isLoading,
                isInWishlist: isInWishlistFunc,
                addToWishlist: addToWishlistFunc,
                removeFromWishlist: removeFromWishlistFunc,
                clearWishlist: clearWishlistFunc,
                refreshWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

