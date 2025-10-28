import React from "react"

type SizeChartProps = {
    sizeChart: any[]
    category: string
}

/**
 * Size Chart Component
 * Displays a table of size conversions
 */
export default function SizeChart({ sizeChart, category }: SizeChartProps) {
    if (!sizeChart || sizeChart.length === 0) {
        return (
            <div className="text-center py-8 text-ui-fg-muted">
                <p>No size chart available for this category.</p>
            </div>
        )
    }

    // Ring size chart
    if (category === "ring") {
        return (
            <div className="size-chart">
                <p className="text-small-regular mb-4 text-ui-fg-muted">
                    Find your perfect ring size with our comprehensive size conversion chart.
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-small-regular table-auto border-collapse">
                        <thead>
                            <tr className="bg-ui-bg-subtle text-ui-fg-subtle border-b border-ui-border-base">
                                <th className="p-3 text-left font-semibold">US Size</th>
                                <th className="p-3 text-left font-semibold">UK Size</th>
                                <th className="p-3 text-left font-semibold">EU Size</th>
                                <th className="p-3 text-left font-semibold">Asia Size</th>
                                <th className="p-3 text-left font-semibold">Circumference (mm)</th>
                                <th className="p-3 text-left font-semibold">Diameter (mm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sizeChart.map((entry: any, index: number) => (
                                <tr
                                    key={entry.id || index}
                                    className="border-b border-ui-border-base last:border-b-0 hover:bg-ui-bg-subtle/50 transition-colors"
                                >
                                    <td className="p-3 font-medium">{entry.size_us}</td>
                                    <td className="p-3">{entry.size_uk}</td>
                                    <td className="p-3">{entry.size_eu}</td>
                                    <td className="p-3">{entry.size_asia}</td>
                                    <td className="p-3">{entry.circumference_mm}</td>
                                    <td className="p-3">{entry.diameter_mm}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    // Necklace/Bracelet/Chain length chart
    return (
        <div className="size-chart">
            <p className="text-small-regular mb-4 text-ui-fg-muted">
                Choose the perfect length for your jewelry.
            </p>
            <div className="space-y-3">
                {sizeChart.map((entry: any, index: number) => (
                    <div
                        key={entry.id || index}
                        className="p-4 border border-ui-border-base rounded-lg hover:bg-ui-bg-subtle/50 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h4 className="text-base-semi text-ui-fg-base mb-1">
                                    {entry.length_cm} cm ({(entry.length_cm / 2.54).toFixed(1)}")
                                </h4>
                                {entry.description && (
                                    <p className="text-small-regular text-ui-fg-muted">
                                        {entry.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
