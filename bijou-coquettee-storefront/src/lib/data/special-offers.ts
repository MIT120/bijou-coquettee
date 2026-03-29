"use server"

const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export type SpecialOfferData = {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    discount_code: string | null
    discount_percent: number | null
    cta_text: string | null
    cta_link: string | null
}

export async function getActiveSpecialOffer(): Promise<SpecialOfferData | null> {
    try {
        const headers: Record<string, string> = {}
        if (PUBLISHABLE_KEY) {
            headers["x-publishable-api-key"] = PUBLISHABLE_KEY
        }

        const response = await fetch(`${BACKEND_URL}/store/special-offers`, {
            headers,
            next: { revalidate: 60 },
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data.offer ?? null
    } catch (error) {
        console.error("Error fetching special offer:", error)
        return null
    }
}
