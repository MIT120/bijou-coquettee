import { model } from "@medusajs/framework/utils"

const AnnouncementMessage = model.define("announcement_message", {
    id: model.id().primaryKey(),
    text: model.text(),
    sort_order: model.number().default(0),
    is_active: model.boolean().default(true),
})

export default AnnouncementMessage
