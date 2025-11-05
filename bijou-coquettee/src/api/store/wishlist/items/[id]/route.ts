import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * DELETE /store/wishlist/items/:id
 * Remove item from wishlist
 */
export async function DELETE(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const customerId = (req as any).auth_context?.actor_id

        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Please log in to remove items from wishlist",
            })
        }

        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Item ID is required",
            })
        }

        const wishlistService = req.scope.resolve("wishlistModuleService")
        await wishlistService.removeItemFromWishlist(id)

        res.json({
            success: true,
            message: "Item removed from wishlist",
        })
    } catch (error) {
        console.error("Error removing item from wishlist:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to remove item from wishlist",
        })
    }
}

