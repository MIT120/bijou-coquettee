import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /store/size-guide/[category]
 * Get size chart and measurement guide for a specific category
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const category = req.params.category
    const sizeGuideService = req.scope.resolve("sizeGuideModule")

    const data = await sizeGuideService.getCategoryData(category)

    res.json({ data })
}

