import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { HeroContent } from "@/types/cms"

const HeroSection = ({ content }: { content: HeroContent }) => {
    const opacity = content.overlay_opacity ?? 40

    return (
        <section className="relative w-full h-[60vh] small:h-[75vh] overflow-hidden">
            <img
                src={content.image_url}
                alt={content.heading}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: content.overlay_color || "rgba(0,0,0,0.4)",
                    opacity: opacity / 100,
                }}
            />
            <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
                {content.subheading && (
                    <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-white/80 font-normal mb-4">
                        {content.subheading}
                    </span>
                )}
                <Heading
                    level="h1"
                    className="font-display text-3xl small:text-5xl large:text-6xl text-white font-light tracking-tight max-w-4xl"
                >
                    {content.heading}
                </Heading>
                {content.cta_text && content.cta_link && (
                    <LocalizedClientLink
                        href={content.cta_link}
                        className="mt-8 inline-block border border-white text-white px-8 py-3 text-sm tracking-[0.14em] uppercase font-sans font-normal hover:bg-white hover:text-grey-90 transition-all duration-300"
                    >
                        {content.cta_text}
                    </LocalizedClientLink>
                )}
            </div>
        </section>
    )
}

export default HeroSection
