import { getAuthHeaders } from "./cookies"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export interface SizeGuideData {
    id: string
    category: "ring" | "necklace" | "bracelet" | "chain"
    size_us?: string | null
    size_uk?: string | null
    size_eu?: string | null
    size_asia?: string | null
    circumference_mm?: number | null
    diameter_mm?: number | null
    length_cm?: number | null
    description?: string | null
    sort_order: number
}

export interface MeasurementGuide {
    id: string
    category: "ring" | "necklace" | "bracelet" | "chain"
    title: string
    instructions: string
    tips?: string[] | null
    image_url?: string | null
    video_url?: string | null
}

export interface CategoryData {
    category: string
    sizeChart: SizeGuideData[]
    measurementGuide: MeasurementGuide | null
}

/**
 * Get all size guide data
 */
export async function getAllSizeGuides() {
    const headers = {
        ...getAuthHeaders(),
    }

    try {
        const response = await fetch(`${BACKEND_URL}/store/size-guide`, {
            headers,
            next: { revalidate: 3600 }, // Cache for 1 hour
        })

        if (!response.ok) {
            throw new Error("Failed to fetch size guides")
        }

        const data = await response.json()
        return data.size_guides as SizeGuideData[]
    } catch (error) {
        console.error("Error fetching size guides:", error)
        return []
    }
}

/**
 * Get size guide data for a specific category
 */
export async function getSizeGuideByCategory(
    category: "ring" | "necklace" | "bracelet" | "chain"
): Promise<CategoryData | null> {
    const headers = {
        ...getAuthHeaders(),
    }

    try {
        const response = await fetch(
            `${BACKEND_URL}/store/size-guide/${category}`,
            {
                headers,
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        )

        if (!response.ok) {
            throw new Error(`Failed to fetch size guide for ${category}`)
        }

        const result = await response.json()
        return result.data as CategoryData
    } catch (error) {
        console.error(`Error fetching size guide for ${category}:`, error)
        return null
    }
}

/**
 * Find size based on measurement
 */
export async function findSizeByMeasurement(
    category: "ring" | "necklace" | "bracelet" | "chain",
    measurement: number,
    measurementType: "circumference_mm" | "diameter_mm" | "length_cm"
): Promise<SizeGuideData | null> {
    const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
    }

    try {
        const response = await fetch(`${BACKEND_URL}/store/size-guide/find-size`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                category,
                measurement,
                measurementType,
            }),
        })

        if (!response.ok) {
            return null
        }

        const result = await response.json()
        return result.size as SizeGuideData
    } catch (error) {
        console.error("Error finding size:", error)
        return null
    }
}

