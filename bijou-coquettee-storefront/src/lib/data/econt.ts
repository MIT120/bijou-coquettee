"use server"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export type EcontPreference = {
  id: string
  cart_id: string
  order_id: string | null
  delivery_type: "office" | "address"
  office_code: string | null
  office_name: string | null
  address_city: string | null
  address_postal_code: string | null
  address_line1: string | null
  address_line2: string | null
  recipient_first_name: string
  recipient_last_name: string
  recipient_phone: string
  recipient_email: string | null
  cod_amount: number
  status: string
}

/**
 * Fetches the Econt shipping preference for a cart.
 * This is used to validate that Bulgaria orders have delivery details set.
 */
export async function getEcontPreference(
  cartId: string
): Promise<EcontPreference | null> {
  if (!cartId) {
    return null
  }

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = PUBLISHABLE_KEY
    }

    const response = await fetch(
      `${BACKEND_URL}/store/econt/preferences?cart_id=${cartId}`,
      {
        method: "GET",
        headers,
        next: {
          revalidate: 0, // Don't cache - we need fresh data for checkout validation
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.preference || null
  } catch (error) {
    console.error("[Econt] Failed to fetch preference:", error)
    return null
  }
}

/**
 * Validates that an Econt preference is complete and ready for order placement.
 * Returns an object with validation status and any error message.
 */
export async function validateEcontPreference(
  preference: EcontPreference | null
): Promise<{ valid: boolean; error?: string }> {
  if (!preference) {
    return {
      valid: false,
      error: "Моля, попълнете данните за доставка с Econt.",
    }
  }

  // Check delivery type and required fields
  if (preference.delivery_type === "office") {
    if (!preference.office_code) {
      return {
        valid: false,
        error: "Моля, изберете офис на Econt за доставка.",
      }
    }
  } else if (preference.delivery_type === "address") {
    if (!preference.address_city || !preference.address_line1) {
      return {
        valid: false,
        error: "Моля, попълнете адрес за доставка.",
      }
    }
  }

  // Check recipient info
  if (
    !preference.recipient_first_name ||
    !preference.recipient_last_name ||
    !preference.recipient_phone
  ) {
    return {
      valid: false,
      error: "Моля, попълнете данните за получател (име, фамилия, телефон).",
    }
  }

  return { valid: true }
}
