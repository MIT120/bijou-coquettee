import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type EcontShippingModuleService from "../../../../modules/econt-shipping/service"
import { EcontDeliveryType } from "../../../../modules/econt-shipping/types"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.query.cart_id

  if (!cartId || typeof cartId !== "string") {
    res.status(400).json({ message: "cart_id query parameter is required." })
    return
  }

  const econtService =
    req.scope.resolve<EcontShippingModuleService>(
      "econtShippingModuleService"
    )

  const preference = await econtService.getCartPreference(cartId)

  res.json({
    preference,
  })
}

type PreferenceBody = {
  cart_id: string
  delivery_type: EcontDeliveryType
  cod_amount: number
  country_code?: string | null
  recipient: {
    first_name: string
    last_name: string
    phone: string
    email?: string | null
  }
  office?: {
    office_code: string
    office_name?: string
    city?: string
    country_code?: string
  }
  address?: {
    city: string
    country_code?: string
    postal_code?: string
    address_line1: string
    address_line2?: string | null
    entrance?: string | null
    floor?: string | null
    apartment?: string | null
    neighborhood?: string | null
    allow_saturday?: boolean
  }
  metadata?: Record<string, unknown> | null
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as PreferenceBody

  if (!body?.cart_id) {
    res.status(400).json({ message: "cart_id is required." })
    return
  }

  if (!["office", "address"].includes(body.delivery_type)) {
    res.status(400).json({
      message: "delivery_type must be either 'office' or 'address'.",
    })
    return
  }

  if (typeof body.cod_amount !== "number") {
    res.status(400).json({ message: "cod_amount must be a number." })
    return
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
    })
    return
  }

  if (
    body.delivery_type === "office" &&
    (!body.office || !body.office.office_code)
  ) {
    res.status(400).json({
      message: "office.office_code is required for office deliveries.",
    })
    return
  }

  if (
    body.delivery_type === "address" &&
    (!body.address || !body.address.address_line1 || !body.address.city)
  ) {
    res.status(400).json({
      message: "address.city and address.address_line1 are required.",
    })
    return
  }

  const countryCode =
    body.country_code ||
    body.address?.country_code ||
    body.office?.country_code ||
    "bg"

  if (countryCode.toLowerCase() !== "bg") {
    res.status(400).json({
      message: "Econt shipping is only available for Bulgaria.",
    })
    return
  }

  const econtService =
    req.scope.resolve<EcontShippingModuleService>(
      "econtShippingModuleService"
    )

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
  })

  res.json({
    preference,
  })
}

