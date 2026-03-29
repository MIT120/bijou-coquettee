"use server"

const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export type AnnouncementMessage = {
    id: string
    text: string
    sort_order: number
}

export async function getAnnouncementMessages(): Promise<AnnouncementMessage[]> {
    try {
        const headers: Record<string, string> = {}
        if (PUBLISHABLE_KEY) {
            headers["x-publishable-api-key"] = PUBLISHABLE_KEY
        }

        const response = await fetch(`${BACKEND_URL}/store/announcement-messages`, {
            headers,
            next: { revalidate: 60 },
        })

        if (!response.ok) {
            return []
        }

        const data = await response.json()
        return data.messages ?? []
    } catch (error) {
        console.error("Error fetching announcement messages:", error)
        return []
    }
}
