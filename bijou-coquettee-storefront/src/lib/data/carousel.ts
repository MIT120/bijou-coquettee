"use server"

import type { CarouselSlide } from "@/types/carousel"

const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

export async function getCarouselSlides(): Promise<CarouselSlide[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/store/carousel-slides`, {
            next: { revalidate: 60 },
        })

        if (!response.ok) {
            return []
        }

        const data = await response.json()
        return data.slides ?? []
    } catch (error) {
        console.error("Error fetching carousel slides:", error)
        return []
    }
}
