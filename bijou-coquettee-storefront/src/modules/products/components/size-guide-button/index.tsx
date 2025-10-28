"use client"

import { Suspense } from "react"
import SizeGuide from "@modules/products/components/size-guide"

type SizeGuideButtonProps = {
    category: "ring" | "necklace" | "bracelet" | "chain"
}

/**
 * Size Guide Button Component
 * Triggers the size guide modal for the specified jewelry category
 */
export default function SizeGuideButton({ category }: SizeGuideButtonProps) {
    return (
        <Suspense fallback={<span className="text-small-regular text-ui-fg-muted">Loading size guide...</span>}>
            <SizeGuide category={category} />
        </Suspense>
    )
}
