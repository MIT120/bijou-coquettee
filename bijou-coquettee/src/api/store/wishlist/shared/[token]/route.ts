import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /store/wishlist/shared/:token
 * View public shared wishlist
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { token } = req.params

        if (!token) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Share token is required",
            })
        }

        const wishlistService = req.scope.resolve("wishlistModuleService")
        const wishlistData = await wishlistService.getSharedWishlist(token)

        if (!wishlistData) {
            return res.status(404).json({
                error: "Not Found",
                message: "Wishlist not found or not public",
            })
        }

        const { wishlist, items } = wishlistData

        // Get product details
        const query = req.scope.resolve("query")
        const productIds = items.map((item) => item.product_id)

        let products: any[] = []
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
            const product = products.find((p: any) => p.id === item.product_id)
            const variant = item.variant_id
                ? product?.variants?.find((v: any) => v.id === item.variant_id)
                : null

            return {
                id: item.id,
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
                is_public: wishlist.is_public,
                items: itemsWithProducts,
            },
        })
    } catch (error) {
        console.error("Error fetching shared wishlist:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to fetch shared wishlist",
        })
    }
}

