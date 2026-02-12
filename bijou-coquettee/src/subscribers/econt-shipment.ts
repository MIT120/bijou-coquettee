import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type EcontShippingModuleService from "../modules/econt-shipping/service";

type OrderPlacedPayload = {
  id: string;
  cart_id?: string | null;
};

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
 *
 * Error Handling:
 * - If no cart_id is provided (non-Bulgaria orders), silently skip
 * - If no Econt preference exists, log error but don't fail the order
 * - If shipment creation fails, log error with full details for debugging
 * - Orders will complete even if shipment creation fails, but admin should
 *   be notified via logs to manually create the shipment
 */
export default async function econtOrderPlacedHandler({
  event,
  container,
}: SubscriberArgs<OrderPlacedPayload>) {
  const orderId = event.data?.id;
  const cartId = event.data?.cart_id;

  const logger = container.resolve("logger") as {
    info: (msg: string, meta?: Record<string, unknown>) => void;
    warn: (msg: string, meta?: Record<string, unknown>) => void;
    error: (msg: string, meta?: Record<string, unknown>) => void;
  };

  if (!orderId || !cartId) {
    logger?.info?.(
      "[Econt] Order placed without cart_id, skipping shipment creation",
      {
        orderId,
        cartId,
      },
    );
    return;
  }

  const econtService = container.resolve<EcontShippingModuleService>(
    "econtShippingModuleService",
  );

  try {
    // First check if there's a saved Econt preference for this cart
    const preference = await econtService.getCartPreference(cartId);

    if (!preference) {
      // No Econt preference means this might be a non-Bulgaria order or
      // customer didn't complete Econt form. Log for admin visibility.
      logger?.warn?.(
        "[Econt] No Econt preference found for cart - shipment not created",
        {
          orderId,
          cartId,
          action: "MANUAL_SHIPMENT_REQUIRED",
          resolution:
            "Admin should check if this order requires Econt shipping and create shipment manually if needed",
        },
      );
      return;
    }

    const shipment = await econtService.createShipmentFromOrder(
      orderId,
      cartId,
    );

    logger?.info?.("[Econt] Shipment ready for admin approval", {
      orderId,
      cartId,
      shipmentId: shipment?.id,
      status: shipment?.status,
      deliveryType: preference.delivery_type,
      officeCode: preference.office_code,
      recipientName: `${preference.recipient_first_name} ${preference.recipient_last_name}`,
    });
  } catch (error) {
    // Log as error (not warn) so it's more visible in monitoring
    logger?.error?.("[Econt] CRITICAL: Failed to create shipment for order", {
      orderId,
      cartId,
      action: "MANUAL_SHIPMENT_REQUIRED",
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { message: "Unknown error" },
      resolution:
        "Admin must manually create shipment in Econt admin panel for this order",
    });

    // Note: We intentionally don't re-throw the error here because:
    // 1. The order has already been paid/placed successfully
    // 2. Re-throwing would cause the order.placed event to fail
    // 3. The customer would see an error even though their order went through
    // 4. Instead, we rely on error logs for admin to handle manually
    //
    // Future improvement: Send notification to admin (email/Slack) when this happens
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
