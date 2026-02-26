import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import CheckoutPromoModuleService from "../../../modules/checkout-promo/service"

function generatePromoCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `COPROMO-${code}`
}

/**
 * GET /admin/checkout-promo
 * List all checkout promo configs
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<CheckoutPromoModuleService>(
            "checkoutPromoModuleService"
        )
        const promos = await service.listCheckoutPromoes(
            {},
            { order: { created_at: "DESC" } }
        )
        res.json({ promos })
    } catch (error) {
        console.error("Error listing checkout promos:", error)
        res.status(500).json({ error: "Failed to list checkout promos" })
    }
}

/**
 * POST /admin/checkout-promo
 * Create a new checkout promo config
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const {
            product_id,
            variant_id,
            heading,
            description,
            discount_percent,
            is_active,
        } = req.body as {
            product_id: string
            variant_id: string
            heading?: string
            description?: string
            discount_percent?: number
            is_active?: boolean
        }

        if (!product_id || !variant_id) {
            return res.status(400).json({
                error: "product_id and variant_id are required",
            })
        }

        const service = req.scope.resolve<CheckoutPromoModuleService>(
            "checkoutPromoModuleService"
        )

        let promotion_code: string | null = null
        let promotion_id: string | null = null

        // Create Medusa promotion if discount is set
        if (discount_percent && discount_percent > 0) {
            const promotionService = req.scope.resolve(Modules.PROMOTION)
            promotion_code = generatePromoCode()

            const promotion = await promotionService.createPromotions({
                code: promotion_code,
                type: "standard",
                status: "active",
                is_automatic: false,
                application_method: {
                    type: "percentage",
                    value: discount_percent,
                    target_type: "items",
                    allocation: "each",
                    target_rules: [
                        {
                            attribute: "items.variant_id",
                            operator: "in",
                            values: [variant_id],
                        },
                    ],
                },
                rules: [],
            })

            if (promotion && promotion.id) {
                promotion_id = promotion.id
            }
        }

        const [promo] = await service.createCheckoutPromoes([
            {
                product_id,
                variant_id,
                heading: heading || null,
                description: description || null,
                discount_percent: discount_percent || null,
                promotion_code,
                promotion_id,
                is_active: false,
            },
        ])

        // If is_active, enforce singleton
        if (is_active) {
            await service.activatePromo(promo.id)
        }

        const result = await service.retrieveCheckoutPromo(promo.id)
        res.status(201).json({ promo: result })
    } catch (error) {
        console.error("Error creating checkout promo:", error)
        res.status(500).json({ error: "Failed to create checkout promo" })
    }
}
