import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type EcontShippingModuleService from "../../../../../../modules/econt-shipping/service"
import { sendShipmentStatusEmail, buildDestinationString } from "../../../../../../modules/econt-shipping/email-service"

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
        const registeredShipment = await econtService.registerShipment(id)

        // Send "registered" email notification
        try {
            await sendShipmentStatusEmail({
                status: "registered",
                recipientEmail: registeredShipment.recipient_email ?? "",
                recipientName: `${registeredShipment.recipient_first_name} ${registeredShipment.recipient_last_name}`,
                waybillNumber: registeredShipment.waybill_number ?? "",
                destination: buildDestinationString(registeredShipment),
                orderId: registeredShipment.order_id,
                expectedDeliveryDate: registeredShipment.expected_delivery_date ?? null,
            })
        } catch (emailError) {
            console.error("[Admin Econt Shipment] Failed to send registration email:", emailError)
        }

        res.json({
            shipment: registeredShipment,
            message: "Shipment registered with Econt successfully.",
        })
    } catch (error) {
        console.error("[Admin Econt Shipment] Error registering shipment:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to register shipment",
        })
    }
}
