import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CarouselSlideModuleService from "../../../../modules/carousel-slide/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<CarouselSlideModuleService>("carouselSlideModuleService")
        let slide
        try {
            slide = await service.retrieveCarouselSlide(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Slide not found" })
        }
        res.json({ slide })
    } catch (error) {
        console.error("Error fetching carousel slide:", error)
        res.status(500).json({ error: "Failed to fetch carousel slide" })
    }
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const updates = req.body as {
            title?: string; subtitle?: string | null; description?: string | null
            image_url?: string; cta_text?: string | null; cta_link?: string | null
            product_handle?: string | null
            overlay_color?: string | null; overlay_opacity?: number | null
            sort_order?: number; is_active?: boolean
        }

        const service = req.scope.resolve<CarouselSlideModuleService>("carouselSlideModuleService")

        try {
            await service.retrieveCarouselSlide(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Slide not found" })
        }

        const updateData: Record<string, unknown> = { id }
        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.image_url !== undefined) updateData.image_url = updates.image_url
        if (updates.cta_text !== undefined) updateData.cta_text = updates.cta_text
        if (updates.cta_link !== undefined) updateData.cta_link = updates.cta_link
        if (updates.product_handle !== undefined) updateData.product_handle = updates.product_handle
        if (updates.overlay_color !== undefined) updateData.overlay_color = updates.overlay_color
        if (updates.overlay_opacity !== undefined) updateData.overlay_opacity = updates.overlay_opacity
        if (updates.sort_order !== undefined) updateData.sort_order = updates.sort_order
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active

        await service.updateCarouselSlides([updateData])
        const slide = await service.retrieveCarouselSlide(id)
        res.json({ slide })
    } catch (error) {
        console.error("Error updating carousel slide:", error)
        res.status(500).json({ error: "Failed to update carousel slide" })
    }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<CarouselSlideModuleService>("carouselSlideModuleService")
        try {
            await service.retrieveCarouselSlide(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Slide not found" })
        }
        await service.deleteCarouselSlides([id])
        res.json({ success: true, id })
    } catch (error) {
        console.error("Error deleting carousel slide:", error)
        res.status(500).json({ error: "Failed to delete carousel slide" })
    }
}
