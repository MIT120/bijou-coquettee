"use server"

import { getAuthHeaders, getCacheOptions } from "./cookies-server"

const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "http://localhost:9000"

export type ProductComment = {
    id: string
    product_id: string
    author_name: string | null
    content: string
    created_at: string
}

export type ProductCommentsResponse = {
    comments: ProductComment[]
    count: number
    limit: number
    offset: number
}

/**
 * Fetch comments for a product from the Medusa backend
 */
export async function getProductComments(
    productId: string,
    options?: { limit?: number }
): Promise<ProductCommentsResponse> {
    if (!productId) {
        return {
            comments: [],
            count: 0,
            limit: options?.limit ?? 20,
            offset: 0,
        }
    }

    const headers: Record<string, string> = {
        ...(await getAuthHeaders()),
    }

    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    const url = new URL(
        `${BACKEND_URL}/store/products/${productId}/comments`
    )

    const limit = options?.limit ?? 20
    url.searchParams.set("limit", limit.toString())

    const next = {
        ...(await getCacheOptions(`product-comments:${productId}`)),
    }

    try {
        const response = await fetch(url.toString(), {
            headers,
            cache: "no-store",
            next,
        })

        if (!response.ok) {
            console.error("Failed to fetch product comments", {
                status: response.status,
                statusText: response.statusText,
                productId,
            })

            return {
                comments: [],
                count: 0,
                limit,
                offset: 0,
            }
        }

        const data = (await response.json()) as ProductCommentsResponse
        return data
    } catch (error) {
        console.error("Error fetching product comments", { error, productId })
        return {
            comments: [],
            count: 0,
            limit,
            offset: 0,
        }
    }
}


