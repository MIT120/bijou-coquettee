"use client"

import React, { useState } from "react"
import { findSizeByMeasurement } from "@lib/data/size-guide"
import { Button } from "@medusajs/ui"

/**
 * Size Finder Component
 * Interactive tool to find ring size based on measurements
 */
export default function SizeFinder() {
    const [circumference, setCircumference] = useState<string>("")
    const [diameter, setDiameter] = useState<string>("")
    const [foundSize, setFoundSize] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFindSize = async () => {
        setLoading(true)
        setError(null)
        setFoundSize(null)

        const circumference_mm = parseFloat(circumference)
        const diameter_mm = parseFloat(diameter)

        if (isNaN(circumference_mm) && isNaN(diameter_mm)) {
            setError("Please enter a valid number for circumference or diameter.")
            setLoading(false)
            return
        }

        try {
            let result
            if (!isNaN(circumference_mm)) {
                result = await findSizeByMeasurement({
                    category: "ring",
                    measurement: circumference_mm,
                    measurementType: "circumference_mm",
                })
            } else {
                result = await findSizeByMeasurement({
                    category: "ring",
                    measurement: diameter_mm,
                    measurementType: "diameter_mm",
                })
            }
            setFoundSize(result)
        } catch (err: any) {
            setError(err.message || "Could not find a matching size. Please try again or refer to the chart.")
            console.error("Error finding size:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="size-finder">
            <div className="bg-ui-bg-subtle p-6 rounded-lg">
                <h4 className="text-base-semi mb-3">Find Your Ring Size</h4>
                <p className="text-small-regular mb-4 text-ui-fg-muted">
                    Enter your finger's circumference or the inner diameter of an existing ring to find your size.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-small-regular font-medium mb-2">
                            Circumference (mm)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={circumference}
                            onChange={(e) => {
                                setCircumference(e.target.value)
                                setDiameter("") // Clear diameter if circumference is being entered
                            }}
                            placeholder="e.g., 54.4"
                            className="w-full px-4 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive"
                        />
                    </div>
                    <div>
                        <label className="block text-small-regular font-medium mb-2">
                            OR Diameter (mm)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={diameter}
                            onChange={(e) => {
                                setDiameter(e.target.value)
                                setCircumference("") // Clear circumference if diameter is being entered
                            }}
                            placeholder="e.g., 17.3"
                            className="w-full px-4 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleFindSize}
                    isLoading={loading}
                    className="w-full"
                    disabled={!circumference && !diameter}
                >
                    Find My Size
                </Button>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                    <p className="text-rose-600 text-small-regular">{error}</p>
                </div>
            )}

            {foundSize && (
                <div className="mt-4 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="text-base-semi mb-3 text-green-900">✅ Your Estimated Ring Size:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-small-regular text-green-700 mb-1">US Size</p>
                            <p className="text-xl-semi text-green-900">{foundSize.size_us}</p>
                        </div>
                        <div>
                            <p className="text-small-regular text-green-700 mb-1">UK Size</p>
                            <p className="text-xl-semi text-green-900">{foundSize.size_uk}</p>
                        </div>
                        <div>
                            <p className="text-small-regular text-green-700 mb-1">EU Size</p>
                            <p className="text-xl-semi text-green-900">{foundSize.size_eu}</p>
                        </div>
                        <div>
                            <p className="text-small-regular text-green-700 mb-1">Asia Size</p>
                            <p className="text-xl-semi text-green-900">{foundSize.size_asia}</p>
                        </div>
                    </div>
                    <div className="text-small-regular text-green-700">
                        <p>
                            <strong>Measurements:</strong> {foundSize.circumference_mm}mm circumference, {foundSize.diameter_mm}mm diameter
                        </p>
                    </div>
                    <p className="text-small-regular text-green-600 mt-3">
                        💡 This is an estimate. We recommend verifying your size with a jeweler or our printable ring sizer for the best fit.
                    </p>
                </div>
            )}
        </div>
    )
}
