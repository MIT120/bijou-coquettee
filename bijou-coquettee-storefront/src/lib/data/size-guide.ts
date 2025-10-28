import "server-only"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * Get size guide data for a specific category
 */
export async function getCategoryData(category: string) {
    const response = await fetch(
        `${BACKEND_URL}/store/size-guide/${category}`,
        {
            next: {
                tags: [`size-guide-${category}`],
            },
        }
    )

    if (!response.ok) {
        throw new Error(`Failed to fetch size guide for category: ${category}`)
    }

    const { data } = await response.json()
    return data
}

/**
 * Get all size guides
 */
export async function getAllSizeGuides() {
    const response = await fetch(
        `${BACKEND_URL}/store/size-guide`,
        {
            next: {
                tags: ["size-guides"],
            },
        }
    )

    if (!response.ok) {
        throw new Error("Failed to fetch size guides")
    }

    const { size_guides } = await response.json()
    return size_guides
}

/**
 * Find size by measurement (client-side only)
 */
export async function findSizeByMeasurement(data: {
    category: string
    measurement: number
    measurementType: "circumference_mm" | "diameter_mm" | "length_cm"
}) {
    const response = await fetch(
        `${BACKEND_URL}/store/size-guide/find-size`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    )

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to find size")
    }

    const { size } = await response.json()
    return size
}
