"use client"

import { useState, useEffect } from "react"
import { X, Ruler, Download, Search } from "lucide-react"
import { getSizeGuideByCategory, type CategoryData } from "@lib/data/size-guide"
import SizeChart from "./size-chart"
import MeasurementGuide from "./measurement-guide"
import SizeFinder from "./size-finder"

interface SizeGuideModalProps {
    category: "ring" | "necklace" | "bracelet" | "chain"
    isOpen: boolean
    onClose: () => void
}

export default function SizeGuideModal({
    category,
    isOpen,
    onClose,
}: SizeGuideModalProps) {
    const [data, setData] = useState<CategoryData | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"chart" | "measure" | "finder">("chart")

    useEffect(() => {
        if (isOpen) {
            fetchSizeGuide()
        }
    }, [isOpen, category])

    const fetchSizeGuide = async () => {
        setLoading(true)
        const result = await getSizeGuideByCategory(category)
        setData(result)
        setLoading(false)
    }

    if (!isOpen) return null

    const categoryNames = {
        ring: "Ring",
        necklace: "Necklace",
        bracelet: "Bracelet",
        chain: "Chain",
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden bg-white rounded-lg shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-ui-border-base">
                    <div>
                        <h2 className="text-2xl font-semibold text-ui-fg-base">
                            {categoryNames[category]} Size Guide
                        </h2>
                        <p className="text-sm text-ui-fg-subtle mt-1">
                            Find your perfect fit with our comprehensive sizing guide
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-ui-bg-subtle transition-colors"
                        aria-label="Close size guide"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-ui-border-base bg-ui-bg-subtle">
                    <button
                        onClick={() => setActiveTab("chart")}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === "chart"
                                ? "text-ui-fg-base border-b-2 border-ui-fg-base bg-white"
                                : "text-ui-fg-subtle hover:text-ui-fg-base"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Ruler className="w-4 h-4" />
                            Size Chart
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("measure")}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === "measure"
                                ? "text-ui-fg-base border-b-2 border-ui-fg-base bg-white"
                                : "text-ui-fg-subtle hover:text-ui-fg-base"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            How to Measure
                        </div>
                    </button>
                    {category === "ring" && (
                        <button
                            onClick={() => setActiveTab("finder")}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === "finder"
                                    ? "text-ui-fg-base border-b-2 border-ui-fg-base bg-white"
                                    : "text-ui-fg-subtle hover:text-ui-fg-base"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Search className="w-4 h-4" />
                                Size Finder
                            </div>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-ui-border-base border-t-ui-fg-base rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {activeTab === "chart" && data && (
                                <SizeChart
                                    category={category}
                                    sizeChart={data.sizeChart}
                                />
                            )}
                            {activeTab === "measure" && data?.measurementGuide && (
                                <MeasurementGuide
                                    category={category}
                                    guide={data.measurementGuide}
                                />
                            )}
                            {activeTab === "finder" && category === "ring" && (
                                <SizeFinder category={category} />
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-ui-border-base bg-ui-bg-subtle">
                    <p className="text-xs text-ui-fg-subtle text-center">
                        💡 Tip: For the most accurate sizing, we recommend visiting a professional jeweler or ordering our free ring sizer kit
                    </p>
                </div>
            </div>
        </div>
    )
}

