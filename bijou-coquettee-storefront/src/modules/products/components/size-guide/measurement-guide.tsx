import React from "react"

type MeasurementGuideProps = {
    measurementGuide: any
    category: string
}

/**
 * Measurement Guide Component
 * Displays instructions for measuring jewelry sizes
 */
export default function MeasurementGuide({ measurementGuide, category }: MeasurementGuideProps) {
    if (!measurementGuide) {
        return (
            <div className="text-center py-8 text-ui-fg-muted">
                <p>No measurement guide available for this category.</p>
            </div>
        )
    }

    return (
        <div className="measurement-guide space-y-6">
            <div>
                <h4 className="text-base-semi mb-3 text-ui-fg-base">{measurementGuide.title}</h4>
                <div className="text-small-regular text-ui-fg-subtle whitespace-pre-line">
                    {measurementGuide.instructions}
                </div>
            </div>

            {measurementGuide.tips && measurementGuide.tips.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="text-base-semi mb-3 text-blue-900">💡 Helpful Tips</h5>
                    <ul className="space-y-2">
                        {measurementGuide.tips.map((tip: string, index: number) => (
                            <li key={index} className="text-small-regular text-blue-800 flex gap-2">
                                <span className="text-blue-500 font-bold">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {measurementGuide.image_url && (
                <div className="mt-6">
                    <img
                        src={measurementGuide.image_url}
                        alt={`${category} measurement guide`}
                        className="w-full rounded-lg border border-ui-border-base"
                    />
                </div>
            )}

            {measurementGuide.video_url && (
                <div className="mt-6">
                    <h5 className="text-base-semi mb-3">Video Guide</h5>
                    <div className="aspect-video rounded-lg overflow-hidden border border-ui-border-base">
                        <iframe
                            src={measurementGuide.video_url}
                            className="w-full h-full"
                            allowFullScreen
                            title={`${category} measurement video guide`}
                        />
                    </div>
                </div>
            )}

            <div className="mt-6 p-4 bg-ui-bg-subtle rounded-lg">
                <p className="text-small-regular text-ui-fg-muted">
                    <strong>Need help?</strong> Contact our jewelry experts for personalized sizing assistance or visit a local jeweler for professional measurement.
                </p>
            </div>
        </div>
    )
}
