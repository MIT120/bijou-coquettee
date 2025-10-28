import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /store/wishlist/items
 * Add item to wishlist
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const customerId = req.auth_context?.actor_id

        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Please log in to add items to wishlist",
            })
        }

        const { product_id, variant_id } = req.body

        if (!product_id) {
            return res.status(400).json({
                error: "Bad Request",
                message: "product_id is required",
            })
        }

        const wishlistService = req.scope.resolve("wishlistModuleService")
        const item = await wishlistService.addItemToWishlist(
            customerId,
            product_id,
            variant_id
        )

        res.json({
            success: true,
            item: {
                id: item.id,
                wishlist_id: item.wishlist_id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                added_at: item.added_at,
            },
        })
    } catch (error) {
        console.error("Error adding item to wishlist:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to add item to wishlist",
        })
    }
}

