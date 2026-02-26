import { MedusaService } from "@medusajs/framework/utils"
import Certificate from "./models/certificate"

class CertificateModuleService extends MedusaService({
    Certificate,
}) {
    async listActiveCertificates() {
        return this.listCertificates(
            { is_active: true },
            { order: { sort_order: "ASC" } }
        )
    }

    async getAllCertificates() {
        return this.listCertificates(
            {},
            { order: { sort_order: "ASC" } }
        )
    }

    async reorderCertificates(certificates: { id: string; sort_order: number }[]) {
        const updates = certificates.map((c) => ({
            id: c.id,
            sort_order: c.sort_order,
        }))

        await this.updateCertificates(updates)

        return this.listCertificates(
            {},
            { order: { sort_order: "ASC" } }
        )
    }
}

export default CertificateModuleService
