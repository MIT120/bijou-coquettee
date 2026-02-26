import { Heading, Text } from "@medusajs/ui"
import type { StatsContent } from "@/types/cms"

const StatsSection = ({ content }: { content: StatsContent }) => {
    return (
        <section className="content-container py-14 small:py-24">
            {content.heading && (
                <Heading
                    level="h2"
                    className="font-display text-2xl small:text-3xl large:text-4xl text-grey-90 font-light tracking-tight text-center mb-10 small:mb-16"
                >
                    {content.heading}
                </Heading>
            )}
            <div className="grid grid-cols-2 small:grid-cols-4 gap-8 small:gap-12 max-w-4xl mx-auto">
                {content.stats?.map((stat, i) => (
                    <div key={i} className="text-center space-y-2">
                        <div className="font-display text-3xl small:text-4xl large:text-5xl text-grey-90 font-light">
                            {stat.value}
                        </div>
                        <Text className="font-sans text-sm text-grey-50 font-light tracking-wide uppercase">
                            {stat.label}
                        </Text>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default StatsSection
