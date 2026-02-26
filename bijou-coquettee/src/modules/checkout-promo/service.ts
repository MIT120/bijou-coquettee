import { MedusaService } from "@medusajs/framework/utils"
import CheckoutPromo from "./models/checkout-promo"

class CheckoutPromoModuleService extends MedusaService({
    CheckoutPromo,
}) {
    async getActivePromo() {
        const promos = await this.listCheckoutPromoes(
            { is_active: true },
            { take: 1 }
        )
        return promos[0] || null
    }

    async activatePromo(id: string) {
        // Deactivate all promos first (singleton enforcement)
        const allPromos = await this.listCheckoutPromoes({ is_active: true })
        if (allPromos.length > 0) {
            await this.updateCheckoutPromoes(
                allPromos.map((p) => ({ id: p.id, is_active: false }))
            )
        }
        // Activate the target
        await this.updateCheckoutPromoes([{ id, is_active: true }])
        return this.retrieveCheckoutPromo(id)
    }

    async deactivatePromo(id: string) {
        await this.updateCheckoutPromoes([{ id, is_active: false }])
        return this.retrieveCheckoutPromo(id)
    }
}

export default CheckoutPromoModuleService
