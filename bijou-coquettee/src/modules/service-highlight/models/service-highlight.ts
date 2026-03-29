import { model } from "@medusajs/framework/utils"

const ServiceHighlight = model.define("service_highlight", {
    id: model.id().primaryKey(),
    title: model.text(),
    description: model.text().nullable(),
    icon_name: model.text().default("shipping"),
    sort_order: model.number().default(0),
    is_active: model.boolean().default(true),
})

export default ServiceHighlight
