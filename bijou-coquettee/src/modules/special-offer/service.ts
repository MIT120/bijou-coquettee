import { MedusaService } from "@medusajs/framework/utils"
import SpecialOffer from "./models/special-offer"

class SpecialOfferModuleService extends MedusaService({
    SpecialOffer,
}) {
    async getActiveOffer() {
        const offers = await this.listSpecialOffers(
            { is_active: true },
            { take: 1 }
        )
        return offers[0] || null
    }

    async activateOffer(id: string) {
        // Deactivate all offers first (singleton enforcement)
        const allOffers = await this.listSpecialOffers({ is_active: true })
        if (allOffers.length > 0) {
            await this.updateSpecialOffers(
                allOffers.map((o) => ({ id: o.id, is_active: false }))
            )
        }
        // Activate the target
        await this.updateSpecialOffers([{ id, is_active: true }])
        return this.retrieveSpecialOffer(id)
    }

    async deactivateOffer(id: string) {
        await this.updateSpecialOffers([{ id, is_active: false }])
        return this.retrieveSpecialOffer(id)
    }
}

export default SpecialOfferModuleService
