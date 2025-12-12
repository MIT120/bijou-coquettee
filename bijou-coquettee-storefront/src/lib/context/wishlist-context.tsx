"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
    getWishlist,
    addToWishlist as addToWishlistAPI,
    removeFromWishlist as removeFromWishlistAPI,
    clearWishlist as clearWishlistAPI,
    addToLocalWishlist,
    removeFromLocalWishlist,
    clearLocalWishlist,
    isInLocalWishlist,
    getLocalWishlistAsWishlist,
    type Wishlist,
    type WishlistItem,
} from "@lib/data/wishlist"

type WishlistContextType = {
    wishlist: Wishlist | null
    items: WishlistItem[]
    itemCount: number
    isLoading: boolean
    isAuthenticated: boolean
    isInWishlist: (productId: string, variantId?: string) => boolean
    addToWishlist: (productId: string, variantId?: string) => Promise<boolean>
    removeFromWishlist: (itemId: string) => Promise<boolean>
    removeFromWishlistByProductId: (productId: string, variantId?: string) => Promise<boolean>
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
    customer?: any
}

export const WishlistProvider = ({
    children,
    customer,
}: WishlistProviderProps) => {
    const [wishlist, setWishlist] = useState<Wishlist | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const isAuthenticated = !!customer

    const items = wishlist?.items || []
    const itemCount = items.length

    const refreshWishlist = useCallback(async () => {
        setIsLoading(true)
        try {
            if (isAuthenticated) {
                // Fetch from backend for authenticated users
                const data = await getWishlist()
                setWishlist(data)
            } else {
                // Use local storage for guests
                const localWishlist = getLocalWishlistAsWishlist()
                setWishlist(localWishlist)
            }
        } catch (error) {
            console.error("Error refreshing wishlist:", error)
        } finally {
            setIsLoading(false)
        }
    }, [isAuthenticated])

    // Load wishlist on mount and when authentication changes
    useEffect(() => {
        refreshWishlist()
    }, [refreshWishlist])

    const isInWishlistFunc = (productId: string, variantId?: string): boolean => {
        if (isAuthenticated) {
            if (!wishlist) return false
            return items.some(
                (item) =>
                    item.product_id === productId &&
                    (!variantId || item.variant_id === variantId)
            )
        } else {
            return isInLocalWishlist(productId, variantId)
        }
    }

    const addToWishlistFunc = async (
        productId: string,
        variantId?: string
    ): Promise<boolean> => {
        try {
            if (isAuthenticated) {
                const success = await addToWishlistAPI(productId, variantId)
                if (success) {
                    await refreshWishlist()
                }
                return success
            } else {
                // Add to local storage for guests
                addToLocalWishlist(productId, variantId)
                await refreshWishlist()
                return true
            }
        } catch (error) {
            console.error("Error adding to wishlist:", error)
            return false
        }
    }

    const removeFromWishlistFunc = async (itemId: string): Promise<boolean> => {
        try {
            if (isAuthenticated) {
                const success = await removeFromWishlistAPI(itemId)
                if (success) {
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
            } else {
                // Remove from local storage for guests
                const success = removeFromLocalWishlist(itemId)
                if (success) {
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
            }
        } catch (error) {
            console.error("Error removing from wishlist:", error)
            return false
        }
    }

    const removeFromWishlistByProductIdFunc = async (
        productId: string,
        variantId?: string
    ): Promise<boolean> => {
        const item = items.find(
            (item) =>
                item.product_id === productId &&
                (!variantId || item.variant_id === variantId)
        )
        if (item) {
            return removeFromWishlistFunc(item.id)
        }
        return false
    }

    const clearWishlistFunc = async (): Promise<boolean> => {
        try {
            if (isAuthenticated) {
                const success = await clearWishlistAPI()
                if (success) {
                    setWishlist((prev) => (prev ? { ...prev, items: [] } : null))
                }
                return success
            } else {
                // Clear local storage for guests
                clearLocalWishlist()
                setWishlist((prev) => (prev ? { ...prev, items: [] } : null))
                return true
            }
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
                isAuthenticated,
                isInWishlist: isInWishlistFunc,
                addToWishlist: addToWishlistFunc,
                removeFromWishlist: removeFromWishlistFunc,
                removeFromWishlistByProductId: removeFromWishlistByProductIdFunc,
                clearWishlist: clearWishlistFunc,
                refreshWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}
