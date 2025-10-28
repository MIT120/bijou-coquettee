"use client"

import { useState } from "react"
import { Ruler } from "lucide-react"
import SizeGuideModal from "../size-guide"

interface SizeGuideButtonProps {
    category: "ring" | "necklace" | "bracelet" | "chain"
    className?: string
}

export default function SizeGuideButton({
    category,
    className = "",
}: SizeGuideButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors ${className}`}
            >
                <Ruler className="w-4 h-4" />
                Size Guide
            </button>

            <SizeGuideModal
                category={category}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    )
}

