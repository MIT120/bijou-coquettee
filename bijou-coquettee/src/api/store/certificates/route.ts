import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CertificateModuleService from "../../../modules/certificate/service"

/**
 * GET /store/certificates
 * Returns active certificates ordered by sort_order
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const certificateService = req.scope.resolve<CertificateModuleService>(
            "certificateModuleService"
        )

        const certificates = await certificateService.listActiveCertificates()

        res.json({
            certificates: certificates.map((cert) => ({
                id: cert.id,
                title: cert.title,
                description: cert.description,
                image_url: cert.image_url,
                link: cert.link,
                sort_order: cert.sort_order,
            })),
        })
    } catch (error) {
        console.error("Error fetching certificates:", error)
        res.status(500).json({ error: "Failed to fetch certificates" })
    }
}
