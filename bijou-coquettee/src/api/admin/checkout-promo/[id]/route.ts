import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import CheckoutPromoModuleService from "../../../../modules/checkout-promo/service"

function generatePromoCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `COPROMO-${code}`
}

/**
 * GET /admin/checkout-promo/:id
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<CheckoutPromoModuleService>(
            "checkoutPromoModuleService"
        )

        const promo = await service.retrieveCheckoutPromo(id)
        if (!promo) {
            return res.status(404).json({ error: "Promo not found" })
        }

        res.json({ promo })
    } catch (error) {
        console.error("Error retrieving checkout promo:", error)
        res.status(500).json({ error: "Failed to retrieve checkout promo" })
    }
}

/**
 * PATCH /admin/checkout-promo/:id
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<CheckoutPromoModuleService>(
            "checkoutPromoModuleService"
        )

        const existing = await service.retrieveCheckoutPromo(id)
        if (!existing) {
            return res.status(404).json({ error: "Promo not found" })
        }

        const {
            product_id,
            variant_id,
            heading,
            description,
            discount_percent,
            is_active,
        } = req.body as {
            product_id?: string
            variant_id?: string
            heading?: string | null
            description?: string | null
            discount_percent?: number | null
            is_active?: boolean
        }

        const updates: Record<string, any> = { id }

        if (product_id !== undefined) updates.product_id = product_id
        if (variant_id !== undefined) updates.variant_id = variant_id
        if (heading !== undefined) updates.heading = heading
        if (description !== undefined) updates.description = description

        // Handle discount_percent changes
        if (discount_percent !== undefined) {
            updates.discount_percent = discount_percent

            const promotionService = req.scope.resolve(Modules.PROMOTION)
            const effectiveVariantId = variant_id || existing.variant_id

            // Remove old promotion if exists
            if (existing.promotion_id) {
                try {
                    await promotionService.deletePromotions([existing.promotion_id])
                } catch (e) {
                    console.error("Failed to delete old promotion:", e)
                }
                updates.promotion_code = null
                updates.promotion_id = null
            }

            // Create new promotion if discount > 0
            if (discount_percent && discount_percent > 0) {
                const newCode = generatePromoCode()
                const promotion = await promotionService.createPromotions({
                    code: newCode,
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
                                values: [effectiveVariantId],
                            },
                        ],
                    },
                    rules: [],
                })

                if (promotion && promotion.id) {
                    updates.promotion_code = newCode
                    updates.promotion_id = promotion.id
                }
            }
        }

        await service.updateCheckoutPromoes([updates])

        // Handle activation/deactivation
        if (is_active === true) {
            await service.activatePromo(id)
        } else if (is_active === false) {
            await service.deactivatePromo(id)
        }

        const result = await service.retrieveCheckoutPromo(id)
        res.json({ promo: result })
    } catch (error) {
        console.error("Error updating checkout promo:", error)
        res.status(500).json({ error: "Failed to update checkout promo" })
    }
}

/**
 * DELETE /admin/checkout-promo/:id
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<CheckoutPromoModuleService>(
            "checkoutPromoModuleService"
        )

        const existing = await service.retrieveCheckoutPromo(id)
        if (!existing) {
            return res.status(404).json({ error: "Promo not found" })
        }

        // Cleanup promotion if exists
        if (existing.promotion_id) {
            try {
                const promotionService = req.scope.resolve(Modules.PROMOTION)
                await promotionService.deletePromotions([existing.promotion_id])
            } catch (e) {
                console.error("Failed to delete promotion:", e)
            }
        }

        await service.deleteCheckoutPromoes([id])
        res.json({ success: true })
    } catch (error) {
        console.error("Error deleting checkout promo:", error)
        res.status(500).json({ error: "Failed to delete checkout promo" })
    }
}
