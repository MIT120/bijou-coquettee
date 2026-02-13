import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type EcontShippingModuleService from "../../../../../../modules/econt-shipping/service"
import { sendShipmentStatusEmail, buildDestinationString } from "../../../../../../modules/econt-shipping/email-service"

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

        // Send email notification if status changed
        if (result.statusChanged && result.newStatus) {
            const emailStatus = result.newStatus as "registered" | "in_transit" | "delivered" | "cancelled"
            if (["registered", "in_transit", "delivered", "cancelled"].includes(emailStatus)) {
                const shipment = result.shipment
                try {
                    await sendShipmentStatusEmail({
                        status: emailStatus,
                        recipientEmail: shipment.recipient_email ?? "",
                        recipientName: `${shipment.recipient_first_name} ${shipment.recipient_last_name}`,
                        waybillNumber: shipment.waybill_number ?? "",
                        destination: buildDestinationString(shipment),
                        orderId: shipment.order_id,
                        expectedDeliveryDate: shipment.expected_delivery_date ?? null,
                    })
                } catch (emailError) {
                    console.error("[Admin Econt Shipment] Failed to send status email:", emailError)
                }
            }
        }

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
