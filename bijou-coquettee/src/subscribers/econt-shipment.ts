import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import type EcontShippingModuleService from "../modules/econt-shipping/service"

type OrderPlacedPayload = {
  id: string
  cart_id?: string | null
}

export default async function econtOrderPlacedHandler({
  event,
  container,
}: SubscriberArgs<OrderPlacedPayload>) {
  const orderId = event.data?.id
  const cartId = event.data?.cart_id

  if (!orderId || !cartId) {
    return
  }

  const econtService =
    container.resolve<EcontShippingModuleService>(
      "econtShippingModuleService"
    )

  try {
    await econtService.createShipmentFromOrder(orderId, cartId)
  } catch (error) {
    const logger = container.resolve("logger") as {
      warn: (msg: string, meta?: Record<string, unknown>) => void
    }

    logger?.warn?.("Failed to create Econt shipment", {
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

