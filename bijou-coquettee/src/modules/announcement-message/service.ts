import { MedusaService } from "@medusajs/framework/utils"
import AnnouncementMessage from "./models/announcement-message"

class AnnouncementMessageModuleService extends MedusaService({
    AnnouncementMessage,
}) {
    async listActiveMessages() {
        return this.listAnnouncementMessages(
            { is_active: true },
            { order: { sort_order: "ASC" } }
        )
    }

    async getAllMessages() {
        return this.listAnnouncementMessages(
            {},
            { order: { sort_order: "ASC" } }
        )
    }

    async reorderMessages(messages: { id: string; sort_order: number }[]) {
        await this.updateAnnouncementMessages(
            messages.map((m) => ({ id: m.id, sort_order: m.sort_order }))
        )
        return this.listAnnouncementMessages(
            {},
            { order: { sort_order: "ASC" } }
        )
    }
}

export default AnnouncementMessageModuleService
