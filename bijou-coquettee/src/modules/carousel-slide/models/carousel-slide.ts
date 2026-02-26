import { model } from "@medusajs/framework/utils"

const CarouselSlide = model.define("carousel_slide", {
    id: model.id().primaryKey(),
    title: model.text(),
    subtitle: model.text().nullable(),
    description: model.text().nullable(),
    image_url: model.text(),
    cta_text: model.text().nullable(),
    cta_link: model.text().nullable(),
    overlay_color: model.text().nullable(),
    overlay_opacity: model.number().nullable(),
    sort_order: model.number().default(0),
    is_active: model.boolean().default(true),
})

export default CarouselSlide
