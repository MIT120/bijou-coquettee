import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /store/wishlist
 * Get customer's wishlist with all items
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        // Get customer ID from auth
        const customerId = req.auth_context?.actor_id

        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Please log in to view your wishlist",
            })
        }

        // Get wishlist service
        const wishlistService = req.scope.resolve("wishlistModuleService")

        // Get wishlist with items
        const { wishlist, items } = await wishlistService.getWishlistWithItems(
            customerId
        )

        // Get product details for each item
        const query = req.scope.resolve("query")
        const productIds = items.map((item) => item.product_id)

        let products = []
        if (productIds.length > 0) {
            const { data } = await query.graph({
                entity: "product",
                fields: [
                    "id",
                    "title",
                    "handle",
                    "description",
                    "thumbnail",
                    "variants.*",
                    "images.*",
                ],
                filters: {
                    id: productIds,
                },
            })
            products = data
        }

        // Merge items with product details
        const itemsWithProducts = items.map((item) => {
            const product = products.find((p) => p.id === item.product_id)
            const variant = item.variant_id
                ? product?.variants?.find((v) => v.id === item.variant_id)
                : null

            return {
                id: item.id,
                wishlist_id: item.wishlist_id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                added_at: item.added_at,
                product,
                variant,
            }
        })

        res.json({
            wishlist: {
                id: wishlist.id,
                customer_id: wishlist.customer_id,
                is_public: wishlist.is_public,
                share_token: wishlist.share_token,
                items: itemsWithProducts,
            },
        })
    } catch (error) {
        console.error("Error fetching wishlist:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to fetch wishlist",
        })
    }
}

/**
 * DELETE /store/wishlist
 * Clear all items from wishlist
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const customerId = req.auth_context?.actor_id

        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Please log in to clear your wishlist",
            })
        }

        const wishlistService = req.scope.resolve("wishlistModuleService")
        const result = await wishlistService.clearWishlist(customerId)

        res.json({
            success: true,
            message: `Cleared ${result.deletedCount} items from wishlist`,
        })
    } catch (error) {
        console.error("Error clearing wishlist:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to clear wishlist",
        })
    }
}

