"use server"

import type { CheckoutPromo } from "@/types/checkout-promo"

const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

export async function getActiveCheckoutPromo(): Promise<CheckoutPromo | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/store/checkout-promo`, {
            next: { revalidate: 60 },
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data.promo ?? null
    } catch (error) {
        console.error("Error fetching checkout promo:", error)
        return null
    }
}
