import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import AnnouncementMessageModuleService from "../../../../modules/announcement-message/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { messages } = req.body as {
            messages: { id: string; sort_order: number }[]
        }

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: "Bad Request",
                message: "messages array is required",
            })
        }

        const service = req.scope.resolve<AnnouncementMessageModuleService>(
            "announcementMessageModuleService"
        )

        const result = await service.reorderMessages(messages)
        res.json({ messages: result })
    } catch (error) {
        console.error("Error reordering announcement messages:", error)
        res.status(500).json({ error: "Failed to reorder announcement messages" })
    }
}
