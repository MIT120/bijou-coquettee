import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { CtaContent } from "@/types/cms"

const CtaSection = ({ content }: { content: CtaContent }) => {
    return (
        <section
            className="py-14 small:py-24"
            style={{
                backgroundColor: content.background_color || undefined,
            }}
        >
            <div className="content-container text-center max-w-3xl mx-auto space-y-6">
                <Heading
                    level="h2"
                    className="font-display text-2xl small:text-3xl large:text-4xl text-grey-90 font-light tracking-tight"
                >
                    {content.heading}
                </Heading>
                {content.description && (
                    <Text className="font-sans text-base small:text-lg text-grey-60 font-light leading-relaxed">
                        {content.description}
                    </Text>
                )}
                <div className="pt-4">
                    <LocalizedClientLink
                        href={content.button_link}
                        className="inline-block border border-grey-90 text-grey-90 px-10 py-3.5 text-sm tracking-[0.14em] uppercase font-sans font-normal hover:bg-grey-90 hover:text-white transition-all duration-300"
                    >
                        {content.button_text}
                    </LocalizedClientLink>
                </div>
            </div>
        </section>
    )
}

export default CtaSection
