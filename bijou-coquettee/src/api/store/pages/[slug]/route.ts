import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CmsPageModuleService from "../../../../modules/cms-page/service"

/**
 * GET /store/pages/:slug
 * Returns a published page with its active sections
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { slug } = req.params

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        const page = await service.getPublishedPage(slug)

        if (!page) {
            return res.status(404).json({
                error: "Not Found",
                message: "Page not found",
            })
        }

        const sections = await service.listActiveSections(slug)

        res.json({
            page: {
                id: page.id,
                slug: page.slug,
                title: page.title,
                seo_title: page.seo_title,
                seo_description: page.seo_description,
                seo_image: page.seo_image,
                is_published: page.is_published,
            },
            sections: sections.map((s) => ({
                id: s.id,
                type: s.type,
                content: s.content,
                sort_order: s.sort_order,
            })),
        })
    } catch (error) {
        console.error("Error fetching CMS page:", error)
        res.status(500).json({ error: "Failed to fetch page" })
    }
}
