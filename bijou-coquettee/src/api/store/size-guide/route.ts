import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import SizeGuideModuleService from "../../../modules/size-guide/service"

/**
 * GET /store/size-guide
 * Get all size guides
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const sizeGuideService = req.scope.resolve<SizeGuideModuleService>("sizeGuideModule")

    const category = req.query.category as string | undefined

    if (category) {
        // Get data for specific category
        const data = await sizeGuideService.getCategoryData(category)
        res.json({ data })
    } else {
        // Get all size guides
        const sizeGuides = await sizeGuideService.listSizeGuides({}, {
            order: { category: "ASC", sort_order: "ASC" },
        })
        res.json({ size_guides: sizeGuides })
    }
}

