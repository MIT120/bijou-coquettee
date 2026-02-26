import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CmsPageModuleService from "../../../../../../modules/cms-page/service"

/**
 * POST /admin/cms-pages/:slug/sections/reorder
 * Reorder sections by providing new sort_order values
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { slug } = req.params
        const { sections } = req.body as {
            sections: { id: string; sort_order: number }[]
        }

        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({
                error: "Bad Request",
                message: "sections array with id and sort_order is required",
            })
        }

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        await service.reorderSections(sections)

        const reordered = await service.listAllSections(slug)

        res.json({ sections: reordered })
    } catch (error) {
        console.error("Error reordering sections:", error)
        res.status(500).json({ error: "Failed to reorder sections" })
    }
}
