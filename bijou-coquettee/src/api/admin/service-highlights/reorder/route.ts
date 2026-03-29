import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ServiceHighlightModuleService from "../../../../modules/service-highlight/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { highlights } = req.body as {
            highlights: { id: string; sort_order: number }[]
        }

        if (!highlights || !Array.isArray(highlights)) {
            return res.status(400).json({
                error: "Bad Request",
                message: "highlights array is required",
            })
        }

        const service = req.scope.resolve<ServiceHighlightModuleService>(
            "serviceHighlightModuleService"
        )

        const result = await service.reorderHighlights(highlights)
        res.json({ highlights: result })
    } catch (error) {
        console.error("Error reordering service highlights:", error)
        res.status(500).json({ error: "Failed to reorder service highlights" })
    }
}
