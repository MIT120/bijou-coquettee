import { model } from "@medusajs/framework/utils"

/**
 * Size Guide Model
 * Stores size conversion data for different jewelry categories
 */
const SizeGuide = model.define("size_guide", {
    id: model.id().primaryKey(),
    category: model.enum([
        "ring",
        "necklace",
        "bracelet",
        "chain"
    ]),
    size_us: model.text().nullable(),
    size_uk: model.text().nullable(),
    size_eu: model.text().nullable(),
    size_asia: model.text().nullable(),
    circumference_mm: model.number().nullable(),
    diameter_mm: model.number().nullable(),
    length_cm: model.number().nullable(), // For necklaces/bracelets
    description: model.text().nullable(),
    sort_order: model.number().default(0),
})

export default SizeGuide
