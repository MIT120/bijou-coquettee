import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import SpecialOfferModuleService from "../../../../modules/special-offer/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<SpecialOfferModuleService>(
            "specialOfferModuleService"
        )

        let offer
        try {
            offer = await service.retrieveSpecialOffer(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Offer not found" })
        }

        res.json({ offer })
    } catch (error) {
        console.error("Error fetching special offer:", error)
        res.status(500).json({ error: "Failed to fetch special offer" })
    }
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const updates = req.body as {
            title?: string
            subtitle?: string | null
            description?: string | null
            discount_code?: string | null
            discount_percent?: number | null
            cta_text?: string | null
            cta_link?: string | null
            is_active?: boolean
        }

        const service = req.scope.resolve<SpecialOfferModuleService>(
            "specialOfferModuleService"
        )

        try {
            await service.retrieveSpecialOffer(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Offer not found" })
        }

        // Handle activation with singleton enforcement
        if (updates.is_active === true) {
            await service.activateOffer(id)
        } else if (updates.is_active === false) {
            await service.deactivateOffer(id)
        }

        const updateData: Record<string, unknown> = { id }
        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.discount_code !== undefined) updateData.discount_code = updates.discount_code
        if (updates.discount_percent !== undefined) updateData.discount_percent = updates.discount_percent
        if (updates.cta_text !== undefined) updateData.cta_text = updates.cta_text
        if (updates.cta_link !== undefined) updateData.cta_link = updates.cta_link

        await service.updateSpecialOffers([updateData])
        const offer = await service.retrieveSpecialOffer(id)

        res.json({ offer })
    } catch (error) {
        console.error("Error updating special offer:", error)
        res.status(500).json({ error: "Failed to update special offer" })
    }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<SpecialOfferModuleService>(
            "specialOfferModuleService"
        )

        try {
            await service.retrieveSpecialOffer(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Offer not found" })
        }

        await service.deleteSpecialOffers([id])
        res.json({ success: true, id })
    } catch (error) {
        console.error("Error deleting special offer:", error)
        res.status(500).json({ error: "Failed to delete special offer" })
    }
}
