import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type EcontShippingModuleService from "../../../../../modules/econt-shipping/service"

type RouteParams = { id: string }

export async function GET(
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

        res.json({ shipment })
    } catch (error) {
        console.error("[Admin Econt Shipment] Error retrieving shipment:", error)
        res.status(404).json({ message: "Shipment not found." })
    }
}

export async function PATCH(
    req: MedusaRequest<RouteParams>,
    res: MedusaResponse
) {
    const { id } = req.params
    const body = req.body as {
        status?: string
        delivery_type?: "office" | "address"
        office_code?: string
        office_name?: string
        address_city?: string
        address_postal_code?: string
        address_line1?: string
        address_line2?: string
        entrance?: string
        floor?: string
        apartment?: string
        neighborhood?: string
        recipient_first_name?: string
        recipient_last_name?: string
        recipient_phone?: string
        recipient_email?: string
        cod_amount?: number
        allow_saturday?: boolean
        waybill_number?: string
        tracking_number?: string
        metadata?: Record<string, unknown>
    }

    const econtService = req.scope.resolve<EcontShippingModuleService>(
        "econtShippingModuleService"
    )

    try {
        const existing = await econtService.retrieveEcontShipment(id)

        if (!existing) {
            res.status(404).json({ message: "Shipment not found." })
            return
        }

        // Build update payload with only provided fields
        const updatePayload: Record<string, unknown> = { id }

        if (body.status !== undefined) updatePayload.status = body.status
        if (body.delivery_type !== undefined) updatePayload.delivery_type = body.delivery_type
        if (body.office_code !== undefined) updatePayload.office_code = body.office_code
        if (body.office_name !== undefined) updatePayload.office_name = body.office_name
        if (body.address_city !== undefined) updatePayload.address_city = body.address_city
        if (body.address_postal_code !== undefined) updatePayload.address_postal_code = body.address_postal_code
        if (body.address_line1 !== undefined) updatePayload.address_line1 = body.address_line1
        if (body.address_line2 !== undefined) updatePayload.address_line2 = body.address_line2
        if (body.entrance !== undefined) updatePayload.entrance = body.entrance
        if (body.floor !== undefined) updatePayload.floor = body.floor
        if (body.apartment !== undefined) updatePayload.apartment = body.apartment
        if (body.neighborhood !== undefined) updatePayload.neighborhood = body.neighborhood
        if (body.recipient_first_name !== undefined) updatePayload.recipient_first_name = body.recipient_first_name
        if (body.recipient_last_name !== undefined) updatePayload.recipient_last_name = body.recipient_last_name
        if (body.recipient_phone !== undefined) updatePayload.recipient_phone = body.recipient_phone
        if (body.recipient_email !== undefined) updatePayload.recipient_email = body.recipient_email
        if (body.cod_amount !== undefined) updatePayload.cod_amount = body.cod_amount
        if (body.allow_saturday !== undefined) updatePayload.allow_saturday = body.allow_saturday
        if (body.waybill_number !== undefined) updatePayload.waybill_number = body.waybill_number
        if (body.tracking_number !== undefined) updatePayload.tracking_number = body.tracking_number
        if (body.metadata !== undefined) updatePayload.metadata = body.metadata

        const [shipment] = await econtService.updateEcontShipments([updatePayload])

        res.json({ shipment })
    } catch (error) {
        console.error("[Admin Econt Shipment] Error updating shipment:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to update shipment",
        })
    }
}

export async function DELETE(
    req: MedusaRequest<RouteParams>,
    res: MedusaResponse
) {
    const { id } = req.params

    const econtService = req.scope.resolve<EcontShippingModuleService>(
        "econtShippingModuleService"
    )

    try {
        // Cancel with Econt API if registered
        const shipment = await econtService.cancelShipment(id)

        res.json({
            message: "Shipment cancelled successfully.",
            shipment,
        })
    } catch (error) {
        console.error("[Admin Econt Shipment] Error cancelling shipment:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to cancel shipment",
        })
    }
}
