import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CmsPageModuleService from "../../../../modules/cms-page/service"

/**
 * GET /admin/cms-pages/:slug
 * Get a single CMS page with its sections
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { slug } = req.params

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        const page = await service.getPageBySlug(slug)

        if (!page) {
            return res.status(404).json({
                error: "Not Found",
                message: "Page not found",
            })
        }

        const sections = await service.listAllSections(slug)

        res.json({ page, sections })
    } catch (error) {
        console.error("Error fetching CMS page:", error)
        res.status(500).json({ error: "Failed to fetch page" })
    }
}

/**
 * PATCH /admin/cms-pages/:slug
 * Update a CMS page
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { slug } = req.params
        const updates = req.body as {
            title?: string
            seo_title?: string | null
            seo_description?: string | null
            seo_image?: string | null
            is_published?: boolean
        }

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        const page = await service.getPageBySlug(slug)

        if (!page) {
            return res.status(404).json({
                error: "Not Found",
                message: "Page not found",
            })
        }

        const updateData: Record<string, unknown> = { id: page.id }

        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.seo_title !== undefined) updateData.seo_title = updates.seo_title
        if (updates.seo_description !== undefined) updateData.seo_description = updates.seo_description
        if (updates.seo_image !== undefined) updateData.seo_image = updates.seo_image
        if (updates.is_published !== undefined) updateData.is_published = updates.is_published

        await service.updateCmsPages([updateData])

        const updated = await service.getPageBySlug(slug)

        res.json({ page: updated })
    } catch (error) {
        console.error("Error updating CMS page:", error)
        res.status(500).json({ error: "Failed to update page" })
    }
}

/**
 * DELETE /admin/cms-pages/:slug
 * Delete a CMS page and its sections
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { slug } = req.params

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        const page = await service.getPageBySlug(slug)

        if (!page) {
            return res.status(404).json({
                error: "Not Found",
                message: "Page not found",
            })
        }

        // Delete sections first
        const sections = await service.listAllSections(slug)
        if (sections.length > 0) {
            await service.deletePageSections(sections.map((s) => s.id))
        }

        await service.deleteCmsPages([page.id])

        res.json({ success: true, slug })
    } catch (error) {
        console.error("Error deleting CMS page:", error)
        res.status(500).json({ error: "Failed to delete page" })
    }
}
