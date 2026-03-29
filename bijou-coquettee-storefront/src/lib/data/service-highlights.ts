"use server"

const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export type ServiceHighlightData = {
    id: string
    title: string
    description: string | null
    icon_name: string
    sort_order: number
}

export async function getServiceHighlights(): Promise<ServiceHighlightData[]> {
    try {
        const headers: Record<string, string> = {}
        if (PUBLISHABLE_KEY) {
            headers["x-publishable-api-key"] = PUBLISHABLE_KEY
        }

        const response = await fetch(`${BACKEND_URL}/store/service-highlights`, {
            headers,
            next: { revalidate: 60 },
        })

        if (!response.ok) {
            return []
        }

        const data = await response.json()
        return data.highlights ?? []
    } catch (error) {
        console.error("Error fetching service highlights:", error)
        return []
    }
}
