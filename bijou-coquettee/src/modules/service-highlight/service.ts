import { MedusaService } from "@medusajs/framework/utils"
import ServiceHighlight from "./models/service-highlight"

class ServiceHighlightModuleService extends MedusaService({
    ServiceHighlight,
}) {
    async listActiveHighlights() {
        return this.listServiceHighlights(
            { is_active: true },
            { order: { sort_order: "ASC" } }
        )
    }

    async getAllHighlights() {
        return this.listServiceHighlights(
            {},
            { order: { sort_order: "ASC" } }
        )
    }

    async reorderHighlights(highlights: { id: string; sort_order: number }[]) {
        await this.updateServiceHighlights(
            highlights.map((h) => ({ id: h.id, sort_order: h.sort_order }))
        )
        return this.listServiceHighlights(
            {},
            { order: { sort_order: "ASC" } }
        )
    }
}

export default ServiceHighlightModuleService
