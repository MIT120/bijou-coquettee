import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CmsPageModuleService from "../../../../../../modules/cms-page/service"

/**
 * PATCH /admin/cms-pages/:slug/sections/:id
 * Update a section
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const updates = req.body as {
            type?: string
            content?: Record<string, unknown>
            sort_order?: number
            is_active?: boolean
        }

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        try {
            await service.retrievePageSection(id)
        } catch {
            return res.status(404).json({
                error: "Not Found",
                message: "Section not found",
            })
        }

        const updateData: Record<string, unknown> = { id }

        if (updates.type !== undefined) updateData.type = updates.type
        if (updates.content !== undefined) updateData.content = updates.content
        if (updates.sort_order !== undefined) updateData.sort_order = updates.sort_order
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active

        await service.updatePageSections([updateData])

        const section = await service.retrievePageSection(id)

        res.json({ section })
    } catch (error) {
        console.error("Error updating section:", error)
        res.status(500).json({ error: "Failed to update section" })
    }
}

/**
 * DELETE /admin/cms-pages/:slug/sections/:id
 * Delete a section
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        try {
            await service.retrievePageSection(id)
        } catch {
            return res.status(404).json({
                error: "Not Found",
                message: "Section not found",
            })
        }

        await service.deletePageSections([id])

        res.json({ success: true, id })
    } catch (error) {
        console.error("Error deleting section:", error)
        res.status(500).json({ error: "Failed to delete section" })
    }
}
