import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import SpecialOfferModuleService from "../../../modules/special-offer/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<SpecialOfferModuleService>(
            "specialOfferModuleService"
        )
        const offers = await service.listSpecialOffers(
            {},
            { order: { created_at: "DESC" } }
        )
        res.json({ offers })
    } catch (error) {
        console.error("Error listing special offers:", error)
        res.status(500).json({ error: "Failed to list special offers" })
    }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const {
            title,
            subtitle,
            description,
            discount_code,
            discount_percent,
            cta_text,
            cta_link,
            is_active = false,
        } = req.body as {
            title: string
            subtitle?: string
            description?: string
            discount_code?: string
            discount_percent?: number
            cta_text?: string
            cta_link?: string
            is_active?: boolean
        }

        if (!title) {
            return res.status(400).json({
                error: "Bad Request",
                message: "title is required",
            })
        }

        const service = req.scope.resolve<SpecialOfferModuleService>(
            "specialOfferModuleService"
        )

        const [offer] = await service.createSpecialOffers([
            {
                title,
                subtitle: subtitle || null,
                description: description || null,
                discount_code: discount_code || null,
                discount_percent: discount_percent ?? null,
                cta_text: cta_text || null,
                cta_link: cta_link || null,
                is_active,
            },
        ])

        // If created as active, deactivate others
        if (is_active) {
            await service.activateOffer(offer.id)
        }

        res.status(201).json({ offer })
    } catch (error) {
        console.error("Error creating special offer:", error)
        res.status(500).json({ error: "Failed to create special offer" })
    }
}
