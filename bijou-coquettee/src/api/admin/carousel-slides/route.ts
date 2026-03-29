import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CarouselSlideModuleService from "../../../modules/carousel-slide/service"

/**
 * GET /admin/carousel-slides
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<CarouselSlideModuleService>("carouselSlideModuleService")
        const slides = await service.listCarouselSlides({}, { order: { sort_order: "ASC" } })
        res.json({ slides })
    } catch (error) {
        console.error("Error listing carousel slides:", error)
        res.status(500).json({ error: "Failed to list carousel slides" })
    }
}

/**
 * POST /admin/carousel-slides
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const {
            title, subtitle, description, image_url,
            cta_text, cta_link, product_handle,
            overlay_color, overlay_opacity,
            sort_order = 0, is_active = true,
        } = req.body as {
            title: string; subtitle?: string; description?: string; image_url: string
            cta_text?: string; cta_link?: string; product_handle?: string
            overlay_color?: string; overlay_opacity?: number
            sort_order?: number; is_active?: boolean
        }

        if (!title || !image_url) {
            return res.status(400).json({ error: "Bad Request", message: "title and image_url are required" })
        }

        const service = req.scope.resolve<CarouselSlideModuleService>("carouselSlideModuleService")

        const [slide] = await service.createCarouselSlides([{
            title,
            subtitle: subtitle || null,
            description: description || null,
            image_url,
            cta_text: cta_text || null,
            cta_link: cta_link || null,
            product_handle: product_handle || null,
            overlay_color: overlay_color || null,
            overlay_opacity: overlay_opacity ?? null,
            sort_order,
            is_active,
        }])

        res.status(201).json({ slide })
    } catch (error) {
        console.error("Error creating carousel slide:", error)
        res.status(500).json({ error: "Failed to create carousel slide" })
    }
}
