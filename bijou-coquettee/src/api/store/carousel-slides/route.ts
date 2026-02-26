import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CarouselSlideModuleService from "../../../modules/carousel-slide/service"

/**
 * GET /store/carousel-slides
 * Returns active slides ordered by sort_order
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const carouselService = req.scope.resolve<CarouselSlideModuleService>(
            "carouselSlideModuleService"
        )

        const slides = await carouselService.listActiveSlides()

        res.json({
            slides: slides.map((slide) => ({
                id: slide.id,
                title: slide.title,
                subtitle: slide.subtitle,
                description: slide.description,
                image_url: slide.image_url,
                cta_text: slide.cta_text,
                cta_link: slide.cta_link,
                overlay_color: slide.overlay_color,
                overlay_opacity: slide.overlay_opacity,
                sort_order: slide.sort_order,
            })),
        })
    } catch (error) {
        console.error("Error fetching carousel slides:", error)
        res.status(500).json({ error: "Failed to fetch carousel slides" })
    }
}
