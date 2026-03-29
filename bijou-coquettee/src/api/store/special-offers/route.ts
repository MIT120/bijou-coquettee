import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import SpecialOfferModuleService from "../../../modules/special-offer/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<SpecialOfferModuleService>(
            "specialOfferModuleService"
        )

        const offer = await service.getActiveOffer()

        res.json({
            offer: offer
                ? {
                      id: offer.id,
                      title: offer.title,
                      subtitle: offer.subtitle,
                      description: offer.description,
                      discount_code: offer.discount_code,
                      discount_percent: offer.discount_percent,
                      cta_text: offer.cta_text,
                      cta_link: offer.cta_link,
                  }
                : null,
        })
    } catch (error) {
        console.error("Error fetching special offer:", error)
        res.status(500).json({ error: "Failed to fetch special offer" })
    }
}
