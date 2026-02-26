import { model } from "@medusajs/framework/utils"

const Certificate = model.define("certificate", {
    id: model.id().primaryKey(),
    title: model.text(),
    description: model.text().nullable(),
    image_url: model.text(),
    link: model.text().nullable(),
    sort_order: model.number().default(0),
    is_active: model.boolean().default(true),
})

export default Certificate
