import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import AnnouncementMessageModuleService from "../../../modules/announcement-message/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<AnnouncementMessageModuleService>(
            "announcementMessageModuleService"
        )
        const messages = await service.getAllMessages()
        res.json({ messages })
    } catch (error) {
        console.error("Error listing announcement messages:", error)
        res.status(500).json({ error: "Failed to list announcement messages" })
    }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { text, sort_order = 0, is_active = true } = req.body as {
            text: string
            sort_order?: number
            is_active?: boolean
        }

        if (!text) {
            return res.status(400).json({
                error: "Bad Request",
                message: "text is required",
            })
        }

        const service = req.scope.resolve<AnnouncementMessageModuleService>(
            "announcementMessageModuleService"
        )

        const [message] = await service.createAnnouncementMessages([
            { text, sort_order, is_active },
        ])

        res.status(201).json({ message })
    } catch (error) {
        console.error("Error creating announcement message:", error)
        res.status(500).json({ error: "Failed to create announcement message" })
    }
}
