const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * Wishlist API Response Types
 */
export type WishlistItem = {
    id: string
    wishlist_id: string
    product_id: string
    variant_id: string | null
    added_at: string
    product: any
    variant: any | null
}

export type Wishlist = {
    id: string
    customer_id: string
    is_public: boolean
    share_token: string | null
    items: WishlistItem[]
}

/**
 * Get customer's wishlist
 * Note: This is a client-side function, so it cannot use server-only features like `next: { tags }`
 * 
 * DISABLED: Temporarily disabled due to "Failed to fetch" errors
 * To re-enable, remove the early return below
 */
export async function getWishlist(): Promise<Wishlist | null> {
    // TEMPORARILY DISABLED - Return null immediately to prevent fetch errors
    return null

    /* COMMENTED OUT - To re-enable, uncomment below and remove the return null above
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    // Add publishable key if available
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    try {
        // Validate backend URL
        if (!BACKEND_URL) {
            console.error("Backend URL is not configured")
            return null
        }

        const response = await fetch(`${BACKEND_URL}/store/wishlist`, {
            headers,
            credentials: "include", // This ensures cookies (including auth token) are sent
            cache: "no-store", // Client-side fetch should not be cached
        })

        if (response.status === 401) {
            // Not authenticated - this is expected for guests
            return null
        }

        if (!response.ok) {
            const errorText = await response.text().catch(() => "Unable to read error response")
            console.error("Failed to fetch wishlist:", {
                status: response.status,
                statusText: response.statusText,
                url: `${BACKEND_URL}/store/wishlist`,
                errorText,
            })
            return null
        }

        const data = await response.json()
        return data.wishlist
    } catch (error) {
        // Better error serialization
        const errorDetails: any = {
            url: `${BACKEND_URL}/store/wishlist`,
            backendUrl: BACKEND_URL,
            hasPublishableKey: !!publishableKey,
        }

        if (error instanceof Error) {
            errorDetails.message = error.message
            errorDetails.name = error.name
            errorDetails.stack = error.stack
        } else if (error instanceof TypeError) {
            errorDetails.message = error.message
            errorDetails.name = "TypeError"
            // Network errors often show as TypeError
            if (error.message.includes("fetch")) {
                errorDetails.hint = "This might be a CORS or network connectivity issue. Check if the backend is running and CORS is configured."
            }
        } else {
            errorDetails.rawError = String(error)
            errorDetails.type = typeof error
        }

        console.error("Error fetching wishlist:", errorDetails)
        return null
    }
    */
}

/**
 * Add item to wishlist
 */
export async function addToWishlist(
    productId: string,
    variantId?: string
): Promise<boolean> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    try {
        const response = await fetch(`${BACKEND_URL}/store/wishlist/items`, {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({
                product_id: productId,
                variant_id: variantId,
            }),
        })

        return response.ok
    } catch (error) {
        console.error("Error adding to wishlist:", error)
        return false
    }
}

/**
 * Remove item from wishlist
 */
export async function removeFromWishlist(itemId: string): Promise<boolean> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    try {
        const response = await fetch(
            `${BACKEND_URL}/store/wishlist/items/${itemId}`,
            {
                method: "DELETE",
                headers,
                credentials: "include",
            }
        )

        return response.ok
    } catch (error) {
        console.error("Error removing from wishlist:", error)
        return false
    }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(
    productId: string,
    variantId?: string
): Promise<boolean> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    try {
        const response = await fetch(`${BACKEND_URL}/store/wishlist/check`, {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({
                product_id: productId,
                variant_id: variantId,
            }),
        })

        if (!response.ok) {
            return false
        }

        const data = await response.json()
        return data.in_wishlist || false
    } catch (error) {
        console.error("Error checking wishlist:", error)
        return false
    }
}

/**
 * Clear entire wishlist
 */
export async function clearWishlist(): Promise<boolean> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    try {
        const response = await fetch(`${BACKEND_URL}/store/wishlist`, {
            method: "DELETE",
            headers,
            credentials: "include",
        })

        return response.ok
    } catch (error) {
        console.error("Error clearing wishlist:", error)
        return false
    }
}

/**
 * Generate share link for wishlist
 */
export async function generateShareLink(): Promise<string | null> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    try {
        const response = await fetch(`${BACKEND_URL}/store/wishlist/share`, {
            method: "POST",
            headers,
            credentials: "include",
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data.shareUrl || null
    } catch (error) {
        console.error("Error generating share link:", error)
        return null
    }
}

/**
 * Get shared wishlist by token
 */
export async function getSharedWishlist(
    token: string
): Promise<Wishlist | null> {
    try {
        const response = await fetch(
            `${BACKEND_URL}/store/wishlist/shared/${token}`,
            {
                credentials: "include",
                cache: "no-store", // Client-side fetch should not be cached
            }
        )

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data.wishlist
    } catch (error) {
        console.error("Error fetching shared wishlist:", error)
        return null
    }
}

