import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CheckoutPromoModuleService from "../../../modules/checkout-promo/service"

/**
 * GET /store/checkout-promo
 * Returns the active checkout promo config (public, no auth required)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<CheckoutPromoModuleService>(
            "checkoutPromoModuleService"
        )

        const promo = await service.getActivePromo()

        if (!promo) {
            return res.json({ promo: null })
        }

        res.json({
            promo: {
                id: promo.id,
                product_id: promo.product_id,
                variant_id: promo.variant_id,
                heading: promo.heading,
                description: promo.description,
                discount_percent: promo.discount_percent,
                promotion_code: promo.promotion_code,
            },
        })
    } catch (error) {
        console.error("Error fetching active checkout promo:", error)
        res.json({ promo: null })
    }
}
