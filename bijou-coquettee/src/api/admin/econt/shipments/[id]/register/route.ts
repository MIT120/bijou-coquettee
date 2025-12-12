import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type EcontShippingModuleService from "../../../../../../modules/econt-shipping/service"

type RouteParams = { id: string }

/**
 * Register a draft shipment with the Econt API.
 * This sends the shipment to Econt and gets back a waybill number.
 */
export async function POST(
    req: MedusaRequest<RouteParams>,
    res: MedusaResponse
) {
    const { id } = req.params

    const econtService = req.scope.resolve<EcontShippingModuleService>(
        "econtShippingModuleService"
    )

    try {
        const shipment = await econtService.retrieveEcontShipment(id)

        if (!shipment) {
            res.status(404).json({ message: "Shipment not found." })
            return
        }

        if (shipment.status !== "draft" && shipment.status !== "ready") {
            res.status(400).json({
                message: `Cannot register shipment with status "${shipment.status}". Only draft or ready shipments can be registered.`,
            })
            return
        }

        if (!shipment.order_id) {
            res.status(400).json({
                message: "Shipment must be associated with an order before registration.",
            })
            return
        }

        // Use the existing createShipmentFromOrder method if we have a cart_id
        // Otherwise, we need to build the payload manually
        if (shipment.cart_id) {
            const registeredShipment = await econtService.createShipmentFromOrder(
                shipment.order_id,
                shipment.cart_id
            )
            res.json({ shipment: registeredShipment })
            return
        }

        // Manual registration - call the Econt API directly
        // For now, update status to indicate it needs manual processing
        const [updated] = await econtService.updateEcontShipments([
            {
                id,
                status: "ready",
            },
        ])

        res.json({
            shipment: updated,
            message: "Shipment marked as ready. Manual Econt registration required.",
        })
    } catch (error) {
        console.error("[Admin Econt Shipment] Error registering shipment:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to register shipment",
        })
    }
}
