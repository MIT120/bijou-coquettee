import { model } from "@medusajs/framework/utils"

/**
 * Measurement Guide Model
 * Stores instructions for measuring different jewelry types
 */
const MeasurementGuide = model.define("measurement_guide", {
    id: model.id().primaryKey(),
    category: model.enum([
        "ring",
        "necklace",
        "bracelet",
        "chain"
    ]),
    title: model.text(),
    instructions: model.text(),
    tips: model.json().nullable(), // Array of tip strings
    image_url: model.text().nullable(),
    video_url: model.text().nullable(),
})

export default MeasurementGuide

