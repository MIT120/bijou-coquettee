import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { ImageTextContent } from "@/types/cms"

const ImageTextSection = ({ content }: { content: ImageTextContent }) => {
    const isImageRight = content.layout === "image_right"

    return (
        <section className="content-container py-14 small:py-24">
            <div
                className={`grid grid-cols-1 small:grid-cols-2 gap-8 small:gap-16 items-center ${
                    isImageRight ? "" : "small:[direction:rtl] small:[&>*]:[direction:ltr]"
                }`}
            >
                <div className="space-y-6">
                    <Heading
                        level="h2"
                        className="font-display text-2xl small:text-3xl large:text-4xl text-grey-90 font-light tracking-tight"
                    >
                        {content.heading}
                    </Heading>
                    <Text className="font-sans text-base small:text-lg text-grey-60 font-light leading-relaxed">
                        {content.body}
                    </Text>
                    {content.cta_text && content.cta_link && (
                        <LocalizedClientLink
                            href={content.cta_link}
                            className="inline-block border border-grey-90 text-grey-90 px-8 py-3 text-sm tracking-[0.14em] uppercase font-sans font-normal hover:bg-grey-90 hover:text-white transition-all duration-300"
                        >
                            {content.cta_text}
                        </LocalizedClientLink>
                    )}
                </div>
                <div className="aspect-[4/5] overflow-hidden">
                    <img
                        src={content.image_url}
                        alt={content.image_alt || content.heading}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </section>
    )
}

export default ImageTextSection
