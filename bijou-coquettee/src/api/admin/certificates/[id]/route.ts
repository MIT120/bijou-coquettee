import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CertificateModuleService from "../../../../modules/certificate/service"

/**
 * GET /admin/certificates/:id
 * Get a single certificate
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params

        const service = req.scope.resolve<CertificateModuleService>(
            "certificateModuleService"
        )

        let certificate
        try {
            certificate = await service.retrieveCertificate(id)
        } catch {
            return res.status(404).json({
                error: "Not Found",
                message: "Certificate not found",
            })
        }

        res.json({ certificate })
    } catch (error) {
        console.error("Error fetching certificate:", error)
        res.status(500).json({ error: "Failed to fetch certificate" })
    }
}

/**
 * PATCH /admin/certificates/:id
 * Update a certificate
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const updates = req.body as {
            title?: string
            description?: string | null
            image_url?: string
            link?: string | null
            sort_order?: number
            is_active?: boolean
        }

        const service = req.scope.resolve<CertificateModuleService>(
            "certificateModuleService"
        )

        try {
            await service.retrieveCertificate(id)
        } catch {
            return res.status(404).json({
                error: "Not Found",
                message: "Certificate not found",
            })
        }

        const updateData: Record<string, unknown> = { id }

        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.image_url !== undefined) updateData.image_url = updates.image_url
        if (updates.link !== undefined) updateData.link = updates.link
        if (updates.sort_order !== undefined) updateData.sort_order = updates.sort_order
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active

        await service.updateCertificates([updateData])

        const certificate = await service.retrieveCertificate(id)

        res.json({ certificate })
    } catch (error) {
        console.error("Error updating certificate:", error)
        res.status(500).json({ error: "Failed to update certificate" })
    }
}

/**
 * DELETE /admin/certificates/:id
 * Delete a certificate
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params

        const service = req.scope.resolve<CertificateModuleService>(
            "certificateModuleService"
        )

        try {
            await service.retrieveCertificate(id)
        } catch {
            return res.status(404).json({
                error: "Not Found",
                message: "Certificate not found",
            })
        }

        await service.deleteCertificates([id])

        res.json({ success: true, id })
    } catch (error) {
        console.error("Error deleting certificate:", error)
        res.status(500).json({ error: "Failed to delete certificate" })
    }
}
