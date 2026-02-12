import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type EcontShippingModuleService from "../../../../../../modules/econt-shipping/service"

type RouteParams = { id: string }

/**
 * Sync shipment status from the Econt API.
 * Updates tracking information and delivery status.
 */
export async function POST(
    req: MedusaRequest<RouteParams>,
    res: MedusaResponse
) {
    const { id } = req.params
    const body = req.body as { force?: boolean }

    const econtService = req.scope.resolve<EcontShippingModuleService>(
        "econtShippingModuleService"
    )

    try {
        const result = await econtService.syncShipmentStatus({
            shipmentId: id,
            refreshTracking: body?.force ?? false,
        })

        res.json({
            shipment: result.shipment,
            statusChanged: result.statusChanged,
            previousStatus: result.previousStatus,
            newStatus: result.newStatus,
        })
    } catch (error) {
        console.error("[Admin Econt Shipment] Error syncing shipment:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to sync shipment status",
        })
    }
}
