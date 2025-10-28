import { getAuthHeaders } from "./cookies"

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
 */
export async function getWishlist(): Promise<Wishlist | null> {
    const headers = {
        ...getAuthHeaders(),
    }

    try {
        const response = await fetch(`${BACKEND_URL}/store/wishlist`, {
            headers,
            next: { tags: ["wishlist"] },
            credentials: "include",
        })

        if (response.status === 401) {
            // Not authenticated
            return null
        }

        if (!response.ok) {
            console.error("Failed to fetch wishlist:", response.statusText)
            return null
        }

        const data = await response.json()
        return data.wishlist
    } catch (error) {
        console.error("Error fetching wishlist:", error)
        return null
    }
}

/**
 * Add item to wishlist
 */
export async function addToWishlist(
    productId: string,
    variantId?: string
): Promise<boolean> {
    const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
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
    const headers = {
        ...getAuthHeaders(),
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
    const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
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
    const headers = {
        ...getAuthHeaders(),
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
    const headers = {
        ...getAuthHeaders(),
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
                next: { tags: [`wishlist-${token}`] },
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

