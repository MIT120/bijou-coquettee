"use client"

import { Download } from "lucide-react"
import { type SizeGuideData } from "@lib/data/size-guide"

interface SizeChartProps {
    category: "ring" | "necklace" | "bracelet" | "chain"
    sizeChart: SizeGuideData[]
}

export default function SizeChart({ category, sizeChart }: SizeChartProps) {
    const handleDownloadPDF = () => {
        // TODO: Implement PDF generation
        alert("PDF download coming soon!")
    }

    if (!sizeChart.length) {
        return (
            <div className="text-center py-8 text-ui-fg-subtle">
                No size chart available for this category
            </div>
        )
    }

    // Render based on category
    if (category === "ring") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-ui-fg-base">
                        Ring Size Conversion Chart
                    </h3>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ui-fg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-ui-bg-subtle border-b border-ui-border-base">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-ui-fg-base">
                                    US Size
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-ui-fg-base">
                                    UK Size
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-ui-fg-base">
                                    EU Size
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-ui-fg-base">
                                    Asia Size
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-ui-fg-base">
                                    Diameter (mm)
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-ui-fg-base">
                                    Circumference (mm)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ui-border-base">
                            {sizeChart.map((size) => (
                                <tr
                                    key={size.id}
                                    className="hover:bg-ui-bg-subtle/50 transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium text-ui-fg-base">
                                        {size.size_us}
                                    </td>
                                    <td className="px-4 py-3 text-ui-fg-subtle">
                                        {size.size_uk}
                                    </td>
                                    <td className="px-4 py-3 text-ui-fg-subtle">
                                        {size.size_eu}
                                    </td>
                                    <td className="px-4 py-3 text-ui-fg-subtle">
                                        {size.size_asia}
                                    </td>
                                    <td className="px-4 py-3 text-ui-fg-subtle">
                                        {size.diameter_mm?.toFixed(1)}
                                    </td>
                                    <td className="px-4 py-3 text-ui-fg-subtle">
                                        {size.circumference_mm?.toFixed(1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-900">
                        <strong>💡 Pro Tip:</strong> Ring sizes can vary between countries.
                        If you know your size in one system, use this chart to find your
                        size in another system.
                    </p>
                </div>
            </div>
        )
    }

    // Necklace/Bracelet/Chain - Length-based
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-ui-fg-base">
                    {category.charAt(0).toUpperCase() + category.slice(1)} Length Guide
                </h3>
            </div>

            <div className="grid gap-4">
                {sizeChart.map((size) => (
                    <div
                        key={size.id}
                        className="border border-ui-border-base rounded-md p-4 hover:border-ui-fg-subtle transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-medium text-ui-fg-base">
                                    {size.length_cm} cm
                                </h4>
                                {size.description && (
                                    <p className="text-sm text-ui-fg-subtle mt-1">
                                        {size.description}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-medium text-ui-fg-base">
                                    {((size.length_cm || 0) / 2.54).toFixed(1)}"
                                </span>
                                <p className="text-xs text-ui-fg-subtle">inches</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-900">
                    <strong>💡 Pro Tip:</strong> {category === "necklace"
                        ? "Choose length based on your neckline and personal style. Princess length (40-45cm) is the most versatile."
                        : "Measure your wrist and add 2cm for a comfortable fit. Add 1.5cm for snug or 2.5cm for loose."}
                </p>
            </div>
        </div>
    )
}

