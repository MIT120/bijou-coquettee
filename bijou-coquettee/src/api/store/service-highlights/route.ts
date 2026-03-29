import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ServiceHighlightModuleService from "../../../modules/service-highlight/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<ServiceHighlightModuleService>(
            "serviceHighlightModuleService"
        )

        const highlights = await service.listActiveHighlights()

        res.json({
            highlights: highlights.map((h) => ({
                id: h.id,
                title: h.title,
                description: h.description,
                icon_name: h.icon_name,
                sort_order: h.sort_order,
            })),
        })
    } catch (error) {
        console.error("Error fetching service highlights:", error)
        res.status(500).json({ error: "Failed to fetch service highlights" })
    }
}
