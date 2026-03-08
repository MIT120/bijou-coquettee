import Image from "next/image"
import Link from "next/link"

import type {
    PageSection,
    HeroContent,
    RichTextContent,
    ImageTextContent,
    GalleryContent,
    StatsContent,
    TeamContent,
    CtaContent,
} from "@/types/cms"

// ---------------------------------------------------------------------------
// Individual section renderers
// ---------------------------------------------------------------------------

function HeroSection({ content }: { content: HeroContent }) {
    const overlayOpacity =
        content.overlay_opacity != null ? content.overlay_opacity / 100 : 0.4

    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative h-[420px] small:h-[560px] w-full">
                <Image
                    src={content.image_url}
                    alt={content.heading}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />

                {/* Overlay */}
                <div
                    className="absolute inset-0"
                    style={
                        content.overlay_color
                            ? {
                                  backgroundColor: content.overlay_color,
                                  opacity: overlayOpacity,
                              }
                            : { opacity: overlayOpacity }
                    }
                >
                    {!content.overlay_color && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    )}
                </div>

                {/* Text content */}
                <div className="absolute inset-0 flex items-center">
                    <div className="content-container">
                        <div className="max-w-2xl space-y-4">
                            <h1 className="font-display text-3xl small:text-5xl text-white font-light tracking-tight leading-tight">
                                {content.heading}
                            </h1>
                            {content.subheading && (
                                <p className="font-sans text-base small:text-lg text-white/80 font-light leading-relaxed">
                                    {content.subheading}
                                </p>
                            )}
                            {content.cta_text && content.cta_link && (
                                <div className="pt-2">
                                    <Link
                                        href={content.cta_link}
                                        className="inline-block rounded-full border border-white bg-transparent px-8 py-3 font-sans text-xs uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-white hover:text-grey-90"
                                    >
                                        {content.cta_text}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function RichTextSection({ content }: { content: RichTextContent }) {
    const alignClass =
        content.alignment === "center"
            ? "text-center mx-auto"
            : content.alignment === "right"
            ? "text-right ml-auto"
            : "text-left"

    return (
        <section className="py-12 small:py-16">
            <div className="content-container">
                <div className={`max-w-3xl space-y-4 ${alignClass}`}>
                    {content.label && (
                        <span className="font-sans text-xs tracking-[0.18em] uppercase text-grey-60 font-normal">
                            {content.label}
                        </span>
                    )}
                    <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight">
                        {content.heading}
                    </h2>
                    <div
                        className="font-sans text-sm small:text-base text-grey-60 font-light leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.body }}
                    />
                </div>
            </div>
        </section>
    )
}

function ImageTextSection({ content }: { content: ImageTextContent }) {
    const isImageRight = content.layout === "image_right"

    return (
        <section className="py-12 small:py-16">
            <div className="content-container">
                <div
                    className={`flex flex-col gap-10 small:gap-16 ${
                        isImageRight
                            ? "small:flex-row-reverse"
                            : "small:flex-row"
                    } items-center`}
                >
                    {/* Image */}
                    <div className="w-full small:w-1/2 shrink-0">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-cream-200">
                            <Image
                                src={content.image_url}
                                alt={content.image_alt ?? content.heading}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="w-full small:w-1/2 space-y-5">
                        <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight">
                            {content.heading}
                        </h2>
                        <div
                            className="font-sans text-sm small:text-base text-grey-60 font-light leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: content.body }}
                        />
                        {content.cta_text && content.cta_link && (
                            <div className="pt-2">
                                <Link
                                    href={content.cta_link}
                                    className="inline-block rounded-full border border-grey-90 bg-grey-90 px-8 py-3 font-sans text-xs uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-grey-80"
                                >
                                    {content.cta_text}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

function GallerySection({ content }: { content: GalleryContent }) {
    const columns = content.columns ?? 3

    const colsClass: Record<2 | 3 | 4, string> = {
        2: "grid-cols-1 xsmall:grid-cols-2",
        3: "grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3",
        4: "grid-cols-2 xsmall:grid-cols-3 small:grid-cols-4",
    }

    return (
        <section className="py-12 small:py-16">
            <div className="content-container space-y-8">
                {content.heading && (
                    <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight text-center">
                        {content.heading}
                    </h2>
                )}
                <div className={`grid ${colsClass[columns]} gap-4 small:gap-6`}>
                    {content.images.map((img, index) => (
                        <div key={index} className="group space-y-2">
                            <div className="relative aspect-square overflow-hidden rounded-sm bg-cream-200">
                                <Image
                                    src={img.image_url}
                                    alt={img.alt ?? `Gallery image ${index + 1}`}
                                    fill
                                    sizes={
                                        columns === 2
                                            ? "(max-width: 512px) 100vw, 50vw"
                                            : columns === 4
                                            ? "(max-width: 512px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            : "(max-width: 512px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    }
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                            {img.caption && (
                                <p className="font-sans text-xs text-grey-50 font-light text-center">
                                    {img.caption}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function StatsSection({ content }: { content: StatsContent }) {
    const count = content.stats.length
    const colsClass =
        count <= 2
            ? "grid-cols-1 xsmall:grid-cols-2"
            : count === 3
            ? "grid-cols-1 xsmall:grid-cols-3"
            : "grid-cols-2 small:grid-cols-4"

    return (
        <section className="py-12 small:py-16 border-t border-grey-10 border-b">
            <div className="content-container space-y-10">
                {content.heading && (
                    <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight text-center">
                        {content.heading}
                    </h2>
                )}
                <div className={`grid ${colsClass} gap-8 small:gap-12`}>
                    {content.stats.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center space-y-2 group hover:opacity-80 transition-opacity duration-300"
                        >
                            <p className="font-display text-4xl small:text-5xl text-grey-90 font-light group-hover:translate-y-[-2px] transition-transform duration-300">
                                {stat.value}
                            </p>
                            <p className="font-sans text-xs uppercase tracking-[0.18em] text-grey-50 font-normal">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function TeamSection({ content }: { content: TeamContent }) {
    const count = content.members.length
    const colsClass =
        count === 1
            ? "grid-cols-1 max-w-xs mx-auto"
            : count === 2
            ? "grid-cols-1 xsmall:grid-cols-2"
            : "grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3"

    return (
        <section className="py-12 small:py-16">
            <div className="content-container space-y-10">
                {content.heading && (
                    <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight text-center">
                        {content.heading}
                    </h2>
                )}
                <div className={`grid ${colsClass} gap-8 small:gap-10`}>
                    {content.members.map((member, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center space-y-4"
                        >
                            {member.image_url ? (
                                <div className="relative h-32 w-32 small:h-40 small:w-40 overflow-hidden rounded-full bg-cream-200 border border-grey-20 shrink-0">
                                    <Image
                                        src={member.image_url}
                                        alt={member.name}
                                        fill
                                        sizes="(max-width: 1024px) 128px, 160px"
                                        className="object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            ) : (
                                <div className="h-32 w-32 small:h-40 small:w-40 rounded-full bg-cream-300 border border-grey-20 flex items-center justify-center shrink-0">
                                    <span className="font-display text-3xl text-grey-40 font-light">
                                        {member.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                            <div className="space-y-1">
                                <h3 className="font-display text-lg small:text-xl text-grey-90 font-light">
                                    {member.name}
                                </h3>
                                <p className="font-sans text-xs uppercase tracking-[0.14em] text-soft-gold font-normal">
                                    {member.role}
                                </p>
                            </div>
                            {member.bio && (
                                <p className="font-sans text-sm text-grey-60 font-light leading-relaxed max-w-xs">
                                    {member.bio}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function CtaSection({ content }: { content: CtaContent }) {
    return (
        <section
            className="py-14 small:py-20"
            style={
                content.background_color
                    ? { backgroundColor: content.background_color }
                    : undefined
            }
        >
            <div
                className={`content-container text-center space-y-6 ${
                    !content.background_color ? "bg-cream-200 rounded-sm py-14 small:py-20" : ""
                }`}
            >
                <h2 className="font-display text-2xl small:text-4xl text-grey-90 font-light tracking-tight">
                    {content.heading}
                </h2>
                {content.description && (
                    <p className="font-sans text-sm small:text-base text-grey-60 font-light leading-relaxed max-w-xl mx-auto">
                        {content.description}
                    </p>
                )}
                <div className="pt-2">
                    <Link
                        href={content.button_link}
                        className="inline-block rounded-full border border-grey-90 bg-grey-90 px-8 py-3 font-sans text-xs uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-grey-80"
                    >
                        {content.button_text}
                    </Link>
                </div>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

function renderSection(section: PageSection) {
    switch (section.type) {
        case "hero":
            return (
                <HeroSection
                    content={section.content as unknown as HeroContent}
                />
            )
        case "rich_text":
            return (
                <RichTextSection
                    content={section.content as unknown as RichTextContent}
                />
            )
        case "image_text":
            return (
                <ImageTextSection
                    content={section.content as unknown as ImageTextContent}
                />
            )
        case "gallery":
            return (
                <GallerySection
                    content={section.content as unknown as GalleryContent}
                />
            )
        case "stats":
            return (
                <StatsSection
                    content={section.content as unknown as StatsContent}
                />
            )
        case "team":
            return (
                <TeamSection
                    content={section.content as unknown as TeamContent}
                />
            )
        case "cta":
            return (
                <CtaSection
                    content={section.content as unknown as CtaContent}
                />
            )
        default:
            return null
    }
}

interface PageSectionRendererProps {
    sections: PageSection[]
}

export default function PageSectionRenderer({
    sections,
}: PageSectionRendererProps) {
    const sorted = [...sections].sort((a, b) => a.sort_order - b.sort_order)

    return (
        <>
            {sorted.map((section) => (
                <div key={section.id}>{renderSection(section)}</div>
            ))}
        </>
    )
}
