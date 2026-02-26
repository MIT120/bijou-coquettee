import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CarouselSlideModuleService from "../../../../modules/carousel-slide/service"

/**
 * POST /admin/carousel-slides/reorder
 * Reorder slides by providing new sort_order values
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { slides } = req.body as {
            slides: { id: string; sort_order: number }[]
        }

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            return res.status(400).json({
                error: "Bad Request",
                message: "slides array with id and sort_order is required",
            })
        }

        const service = req.scope.resolve<CarouselSlideModuleService>(
            "carouselSlideModuleService"
        )

        const reordered = await service.reorderSlides(slides)

        res.json({ slides: reordered })
    } catch (error) {
        console.error("Error reordering carousel slides:", error)
        res.status(500).json({ error: "Failed to reorder carousel slides" })
    }
}
