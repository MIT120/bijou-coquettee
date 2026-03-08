"use server"

import type { Certificate } from "@/types/certificate"

const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export async function getCertificates(): Promise<Certificate[]> {
    try {
        const headers: Record<string, string> = {}
        if (PUBLISHABLE_KEY) {
            headers["x-publishable-api-key"] = PUBLISHABLE_KEY
        }

        const response = await fetch(`${BACKEND_URL}/store/certificates`, {
            headers,
            next: { revalidate: 60 },
        })

        if (!response.ok) {
            return []
        }

        const data = await response.json()
        return data.certificates ?? []
    } catch (error) {
        console.error("Error fetching certificates:", error)
        return []
    }
}
