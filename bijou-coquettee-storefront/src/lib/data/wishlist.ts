const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const LOCAL_STORAGE_KEY = "bijou_guest_wishlist"

/**
 * Wishlist API Response Types
 */
export type WishlistItem = {
    id: string
    wishlist_id: string
    product_id: string
    variant_id: string | null
    added_at: string
    product?: any
    variant?: any | null
}

export type Wishlist = {
    id: string
    customer_id: string | null
    is_public: boolean
    share_token: string | null
    items: WishlistItem[]
}

/**
 * Local storage wishlist item (minimal data stored locally)
 */
type LocalWishlistItem = {
    id: string
    product_id: string
    variant_id: string | null
    added_at: string
}

/**
 * Get guest wishlist from local storage
 */
function getLocalWishlist(): LocalWishlistItem[] {
    if (typeof window === "undefined") return []
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

/**
 * Save guest wishlist to local storage
 */
function saveLocalWishlist(items: LocalWishlistItem[]): void {
    if (typeof window === "undefined") return
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
        console.error("Error saving wishlist to local storage:", error)
    }
}

/**
 * Generate a unique ID for local wishlist items
 */
function generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get customer's wishlist (for authenticated users)
 */
export async function getWishlist(): Promise<Wishlist | null> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    try {
        if (!BACKEND_URL) {
            console.error("Backend URL is not configured")
            return null
        }

        const response = await fetch(`${BACKEND_URL}/store/wishlist`, {
            headers,
            credentials: "include",
            cache: "no-store",
        })

        if (response.status === 401) {
            // Not authenticated - return null (caller should use local wishlist)
            return null
        }

        if (!response.ok) {
            console.error("Failed to fetch wishlist:", response.status)
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
 * Get local wishlist as Wishlist type (for guests)
 */
export function getLocalWishlistAsWishlist(): Wishlist {
    const items = getLocalWishlist()
    return {
        id: "local",
        customer_id: null,
        is_public: false,
        share_token: null,
        items: items.map((item) => ({
            ...item,
            wishlist_id: "local",
            product: undefined,
            variant: undefined,
        })),
    }
}

/**
 * Add item to local wishlist (for guests)
 */
export function addToLocalWishlist(
    productId: string,
    variantId?: string
): LocalWishlistItem {
    const items = getLocalWishlist()

    // Check if already exists
    const exists = items.some(
        (item) =>
            item.product_id === productId &&
            (variantId ? item.variant_id === variantId : true)
    )

    if (exists) {
        return items.find(
            (item) =>
                item.product_id === productId &&
                (variantId ? item.variant_id === variantId : true)
        )!
    }

    const newItem: LocalWishlistItem = {
        id: generateLocalId(),
        product_id: productId,
        variant_id: variantId || null,
        added_at: new Date().toISOString(),
    }

    items.push(newItem)
    saveLocalWishlist(items)
    return newItem
}

/**
 * Remove item from local wishlist (for guests)
 */
export function removeFromLocalWishlist(itemId: string): boolean {
    const items = getLocalWishlist()
    const filtered = items.filter((item) => item.id !== itemId)

    if (filtered.length === items.length) {
        return false // Item not found
    }

    saveLocalWishlist(filtered)
    return true
}

/**
 * Remove item from local wishlist by product ID (for guests)
 */
export function removeFromLocalWishlistByProductId(
    productId: string,
    variantId?: string
): boolean {
    const items = getLocalWishlist()
    const filtered = items.filter(
        (item) =>
            !(
                item.product_id === productId &&
                (variantId ? item.variant_id === variantId : true)
            )
    )

    if (filtered.length === items.length) {
        return false // Item not found
    }

    saveLocalWishlist(filtered)
    return true
}

/**
 * Clear local wishlist
 */
export function clearLocalWishlist(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(LOCAL_STORAGE_KEY)
}

/**
 * Check if product is in local wishlist
 */
export function isInLocalWishlist(
    productId: string,
    variantId?: string
): boolean {
    const items = getLocalWishlist()
    return items.some(
        (item) =>
            item.product_id === productId &&
            (variantId ? item.variant_id === variantId : true)
    )
}

/**
 * Get local wishlist item IDs (product IDs)
 */
export function getLocalWishlistProductIds(): string[] {
    return getLocalWishlist().map((item) => item.product_id)
}

/**
 * Add item to wishlist (authenticated)
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
 * Remove item from wishlist (authenticated)
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
 * Check if product is in wishlist (authenticated)
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
 * Clear entire wishlist (authenticated)
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
                cache: "no-store",
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
