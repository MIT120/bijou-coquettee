import { model } from "@medusajs/framework/utils"

const SpecialOffer = model.define("special_offer", {
    id: model.id().primaryKey(),
    title: model.text(),
    subtitle: model.text().nullable(),
    description: model.text().nullable(),
    discount_code: model.text().nullable(),
    discount_percent: model.number().nullable(),
    cta_text: model.text().nullable(),
    cta_link: model.text().nullable(),
    is_active: model.boolean().default(false),
})

export default SpecialOffer
