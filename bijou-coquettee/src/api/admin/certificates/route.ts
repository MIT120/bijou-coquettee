import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CertificateModuleService from "../../../modules/certificate/service"

/**
 * GET /admin/certificates
 * List all certificates ordered by sort_order
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<CertificateModuleService>(
            "certificateModuleService"
        )

        const certificates = await service.listCertificates(
            {},
            { order: { sort_order: "ASC" } }
        )

        res.json({ certificates })
    } catch (error) {
        console.error("Error listing certificates:", error)
        res.status(500).json({ error: "Failed to list certificates" })
    }
}

/**
 * POST /admin/certificates
 * Create a new certificate
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const {
            title,
            description,
            image_url,
            link,
            sort_order = 0,
            is_active = true,
        } = req.body as {
            title: string
            description?: string
            image_url: string
            link?: string
            sort_order?: number
            is_active?: boolean
        }

        if (!title || !image_url) {
            return res.status(400).json({
                error: "Bad Request",
                message: "title and image_url are required",
            })
        }

        const service = req.scope.resolve<CertificateModuleService>(
            "certificateModuleService"
        )

        const [certificate] = await service.createCertificates([
            {
                title,
                description: description || null,
                image_url,
                link: link || null,
                sort_order,
                is_active,
            },
        ])

        res.status(201).json({ certificate })
    } catch (error) {
        console.error("Error creating certificate:", error)
        res.status(500).json({ error: "Failed to create certificate" })
    }
}
