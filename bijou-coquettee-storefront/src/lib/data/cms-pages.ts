"use server"

import type { CmsPageResponse } from "@/types/cms"

const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (PUBLISHABLE_KEY) {
        headers["x-publishable-api-key"] = PUBLISHABLE_KEY
    }
    return headers
}

export async function getCmsPage(slug: string): Promise<CmsPageResponse | null> {
    if (!BACKEND_URL) {
        console.error("[CMS] No BACKEND_URL configured — check MEDUSA_BACKEND_URL env var")
        return null
    }

    const url = `${BACKEND_URL}/store/pages/${slug}`

    try {
        const response = await fetch(url, {
            headers: getHeaders(),
            next: { revalidate: 60 },
        })

        if (!response.ok) {
            console.warn(
                `[CMS] Failed to fetch page "${slug}" — ${response.status} ${response.statusText} (${url})`
            )
            return null
        }

        const data = await response.json()
        return data as CmsPageResponse
    } catch (error) {
        console.error(`[CMS] Error fetching page "${slug}" from ${url}:`, error)
        return null
    }
}

export async function listCmsPages(): Promise<CmsPageResponse[]> {
    if (!BACKEND_URL) return []

    try {
        const response = await fetch(`${BACKEND_URL}/store/pages`, {
            headers: getHeaders(),
            next: { revalidate: 60 },
        })

        if (!response.ok) return []

        const data = await response.json()
        return data.pages || []
    } catch {
        return []
    }
}
