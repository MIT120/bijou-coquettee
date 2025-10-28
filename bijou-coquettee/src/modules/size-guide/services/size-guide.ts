import { MedusaService } from "@medusajs/framework/utils"
import { SizeGuide, MeasurementGuide } from "../models/size-guide"

/**
 * Size Guide Service
 * Handles size chart and measurement guide operations
 */
class SizeGuideService extends MedusaService({
    SizeGuide,
    MeasurementGuide,
}) {
    /**
     * Get size chart for a specific category
     */
    async getSizeChart(category: string) {
        return await this.listSizeGuides(
            {
                category,
            },
            {
                order: { sort_order: "ASC" },
            }
        )
    }

    /**
     * Get measurement guide for a category
     */
    async getMeasurementGuide(category: string) {
        const guides = await this.listMeasurementGuides({
            category,
        })

        return guides[0] || null
    }

    /**
     * Get all size data for a category
     */
    async getCategoryData(category: string) {
        const [sizeChart, measurementGuide] = await Promise.all([
            this.getSizeChart(category),
            this.getMeasurementGuide(category),
        ])

        return {
            category,
            sizeChart,
            measurementGuide,
        }
    }

    /**
     * Find closest size match based on measurement
     */
    async findSizeByMeasurement(
        category: string,
        measurement: number,
        measurementType: "circumference_mm" | "diameter_mm" | "length_cm"
    ) {
        const sizeChart = await this.getSizeChart(category)

        if (!sizeChart.length) {
            return null
        }

        // Find the closest size
        let closestSize = sizeChart[0]
        let smallestDiff = Math.abs((closestSize[measurementType] || 0) - measurement)

        for (const size of sizeChart) {
            const value = size[measurementType]
            if (value !== null && value !== undefined) {
                const diff = Math.abs(value - measurement)
                if (diff < smallestDiff) {
                    smallestDiff = diff
                    closestSize = size
                }
            }
        }

        return closestSize
    }
}

export default SizeGuideService

