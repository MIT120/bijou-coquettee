import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type EcontShippingModuleService from "../../../../modules/econt-shipping/service"

const SUPPORTED_TYPES = new Set(["office", "city", "street"])

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const {
        query: { type = "office", search, city, limit },
    } = req

    if (typeof type !== "string" || !SUPPORTED_TYPES.has(type)) {
        res.status(400).json({
            message:
                "Invalid type provided. Supported values: office, city, street.",
        })
        return
    }

    const econtService =
        req.scope.resolve<EcontShippingModuleService>(
            "econtShippingModuleService"
        )

    const locations = await econtService.searchLocations({
        type: type as "office" | "city" | "street",
        search: typeof search === "string" ? search : undefined,
        city: typeof city === "string" ? city : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        countryCode: "BGR",
    })

    res.json({
        locations,
    })
}

