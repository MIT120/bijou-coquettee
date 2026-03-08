import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CmsPageModuleService from "../../../../../modules/cms-page/service"

const VALID_SECTION_TYPES = [
    "hero",
    "rich_text",
    "image_text",
    "gallery",
    "stats",
    "team",
    "cta",
    "accordion",
    "video",
    "file_download",
    "testimonial",
    "feature_grid",
    "divider",
    "banner",
    "logo_grid",
    "certificates",
]

/**
 * GET /admin/cms-pages/:slug/sections
 * List all sections for a page
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { slug } = req.params

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        const sections = await service.listAllSections(slug)

        res.json({ sections })
    } catch (error) {
        console.error("Error listing sections:", error)
        res.status(500).json({ error: "Failed to list sections" })
    }
}

/**
 * POST /admin/cms-pages/:slug/sections
 * Create a new section for a page
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { slug } = req.params
        const {
            type,
            content = {},
            sort_order = 0,
            is_active = true,
        } = req.body as {
            type: string
            content?: Record<string, unknown>
            sort_order?: number
            is_active?: boolean
        }

        if (!type) {
            return res.status(400).json({
                error: "Bad Request",
                message: "type is required",
            })
        }

        if (!VALID_SECTION_TYPES.includes(type)) {
            return res.status(400).json({
                error: "Bad Request",
                message: `type must be one of: ${VALID_SECTION_TYPES.join(", ")}`,
            })
        }

        const service = req.scope.resolve<CmsPageModuleService>(
            "cmsPageModuleService"
        )

        // Verify page exists
        const page = await service.getPageBySlug(slug)
        if (!page) {
            return res.status(404).json({
                error: "Not Found",
                message: "Page not found",
            })
        }

        const [section] = await service.createPageSections([
            {
                page_slug: slug,
                type,
                content,
                sort_order,
                is_active,
            },
        ])

        res.status(201).json({ section })
    } catch (error) {
        console.error("Error creating section:", error)
        res.status(500).json({ error: "Failed to create section" })
    }
}
