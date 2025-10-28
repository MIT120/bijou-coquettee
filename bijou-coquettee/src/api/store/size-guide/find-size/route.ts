import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /store/size-guide/find-size
 * Find size based on measurement
 * 
 * Body:
 * {
 *   category: "ring" | "necklace" | "bracelet" | "chain",
 *   measurement: number,
 *   measurementType: "circumference_mm" | "diameter_mm" | "length_cm"
 * }
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { category, measurement, measurementType } = req.body

    if (!category || !measurement || !measurementType) {
        res.status(400).json({
            error: "Missing required fields: category, measurement, measurementType"
        })
        return
    }

    const sizeGuideService = req.scope.resolve("sizeGuideModule")

    const size = await sizeGuideService.findSizeByMeasurement(
        category,
        measurement,
        measurementType
    )

    if (!size) {
        res.status(404).json({
            error: "No size found for the given measurement"
        })
        return
    }

    res.json({ size })
}

