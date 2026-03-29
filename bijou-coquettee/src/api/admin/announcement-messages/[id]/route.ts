import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import AnnouncementMessageModuleService from "../../../../modules/announcement-message/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<AnnouncementMessageModuleService>(
            "announcementMessageModuleService"
        )

        let message
        try {
            message = await service.retrieveAnnouncementMessage(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Message not found" })
        }

        res.json({ message })
    } catch (error) {
        console.error("Error fetching announcement message:", error)
        res.status(500).json({ error: "Failed to fetch announcement message" })
    }
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const updates = req.body as {
            text?: string
            sort_order?: number
            is_active?: boolean
        }

        const service = req.scope.resolve<AnnouncementMessageModuleService>(
            "announcementMessageModuleService"
        )

        try {
            await service.retrieveAnnouncementMessage(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Message not found" })
        }

        const updateData: Record<string, unknown> = { id }
        if (updates.text !== undefined) updateData.text = updates.text
        if (updates.sort_order !== undefined) updateData.sort_order = updates.sort_order
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active

        await service.updateAnnouncementMessages([updateData])
        const message = await service.retrieveAnnouncementMessage(id)

        res.json({ message })
    } catch (error) {
        console.error("Error updating announcement message:", error)
        res.status(500).json({ error: "Failed to update announcement message" })
    }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const service = req.scope.resolve<AnnouncementMessageModuleService>(
            "announcementMessageModuleService"
        )

        try {
            await service.retrieveAnnouncementMessage(id)
        } catch {
            return res.status(404).json({ error: "Not Found", message: "Message not found" })
        }

        await service.deleteAnnouncementMessages([id])
        res.json({ success: true, id })
    } catch (error) {
        console.error("Error deleting announcement message:", error)
        res.status(500).json({ error: "Failed to delete announcement message" })
    }
}
