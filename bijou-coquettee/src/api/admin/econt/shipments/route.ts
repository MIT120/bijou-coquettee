import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type EcontShippingModuleService from "../../../../modules/econt-shipping/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const {
        query: { status, order_id, cart_id, limit, offset },
    } = req

    const filter: Record<string, unknown> = {}

    if (status && typeof status === "string") {
        filter.status = status
    }

    if (order_id && typeof order_id === "string") {
        filter.order_id = order_id
    }

    if (cart_id && typeof cart_id === "string") {
        filter.cart_id = cart_id
    }

    const econtService =
        req.scope.resolve<EcontShippingModuleService>(
            "econtShippingModuleService"
        )

    const shipments = await econtService.listEcontShipments(filter, {
        skip: typeof offset === "string" ? Number(offset) : 0,
        take: typeof limit === "string" ? Number(limit) : 50,
        order: { created_at: "DESC" },
    })

    res.json({
        shipments,
    })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const body = req.body as {
        order_id: string
        cart_id?: string
        // Manual shipment creation fields
        delivery_type?: "office" | "address"
        office_code?: string
        office_name?: string
        address_city?: string
        address_postal_code?: string
        address_line1?: string
        address_line2?: string
        recipient_first_name?: string
        recipient_last_name?: string
        recipient_phone?: string
        recipient_email?: string
        cod_amount?: number
        allow_saturday?: boolean
    }

    if (!body?.order_id) {
        res.status(400).json({ message: "order_id is required." })
        return
    }

    const econtService =
        req.scope.resolve<EcontShippingModuleService>(
            "econtShippingModuleService"
        )

    try {
        // Check if there's an existing shipment for this order
        const [existingShipment] = await econtService.listEcontShipments(
            { order_id: body.order_id },
            { take: 1 }
        )

        if (existingShipment) {
            res.status(400).json({
                message: "A shipment already exists for this order.",
                shipment: existingShipment,
            })
            return
        }

        // If cart_id is provided, try to create from cart preference
        if (body.cart_id) {
            const shipment = await econtService.createShipmentFromOrder(
                body.order_id,
                body.cart_id
            )
            res.json({ shipment })
            return
        }

        // Manual creation - requires all fields
        if (!body.delivery_type || !body.recipient_first_name || !body.recipient_last_name || !body.recipient_phone) {
            res.status(400).json({
                message: "For manual shipment creation, delivery_type, recipient_first_name, recipient_last_name, and recipient_phone are required.",
            })
            return
        }

        // Create a manual shipment record (draft status)
        const [shipment] = await econtService.createEcontShipments([{
            order_id: body.order_id,
            delivery_type: body.delivery_type,
            office_code: body.office_code ?? null,
            office_name: body.office_name ?? null,
            address_city: body.address_city ?? null,
            address_postal_code: body.address_postal_code ?? null,
            address_line1: body.address_line1 ?? null,
            address_line2: body.address_line2 ?? null,
            recipient_first_name: body.recipient_first_name,
            recipient_last_name: body.recipient_last_name,
            recipient_phone: body.recipient_phone,
            recipient_email: body.recipient_email ?? null,
            cod_amount: body.cod_amount ?? null,
            allow_saturday: body.allow_saturday ?? false,
            status: "draft",
        }])

        res.json({ shipment })
    } catch (error) {
        console.error("[Admin Econt Shipments] Error creating shipment:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to create shipment",
        })
    }
}
