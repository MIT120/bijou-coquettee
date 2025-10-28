"use client"

import { useState, useEffect } from "react"
import { Dialog, Transition, Tab } from "@headlessui/react"
import { XMarkMini, Ruler } from "@medusajs/icons"
import { Fragment } from "react"
import SizeChart from "./size-chart"
import MeasurementGuide from "./measurement-guide"
import SizeFinder from "./size-finder"
import { getCategoryData } from "@lib/data/size-guide"

type SizeGuideProps = {
    category: "ring" | "necklace" | "bracelet" | "chain"
}

/**
 * Size Guide Modal Component
 * Displays size charts, measurement instructions, and size finder tool
 */
export default function SizeGuide({ category }: SizeGuideProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch data when modal opens
    useEffect(() => {
        if (isOpen && !data) {
            loadData()
        }
    }, [isOpen])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)
            const categoryData = await getCategoryData(category)
            setData(categoryData)
        } catch (err) {
            console.error("Failed to load size guide data:", err)
            setError("Failed to load size guide. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const closeModal = () => setIsOpen(false)
    const openModal = () => setIsOpen(true)

    const getCategoryTitle = () => {
        switch (category) {
            case "ring":
                return "Ring Size Guide"
            case "necklace":
                return "Necklace Length Guide"
            case "bracelet":
                return "Bracelet Size Guide"
            case "chain":
                return "Chain Length Guide"
            default:
                return "Size Guide"
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-2 text-ui-fg-interactive hover:text-ui-fg-interactive-hover text-small-regular underline"
            >
                <Ruler className="w-4 h-4" />
                Size Guide
            </button>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[75]" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex justify-between items-center mb-6">
                                        <Dialog.Title as="h3" className="text-xl-semi text-ui-fg-base">
                                            {getCategoryTitle()}
                                        </Dialog.Title>
                                        <button
                                            onClick={closeModal}
                                            className="text-ui-fg-muted hover:text-ui-fg-base transition-colors"
                                        >
                                            <XMarkMini />
                                        </button>
                                    </div>

                                    {loading && (
                                        <div className="py-12 text-center">
                                            <p className="text-ui-fg-muted">Loading size guide...</p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="py-12 text-center">
                                            <p className="text-rose-500">{error}</p>
                                            <button
                                                onClick={loadData}
                                                className="mt-4 text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline"
                                            >
                                                Try again
                                            </button>
                                        </div>
                                    )}

                                    {!loading && !error && data && (
                                        <Tab.Group>
                                            <Tab.List className="flex space-x-1 rounded-xl bg-ui-bg-subtle p-1 mb-6">
                                                <Tab
                                                    className={({ selected }) =>
                                                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                            ${selected
                                                            ? "bg-white text-ui-fg-base shadow"
                                                            : "text-ui-fg-muted hover:bg-white/[0.12] hover:text-ui-fg-base"
                                                        }`
                                                    }
                                                >
                                                    Size Chart
                                                </Tab>
                                                <Tab
                                                    className={({ selected }) =>
                                                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                            ${selected
                                                            ? "bg-white text-ui-fg-base shadow"
                                                            : "text-ui-fg-muted hover:bg-white/[0.12] hover:text-ui-fg-base"
                                                        }`
                                                    }
                                                >
                                                    How to Measure
                                                </Tab>
                                                {category === "ring" && (
                                                    <Tab
                                                        className={({ selected }) =>
                                                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                              ${selected
                                                                ? "bg-white text-ui-fg-base shadow"
                                                                : "text-ui-fg-muted hover:bg-white/[0.12] hover:text-ui-fg-base"
                                                            }`
                                                        }
                                                    >
                                                        Size Finder
                                                    </Tab>
                                                )}
                                            </Tab.List>
                                            <Tab.Panels>
                                                <Tab.Panel>
                                                    <SizeChart sizeChart={data.sizeChart} category={category} />
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <MeasurementGuide
                                                        measurementGuide={data.measurementGuide}
                                                        category={category}
                                                    />
                                                </Tab.Panel>
                                                {category === "ring" && (
                                                    <Tab.Panel>
                                                        <SizeFinder />
                                                    </Tab.Panel>
                                                )}
                                            </Tab.Panels>
                                        </Tab.Group>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
