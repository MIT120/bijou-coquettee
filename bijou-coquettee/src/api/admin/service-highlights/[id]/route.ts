import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ServiceHighlightModuleService from "../../../../modules/service-highlight/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<ServiceHighlightModuleService>(
            "serviceHighlightModuleService"
        )

        let highlight
        try {
            highlight = await service.retrieveServiceHighlight(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Highlight not found" })
        }

        res.json({ highlight })
    } catch (error) {
        console.error("Error fetching service highlight:", error)
        res.status(500).json({ error: "Failed to fetch service highlight" })
    }
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const updates = req.body as {
            title?: string
            description?: string | null
            icon_name?: string
            sort_order?: number
            is_active?: boolean
        }

        const service = req.scope.resolve<ServiceHighlightModuleService>(
            "serviceHighlightModuleService"
        )

        try {
            await service.retrieveServiceHighlight(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Highlight not found" })
        }

        const updateData: Record<string, unknown> = { id }
        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.icon_name !== undefined) updateData.icon_name = updates.icon_name
        if (updates.sort_order !== undefined) updateData.sort_order = updates.sort_order
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active

        await service.updateServiceHighlights([updateData])
        const highlight = await service.retrieveServiceHighlight(id)

        res.json({ highlight })
    } catch (error) {
        console.error("Error updating service highlight:", error)
        res.status(500).json({ error: "Failed to update service highlight" })
    }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<ServiceHighlightModuleService>(
            "serviceHighlightModuleService"
        )

        try {
            await service.retrieveServiceHighlight(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Highlight not found" })
        }

        await service.deleteServiceHighlights([id])
        res.json({ success: true, id })
    } catch (error) {
        console.error("Error deleting service highlight:", error)
        res.status(500).json({ error: "Failed to delete service highlight" })
    }
}
