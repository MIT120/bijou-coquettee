import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import AnnouncementMessageModuleService from "../../../modules/announcement-message/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<AnnouncementMessageModuleService>(
            "announcementMessageModuleService"
        )

        const messages = await service.listActiveMessages()

        res.json({
            messages: messages.map((m) => ({
                id: m.id,
                text: m.text,
                sort_order: m.sort_order,
            })),
        })
    } catch (error) {
        console.error("Error fetching announcement messages:", error)
        res.status(500).json({ error: "Failed to fetch announcement messages" })
    }
}
