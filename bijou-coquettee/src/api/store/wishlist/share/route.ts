import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /store/wishlist/share
 * Generate share token for public wishlist
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const customerId = (req as any).auth_context?.actor_id

        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Please log in to share your wishlist",
            })
        }

        const wishlistService = req.scope.resolve("wishlistModuleService")
        const token = await wishlistService.generateShareToken(customerId)

        // Generate full share URL
        const baseUrl = process.env.STORE_URL || "http://localhost:3000"
        const shareUrl = `${baseUrl}/wishlist/shared/${token}`

        res.json({
            success: true,
            token,
            shareUrl,
        })
    } catch (error) {
        console.error("Error generating share token:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to generate share link",
        })
    }
}

