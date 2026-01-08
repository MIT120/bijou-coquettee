import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import type EcontShippingModuleService from "../modules/econt-shipping/service"

type OrderPlacedPayload = {
  id: string
  cart_id?: string | null
}

/**
 * Handles order.placed event to prepare Econt shipment for admin approval.
 *
 * This subscriber creates a "ready" shipment that requires admin approval
 * before being registered with the Econt API. The admin can review and
 * modify shipment details before clicking "Register" in the admin panel.
 *
 * Flow:
 * 1. Order is placed -> this handler runs
 * 2. Shipment status changes from "draft" to "ready"
 * 3. Admin sees shipment in "Чакащи потвърждение" section
 * 4. Admin reviews/edits and clicks "Изпрати към Еконт"
 * 5. Shipment is registered with Econt API and waybill is generated
 */
export default async function econtOrderPlacedHandler({
  event,
  container,
}: SubscriberArgs<OrderPlacedPayload>) {
  const orderId = event.data?.id
  const cartId = event.data?.cart_id

  const logger = container.resolve("logger") as {
    info: (msg: string, meta?: Record<string, unknown>) => void
    warn: (msg: string, meta?: Record<string, unknown>) => void
  }

  if (!orderId || !cartId) {
    logger?.info?.("[Econt] Order placed without cart_id, skipping shipment creation", {
      orderId,
      cartId,
    })
    return
  }

  const econtService =
    container.resolve<EcontShippingModuleService>(
      "econtShippingModuleService"
    )

  try {
    const shipment = await econtService.createShipmentFromOrder(orderId, cartId)

    logger?.info?.("[Econt] Shipment ready for admin approval", {
      orderId,
      cartId,
      shipmentId: shipment?.id,
      status: shipment?.status,
    })
  } catch (error) {
    logger?.warn?.("[Econt] Failed to prepare shipment for approval", {
      orderId,
      cartId,
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { message: "Unknown error" },
    })
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}

