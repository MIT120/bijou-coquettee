"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { findSizeByMeasurement, type SizeGuideData } from "@lib/data/size-guide"

interface SizeFinderProps {
    category: "ring" | "necklace" | "bracelet" | "chain"
}

export default function SizeFinder({ category }: SizeFinderProps) {
    const [measurementType, setMeasurementType] = useState<
        "circumference_mm" | "diameter_mm"
    >("circumference_mm")
    const [measurement, setMeasurement] = useState("")
    const [result, setResult] = useState<SizeGuideData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleFindSize = async () => {
        const value = parseFloat(measurement)

        if (!measurement || isNaN(value) || value <= 0) {
            setError("Please enter a valid measurement")
            return
        }

        setError("")
        setLoading(true)

        try {
            const size = await findSizeByMeasurement(
                category,
                value,
                measurementType
            )
            setResult(size)
            if (!size) {
                setError("No matching size found for this measurement")
            }
        } catch (err) {
            setError("Error finding size. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-ui-fg-base mb-2">
                    Find Your Ring Size
                </h3>
                <p className="text-sm text-ui-fg-subtle">
                    Enter your measurement to find your perfect ring size
                </p>
            </div>

            {/* Measurement Type Selection */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-ui-fg-base">
                    What did you measure?
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setMeasurementType("circumference_mm")}
                        className={`p-4 border rounded-md text-left transition-colors ${measurementType === "circumference_mm"
                                ? "border-ui-fg-base bg-ui-bg-subtle"
                                : "border-ui-border-base hover:border-ui-fg-subtle"
                            }`}
                    >
                        <div className="font-medium text-ui-fg-base text-sm mb-1">
                            Circumference
                        </div>
                        <div className="text-xs text-ui-fg-subtle">
                            Around your finger
                        </div>
                    </button>
                    <button
                        onClick={() => setMeasurementType("diameter_mm")}
                        className={`p-4 border rounded-md text-left transition-colors ${measurementType === "diameter_mm"
                                ? "border-ui-fg-base bg-ui-bg-subtle"
                                : "border-ui-border-base hover:border-ui-fg-subtle"
                            }`}
                    >
                        <div className="font-medium text-ui-fg-base text-sm mb-1">
                            Diameter
                        </div>
                        <div className="text-xs text-ui-fg-subtle">
                            Across the ring
                        </div>
                    </button>
                </div>
            </div>

            {/* Measurement Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-ui-fg-base">
                    Enter your measurement (mm)
                </label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={measurement}
                        onChange={(e) => setMeasurement(e.target.value)}
                        placeholder={
                            measurementType === "circumference_mm"
                                ? "e.g., 52.5"
                                : "e.g., 16.7"
                        }
                        className="flex-1 px-4 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-base"
                        step="0.1"
                        min="0"
                    />
                    <button
                        onClick={handleFindSize}
                        disabled={loading}
                        className="px-6 py-2 bg-ui-fg-base text-white rounded-md hover:bg-ui-fg-base/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                        Find Size
                    </button>
                </div>
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
            </div>

            {/* Result */}
            {result && (
                <div className="bg-green-50 border border-green-200 rounded-md p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="font-semibold text-green-900 text-lg mb-1">
                                Your Ring Size
                            </h4>
                            <p className="text-sm text-green-700">
                                Based on your {measurementType === "circumference_mm" ? "circumference" : "diameter"} of {measurement}mm
                            </p>
                        </div>
                        <div className="text-3xl">💍</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-md p-3 border border-green-200">
                            <div className="text-xs text-green-700 mb-1">US Size</div>
                            <div className="text-xl font-bold text-green-900">
                                {result.size_us}
                            </div>
                        </div>
                        <div className="bg-white rounded-md p-3 border border-green-200">
                            <div className="text-xs text-green-700 mb-1">UK Size</div>
                            <div className="text-xl font-bold text-green-900">
                                {result.size_uk}
                            </div>
                        </div>
                        <div className="bg-white rounded-md p-3 border border-green-200">
                            <div className="text-xs text-green-700 mb-1">EU Size</div>
                            <div className="text-xl font-bold text-green-900">
                                {result.size_eu}
                            </div>
                        </div>
                        <div className="bg-white rounded-md p-3 border border-green-200">
                            <div className="text-xs text-green-700 mb-1">Asia Size</div>
                            <div className="text-xl font-bold text-green-900">
                                {result.size_asia}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="text-sm text-green-900 space-y-1">
                            <p>
                                <strong>Diameter:</strong> {result.diameter_mm?.toFixed(1)} mm
                            </p>
                            <p>
                                <strong>Circumference:</strong> {result.circumference_mm?.toFixed(1)} mm
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                    Measurement Tips
                </h4>
                <ul className="text-sm text-blue-900 space-y-1">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Measure at the end of the day when fingers are warmest</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Measure the exact finger you'll wear the ring on</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>If between sizes, choose the larger size</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

