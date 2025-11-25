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
    const body = req.body as { order_id: string; cart_id?: string }

    if (!body?.order_id) {
        res.status(400).json({ message: "order_id is required." })
        return
    }

    const econtService =
        req.scope.resolve<EcontShippingModuleService>(
            "econtShippingModuleService"
        )

    const shipment = await econtService.createShipmentFromOrder(
        body.order_id,
        body.cart_id
    )

    res.json({
        shipment,
    })
}

