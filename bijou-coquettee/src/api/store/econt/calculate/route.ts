import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type EcontShippingModuleService from "../../../../modules/econt-shipping/service";

type CalculateBody = {
  cart_id: string;
};

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as CalculateBody;

  if (!body?.cart_id) {
    res.status(400).json({ message: "cart_id is required." });
    return;
  }

  const econtService = req.scope.resolve<EcontShippingModuleService>(
    "econtShippingModuleService",
  );

  try {
    const result = await econtService.calculateShipment(body.cart_id);

    const totalPrice = result.totalPrice ?? null;
    const currency = result.currency ?? "BGN";

    // Persist the shipping cost on the preference record
    if (totalPrice != null) {
      try {
        const preference = await econtService.getCartPreference(body.cart_id);
        if (preference) {
          await econtService.updateEcontShipments([
            {
              id: preference.id,
              shipping_cost: totalPrice,
              shipping_cost_currency: currency,
            },
          ]);
        }
      } catch (persistError) {
        console.error(
          "[Econt Calculate] Failed to persist shipping cost:",
          persistError,
        );
      }
    }

    res.json({
      calculation: {
        totalPrice,
        currency,
        discountPercent: result.discountPercent ?? 0,
        discountAmount: result.discountAmount ?? 0,
        discountDescription: result.discountDescription ?? null,
        senderDueAmount: result.senderDueAmount ?? null,
        receiverDueAmount: result.receiverDueAmount ?? null,
        services: result.services ?? [],
        expectedDeliveryDate: result.expectedDeliveryDate ?? null,
      },
    });
  } catch (error) {
    console.error("[Econt Calculate] Failed to calculate shipping cost:", error);
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to calculate shipping cost.",
    });
  }
}
