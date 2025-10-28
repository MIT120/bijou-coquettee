"use client"

import { CheckCircle2 } from "lucide-react"
import { type MeasurementGuide as MeasurementGuideType } from "@lib/data/size-guide"

interface MeasurementGuideProps {
    category: "ring" | "necklace" | "bracelet" | "chain"
    guide: MeasurementGuideType
}

export default function MeasurementGuide({
    category,
    guide,
}: MeasurementGuideProps) {
    // Parse markdown-style instructions
    const renderInstructions = (text: string) => {
        return text.split("\n\n").map((paragraph, idx) => {
            // Check if it's a heading (starts with **)
            if (paragraph.startsWith("**") && paragraph.includes(":**")) {
                const headingMatch = paragraph.match(/\*\*(.*?)\*\*:?/)
                if (headingMatch) {
                    const heading = headingMatch[1]
                    const content = paragraph.replace(headingMatch[0], "").trim()
                    return (
                        <div key={idx} className="mb-6">
                            <h4 className="font-semibold text-ui-fg-base mb-2">{heading}</h4>
                            <p className="text-sm text-ui-fg-subtle whitespace-pre-line">
                                {content}
                            </p>
                        </div>
                    )
                }
            }
            // Regular paragraph
            return (
                <p key={idx} className="text-sm text-ui-fg-subtle mb-4 whitespace-pre-line">
                    {paragraph}
                </p>
            )
        })
    }

    return (
        <div className="space-y-8">
            {/* Title */}
            <div>
                <h3 className="text-xl font-semibold text-ui-fg-base mb-2">
                    {guide.title}
                </h3>
            </div>

            {/* Instructions */}
            <div className="prose prose-sm max-w-none">
                {renderInstructions(guide.instructions)}
            </div>

            {/* Tips */}
            {guide.tips && guide.tips.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-6">
                    <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Important Tips
                    </h4>
                    <ul className="space-y-2">
                        {guide.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-green-900 flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Additional Resources */}
            <div className="bg-ui-bg-subtle border border-ui-border-base rounded-md p-6">
                <h4 className="font-semibold text-ui-fg-base mb-3">
                    Need More Help?
                </h4>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-ui-border-base flex-shrink-0">
                            📏
                        </div>
                        <div>
                            <h5 className="text-sm font-medium text-ui-fg-base">
                                Order a Free Ring Sizer
                            </h5>
                            <p className="text-xs text-ui-fg-subtle mt-1">
                                Get an accurate measurement with our complimentary ring sizer kit
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-ui-border-base flex-shrink-0">
                            💬
                        </div>
                        <div>
                            <h5 className="text-sm font-medium text-ui-fg-base">
                                Chat with an Expert
                            </h5>
                            <p className="text-xs text-ui-fg-subtle mt-1">
                                Our jewelry specialists are here to help you find the perfect fit
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-ui-border-base flex-shrink-0">
                            🏪
                        </div>
                        <div>
                            <h5 className="text-sm font-medium text-ui-fg-base">
                                Visit a Professional Jeweler
                            </h5>
                            <p className="text-xs text-ui-fg-subtle mt-1">
                                Get professionally sized at any local jewelry store
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

