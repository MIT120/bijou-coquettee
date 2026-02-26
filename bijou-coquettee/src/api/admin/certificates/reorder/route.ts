import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CertificateModuleService from "../../../../modules/certificate/service"

/**
 * POST /admin/certificates/reorder
 * Reorder certificates by providing new sort_order values
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { certificates } = req.body as {
            certificates: { id: string; sort_order: number }[]
        }

        if (!certificates || !Array.isArray(certificates) || certificates.length === 0) {
            return res.status(400).json({
                error: "Bad Request",
                message: "certificates array with id and sort_order is required",
            })
        }

        const service = req.scope.resolve<CertificateModuleService>(
            "certificateModuleService"
        )

        const reordered = await service.reorderCertificates(certificates)

        res.json({ certificates: reordered })
    } catch (error) {
        console.error("Error reordering certificates:", error)
        res.status(500).json({ error: "Failed to reorder certificates" })
    }
}
