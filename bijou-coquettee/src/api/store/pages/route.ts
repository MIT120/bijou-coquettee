import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CmsPageModuleService from "../../../modules/cms-page/service"

/**
 * GET /store/pages
 * Returns metadata for all published CMS pages, ordered by created_at DESC.
 * Sections are intentionally excluded to keep the payload lightweight.
 * Intended for use cases such as sitemaps and navigation menus.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        const pages = await service.listCmsPages(
            { is_published: true },
            { order: { created_at: "DESC" } }
        )

        res.json({
            pages: pages.map((page) => ({
                id: page.id,
                slug: page.slug,
                title: page.title,
                seo_title: page.seo_title,
                seo_description: page.seo_description,
                seo_image: page.seo_image,
            })),
        })
    } catch (error) {
        console.error("Error listing CMS pages:", error)
        res.status(500).json({ error: "Failed to list pages" })
    }
}
