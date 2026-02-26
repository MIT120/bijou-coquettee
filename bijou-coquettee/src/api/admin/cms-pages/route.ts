import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CmsPageModuleService from "../../../modules/cms-page/service"

/**
 * GET /admin/cms-pages
 * List all CMS pages
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        const pages = await service.listCmsPages(
            {},
            { order: { created_at: "DESC" } }
        )

        // For each page, count active sections
        const pagesWithCounts = await Promise.all(
            pages.map(async (page) => {
                const sections = await service.listAllSections(page.slug)
                return {
                    ...page,
                    section_count: sections.length,
                }
            })
        )

        res.json({ pages: pagesWithCounts })
    } catch (error) {
        console.error("Error listing CMS pages:", error)
        res.status(500).json({ error: "Failed to list pages" })
    }
}

/**
 * POST /admin/cms-pages
 * Create a new CMS page
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const {
            slug,
            title,
            seo_title,
            seo_description,
            seo_image,
            is_published = false,
        } = req.body as {
            slug: string
            title: string
            seo_title?: string
            seo_description?: string
            seo_image?: string
            is_published?: boolean
        }

        if (!slug || !title) {
            return res.status(400).json({
                error: "Bad Request",
                message: "slug and title are required",
            })
        }

        // Validate slug format
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return res.status(400).json({
                error: "Bad Request",
                message: "slug must be lowercase alphanumeric with hyphens only",
            })
        }

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        // Check for duplicate slug
        const existing = await service.getPageBySlug(slug)
        if (existing) {
            return res.status(409).json({
                error: "Conflict",
                message: "A page with this slug already exists",
            })
        }

        const [page] = await service.createCmsPages([
            {
                slug,
                title,
                seo_title: seo_title || null,
                seo_description: seo_description || null,
                seo_image: seo_image || null,
                is_published,
            },
        ])

        res.status(201).json({ page })
    } catch (error) {
        console.error("Error creating CMS page:", error)
        res.status(500).json({ error: "Failed to create page" })
    }
}
