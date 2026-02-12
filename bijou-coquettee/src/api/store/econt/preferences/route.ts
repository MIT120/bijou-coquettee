import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type EcontShippingModuleService from "../../../../modules/econt-shipping/service";
import { EcontDeliveryType } from "../../../../modules/econt-shipping/types";
import { Modules } from "@medusajs/framework/utils";
import type { ICartModuleService } from "@medusajs/framework/types";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.query.cart_id;

  if (!cartId || typeof cartId !== "string") {
    res.status(400).json({ message: "cart_id query parameter is required." });
    return;
  }

  const econtService = req.scope.resolve<EcontShippingModuleService>(
    "econtShippingModuleService",
  );

  const preference = await econtService.getCartPreference(cartId);

  res.json({
    preference,
  });
}

type PreferenceBody = {
  cart_id: string;
  delivery_type: EcontDeliveryType;
  cod_amount: number;
  country_code?: string | null;
  recipient: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string | null;
  };
  office?: {
    office_code: string;
    office_name?: string;
    city?: string;
    country_code?: string;
  };
  address?: {
    city: string;
    country_code?: string;
    postal_code?: string;
    address_line1: string;
    address_line2?: string | null;
    entrance?: string | null;
    floor?: string | null;
    apartment?: string | null;
    neighborhood?: string | null;
    allow_saturday?: boolean;
  };
  metadata?: Record<string, unknown> | null;
};

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as PreferenceBody;

  if (!body?.cart_id) {
    res.status(400).json({ message: "cart_id is required." });
    return;
  }

  if (!["office", "address"].includes(body.delivery_type)) {
    res.status(400).json({
      message: "delivery_type must be either 'office' or 'address'.",
    });
    return;
  }

  if (typeof body.cod_amount !== "number") {
    res.status(400).json({ message: "cod_amount must be a number." });
    return;
  }

  // Validate COD amount is positive
  if (body.cod_amount < 0) {
    res.status(400).json({ message: "cod_amount must be a positive number." });
    return;
  }

  // Validate COD amount against cart total
  try {
    const cartService = req.scope.resolve<ICartModuleService>(Modules.CART);
    const [cart] = await cartService.listCarts(
      { id: body.cart_id },
      { select: ["id", "total", "currency_code"] },
    );

    if (!cart) {
      res.status(400).json({ message: "Cart not found." });
      return;
    }

    // Medusa v2 stores cart.total in major units (e.g. 80 BGN, not 8000 cents)
    const cartTotal = Number(cart.total || 0);

    // Allow a small tolerance for rounding differences
    const tolerance = 0.02;
    if (Math.abs(body.cod_amount - cartTotal) > tolerance) {
      res.status(400).json({
        message: `COD amount (${body.cod_amount}) does not match cart total (${cartTotal.toFixed(2)}). Please refresh and try again.`,
      });
      return;
    }
  } catch (cartError) {
    console.error(
      "[Econt Preferences] Failed to validate COD amount against cart:",
      cartError,
    );
    // Don't fail if cart validation fails - log and continue
    // This is a safeguard validation, not a critical blocker
  }

  if (
    !body.recipient ||
    !body.recipient.first_name ||
    !body.recipient.last_name ||
    !body.recipient.phone
  ) {
    res.status(400).json({
      message:
        "recipient.first_name, recipient.last_name and recipient.phone are required.",
    });
    return;
  }

  if (
    body.delivery_type === "office" &&
    (!body.office || !body.office.office_code)
  ) {
    res.status(400).json({
      message: "office.office_code is required for office deliveries.",
    });
    return;
  }

  if (
    body.delivery_type === "address" &&
    (!body.address || !body.address.address_line1 || !body.address.city)
  ) {
    res.status(400).json({
      message: "address.city and address.address_line1 are required.",
    });
    return;
  }

  const countryCode =
    body.country_code ||
    body.address?.country_code ||
    body.office?.country_code ||
    "bg";

  if (countryCode.toLowerCase() !== "bg") {
    res.status(400).json({
      message: "Econt shipping is only available for Bulgaria.",
    });
    return;
  }

  const econtService = req.scope.resolve<EcontShippingModuleService>(
    "econtShippingModuleService",
  );

  const preference = await econtService.saveCartPreference({
    cartId: body.cart_id,
    deliveryType: body.delivery_type,
    codAmount: body.cod_amount,
    recipient: {
      firstName: body.recipient.first_name,
      lastName: body.recipient.last_name,
      phone: body.recipient.phone,
      email: body.recipient.email,
    },
    office: body.office
      ? {
          officeCode: body.office.office_code,
          officeName: body.office.office_name,
          city: body.office.city,
        }
      : undefined,
    address: body.address
      ? {
          city: body.address.city,
          postalCode: body.address.postal_code,
          addressLine1: body.address.address_line1,
          addressLine2: body.address.address_line2,
          entrance: body.address.entrance,
          floor: body.address.floor,
          apartment: body.address.apartment,
          neighborhood: body.address.neighborhood,
          allowSaturdayDelivery: body.address.allow_saturday,
        }
      : undefined,
    metadata: body.metadata,
  });

  // Update the cart's shipping address with Econt delivery details
  // This ensures the order shows the correct delivery address
  // NOTE: We only update shipping_address, NOT billing_address, to preserve
  // any separate billing address the customer may have entered
  try {
    const cartService = req.scope.resolve<ICartModuleService>(Modules.CART);

    let shippingAddress: Record<string, string | null>;

    if (body.delivery_type === "office" && body.office) {
      // For office pickup: use office name and address
      shippingAddress = {
        first_name: body.recipient.first_name,
        last_name: body.recipient.last_name,
        phone: body.recipient.phone,
        address_1: `Econt Office: ${body.office.office_name || body.office.office_code}`,
        address_2: `Office Code: ${body.office.office_code}`,
        city: body.office.city || "Bulgaria",
        postal_code: null,
        country_code: "bg",
        province: null,
        company: "Econt Express - Office Pickup",
      };
    } else if (body.delivery_type === "address" && body.address) {
      // For address delivery: use the provided address
      const addressParts = [body.address.address_line1];
      if (body.address.entrance)
        addressParts.push(`вх. ${body.address.entrance}`);
      if (body.address.floor) addressParts.push(`ет. ${body.address.floor}`);
      if (body.address.apartment)
        addressParts.push(`ап. ${body.address.apartment}`);

      shippingAddress = {
        first_name: body.recipient.first_name,
        last_name: body.recipient.last_name,
        phone: body.recipient.phone,
        address_1: addressParts.join(", "),
        address_2: body.address.address_line2 || null,
        city: body.address.city,
        postal_code: body.address.postal_code || null,
        country_code: "bg",
        province: body.address.neighborhood || null,
        company: "Econt Express - Address Delivery",
      };
    } else {
      shippingAddress = {
        first_name: body.recipient.first_name,
        last_name: body.recipient.last_name,
        phone: body.recipient.phone,
        address_1: "Econt Delivery",
        address_2: null,
        city: "Bulgaria",
        postal_code: null,
        country_code: "bg",
        province: null,
        company: "Econt Express",
      };
    }

    // Only update shipping_address - preserve billing_address separately
    await cartService.updateCarts([
      {
        id: body.cart_id,
        shipping_address: shippingAddress,
      },
    ]);
  } catch (cartError) {
    // Log but don't fail if cart update fails
    console.error(
      "[Econt Preferences] Failed to update cart shipping address:",
      cartError,
    );
  }

  res.json({
    preference,
  });
}
