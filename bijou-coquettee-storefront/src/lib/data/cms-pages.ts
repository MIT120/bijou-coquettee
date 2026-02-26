"use server"

import type { CmsPageResponse } from "@/types/cms"

const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

export async function getCmsPage(slug: string): Promise<CmsPageResponse | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/store/pages/${slug}`, {
            next: { revalidate: 60 },
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data as CmsPageResponse
    } catch (error) {
        console.error("Error fetching CMS page:", error)
        return null
    }
}
