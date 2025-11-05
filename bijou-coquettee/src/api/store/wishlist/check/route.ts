import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /store/wishlist/check
 * Check if product is in wishlist (for displaying heart state)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const customerId = (req as any).auth_context?.actor_id

        // If not logged in, product is not in wishlist
        if (!customerId) {
            return res.json({
                in_wishlist: false,
            })
        }

        const { product_id, variant_id } = req.body as any

        if (!product_id) {
            return res.status(400).json({
                error: "Bad Request",
                message: "product_id is required",
            })
        }

        const wishlistService = req.scope.resolve("wishlistModuleService")
        const isInWishlist = await wishlistService.isProductInWishlist(
            customerId,
            product_id,
            variant_id
        )

        res.json({
            in_wishlist: isInWishlist,
        })
    } catch (error) {
        console.error("Error checking wishlist:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to check wishlist",
        })
    }
}

