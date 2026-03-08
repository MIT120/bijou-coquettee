"use client"

import { useState, useEffect } from "react"
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
    AccordionContent,
    VideoContent,
    FileDownloadContent,
    TestimonialContent,
    FeatureGridContent,
    DividerContent,
    BannerContent,
    LogoGridContent,
    CertificatesContent,
} from "@/types/cms"

import Lightbox from "@modules/common/components/lightbox"

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

// GalleryWithLightbox is "use client" by virtue of the file directive.
// It wraps the gallery grid and opens the Lightbox on image click.
function GallerySection({ content }: { content: GalleryContent }) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const columns = content.columns ?? 3

    const colsClass: Record<2 | 3 | 4, string> = {
        2: "grid-cols-1 xsmall:grid-cols-2",
        3: "grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3",
        4: "grid-cols-2 xsmall:grid-cols-3 small:grid-cols-4",
    }

    const lightboxImages = content.images.map((img, i) => ({
        src: img.image_url,
        alt: img.alt ?? `Gallery image ${i + 1}`,
        caption: img.caption,
    }))

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
                            <button
                                type="button"
                                className="relative block w-full aspect-square overflow-hidden rounded-sm bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-40"
                                onClick={() => setLightboxIndex(index)}
                                aria-label={`Open image ${index + 1} in lightbox`}
                            >
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
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/10">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-8 w-8 text-white opacity-0 drop-shadow transition-opacity duration-300 group-hover:opacity-90"
                                        aria-hidden="true"
                                    >
                                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                    </svg>
                                </div>
                            </button>
                            {img.caption && (
                                <p className="font-sans text-xs text-grey-50 font-light text-center">
                                    {img.caption}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    images={lightboxImages}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
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
// New section renderers
// ---------------------------------------------------------------------------

function AccordionSection({ content }: { content: AccordionContent }) {
    return (
        <section className="py-12 small:py-16">
            <div className="content-container">
                <div className="max-w-3xl mx-auto space-y-8">
                    {content.heading && (
                        <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight text-center">
                            {content.heading}
                        </h2>
                    )}
                    <div className="divide-y divide-grey-20">
                        {content.items.map((item, index) => (
                            <details key={index} className="group py-1">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-40 focus-visible:ring-offset-2 rounded-sm">
                                    <span className="font-display text-base small:text-lg text-grey-90 font-light leading-snug">
                                        {item.question}
                                    </span>
                                    <span className="shrink-0 text-grey-50 transition-transform duration-300 group-open:rotate-45">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        >
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="pb-5 pt-1">
                                    <p className="font-sans text-sm small:text-base text-grey-60 font-light leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function parseVideoEmbedUrl(url: string): string | null {
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.replace(/^www\./, "")

        // YouTube standard: youtube.com/watch?v=ID
        if (host === "youtube.com" && parsed.searchParams.has("v")) {
            const id = parsed.searchParams.get("v")
            return `https://www.youtube.com/embed/${id}`
        }

        // YouTube short: youtu.be/ID
        if (host === "youtu.be") {
            const id = parsed.pathname.replace("/", "")
            return `https://www.youtube.com/embed/${id}`
        }

        // YouTube embed already: youtube.com/embed/ID
        if (host === "youtube.com" && parsed.pathname.startsWith("/embed/")) {
            return url
        }

        // Vimeo: vimeo.com/ID
        if (host === "vimeo.com") {
            const id = parsed.pathname.replace("/", "")
            return `https://player.vimeo.com/video/${id}`
        }

        // Vimeo embed already: player.vimeo.com/video/ID
        if (host === "player.vimeo.com") {
            return url
        }

        return null
    } catch {
        return null
    }
}

function VideoSection({ content }: { content: VideoContent }) {
    const embedUrl = parseVideoEmbedUrl(content.video_url)

    const aspectClass =
        content.aspect_ratio === "4:3"
            ? "aspect-[4/3]"
            : content.aspect_ratio === "1:1"
            ? "aspect-square"
            : "aspect-video"

    return (
        <section className="py-12 small:py-16">
            <div className="content-container space-y-8">
                {(content.heading || content.description) && (
                    <div className="max-w-2xl mx-auto text-center space-y-3">
                        {content.heading && (
                            <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight">
                                {content.heading}
                            </h2>
                        )}
                        {content.description && (
                            <p className="font-sans text-sm small:text-base text-grey-60 font-light leading-relaxed">
                                {content.description}
                            </p>
                        )}
                    </div>
                )}

                <div className="max-w-4xl mx-auto">
                    {embedUrl ? (
                        <div className={`relative w-full ${aspectClass} overflow-hidden rounded-sm shadow-md bg-grey-10`}>
                            <iframe
                                src={embedUrl}
                                title={content.heading ?? "Video"}
                                className="absolute inset-0 h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <div className={`relative w-full ${aspectClass} flex items-center justify-center rounded-sm bg-cream-200`}>
                            <p className="font-sans text-sm text-grey-50">
                                Unable to embed video URL.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

function fileIconColor(type?: string): string {
    if (!type) return "text-grey-50"
    const t = type.toLowerCase()
    if (t.includes("pdf")) return "text-red-500"
    if (t.includes("doc") || t.includes("word")) return "text-blue-500"
    if (t.includes("xls") || t.includes("sheet") || t.includes("csv")) return "text-green-600"
    return "text-grey-50"
}

function FileIcon({ type }: { type?: string }) {
    const color = fileIconColor(type)
    const t = (type ?? "").toLowerCase()

    if (t.includes("pdf")) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-8 w-8 shrink-0 ${color}`}
                aria-hidden="true"
            >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
                <line x1="9" y1="9" x2="11" y2="9" />
            </svg>
        )
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-8 w-8 shrink-0 ${color}`}
            aria-hidden="true"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    )
}

function FileDownloadSection({ content }: { content: FileDownloadContent }) {
    return (
        <section className="py-12 small:py-16">
            <div className="content-container space-y-8">
                {(content.heading || content.description) && (
                    <div className="max-w-2xl space-y-3">
                        {content.heading && (
                            <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight">
                                {content.heading}
                            </h2>
                        )}
                        {content.description && (
                            <p className="font-sans text-sm small:text-base text-grey-60 font-light leading-relaxed">
                                {content.description}
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-4 small:gap-6">
                    {content.files.map((file, index) => {
                        const isPdf = (file.file_type ?? "").toLowerCase().includes("pdf")
                        return (
                            <div
                                key={index}
                                className="flex flex-col gap-4 rounded-sm border border-grey-20 bg-cream-200 p-5 transition-shadow duration-200 hover:shadow-sm"
                            >
                                <div className="flex items-start gap-3">
                                    <FileIcon type={file.file_type} />
                                    <div className="min-w-0 space-y-1">
                                        <p className="font-sans text-sm font-medium text-grey-90 leading-snug break-words">
                                            {file.file_name}
                                        </p>
                                        {file.file_size && (
                                            <p className="font-sans text-xs text-grey-50 font-light">
                                                {file.file_size}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {file.description && (
                                    <p className="font-sans text-xs text-grey-60 font-light leading-relaxed">
                                        {file.description}
                                    </p>
                                )}

                                <div className="mt-auto flex gap-2">
                                    <a
                                        href={file.file_url}
                                        download
                                        className="inline-flex items-center gap-1.5 rounded-full border border-grey-90 bg-grey-90 px-4 py-2 font-sans text-xs uppercase tracking-[0.10em] text-white transition-colors duration-200 hover:bg-grey-80"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Download
                                    </a>
                                    {isPdf && (
                                        <a
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-full border border-grey-30 px-4 py-2 font-sans text-xs uppercase tracking-[0.10em] text-grey-60 transition-colors duration-200 hover:border-grey-50 hover:text-grey-90"
                                        >
                                            Preview
                                        </a>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 ${i < rating ? "fill-soft-gold text-soft-gold" : "fill-grey-20 text-grey-20"}`}
                    aria-hidden="true"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    )
}

function TestimonialSection({ content }: { content: TestimonialContent }) {
    const count = content.testimonials.length
    const colsClass =
        count === 1
            ? "grid-cols-1 max-w-lg mx-auto"
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

                <div className={`grid ${colsClass} gap-6 small:gap-8`}>
                    {content.testimonials.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-5 rounded-sm border border-grey-10 bg-white p-6 small:p-8 shadow-sm"
                        >
                            {/* Large quotation mark */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="h-8 w-8 shrink-0 text-soft-gold opacity-60"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                            </svg>

                            {/* Rating */}
                            {item.rating != null && item.rating > 0 && (
                                <StarRating rating={item.rating} />
                            )}

                            {/* Quote */}
                            <p className="font-sans text-sm small:text-base text-grey-60 font-light leading-relaxed italic flex-1">
                                {item.quote}
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 border-t border-grey-10 pt-4">
                                {item.image_url && (
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-cream-200 border border-grey-20">
                                        <Image
                                            src={item.image_url}
                                            alt={item.author}
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-display text-sm text-grey-90 font-light leading-snug">
                                        {item.author}
                                    </p>
                                    {item.role && (
                                        <p className="font-sans text-xs text-grey-50 font-light">
                                            {item.role}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Preset SVG icons for FeatureGrid
function FeatureIcon({ name }: { name?: string }) {
    const cls = "h-6 w-6 text-grey-90"

    switch (name) {
        case "shield":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            )
        case "heart":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            )
        case "truck":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
            )
        case "star":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            )
        case "gem":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <polygon points="6 3 18 3 22 9 12 22 2 9" />
                    <polyline points="2 9 12 13 22 9" />
                    <line x1="12" y1="13" x2="6" y2="3" />
                    <line x1="12" y1="13" x2="18" y2="3" />
                </svg>
            )
        case "sparkle":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <path d="M12 3L13.5 9H20L14.5 13L16.5 19L12 15L7.5 19L9.5 13L4 9H10.5L12 3Z" />
                </svg>
            )
        case "clock":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            )
        case "award":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                </svg>
            )
        case "leaf":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <path d="M17 8C8 10 5.9 16.17 3.82 19.34L2 22l2-.5C6 20.5 9 19 12 19c7 0 11-5 11-10.5C23 6 22 3 20 2c-1 3-2 5-3 6z" />
                </svg>
            )
        case "globe":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            )
        default:
            // Default: diamond
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
                    <polygon points="6 3 18 3 22 9 12 22 2 9" />
                    <polyline points="2 9 12 13 22 9" />
                    <line x1="12" y1="13" x2="6" y2="3" />
                    <line x1="12" y1="13" x2="18" y2="3" />
                </svg>
            )
    }
}

function FeatureGridSection({ content }: { content: FeatureGridContent }) {
    const columns = content.columns ?? 3

    const colsClass: Record<2 | 3 | 4, string> = {
        2: "grid-cols-1 xsmall:grid-cols-2",
        3: "grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3",
        4: "grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4",
    }

    return (
        <section className="py-12 small:py-16">
            <div className="content-container space-y-10">
                {content.heading && (
                    <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight text-center">
                        {content.heading}
                    </h2>
                )}

                <div className={`grid ${colsClass[columns]} gap-8 small:gap-10`}>
                    {content.features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center gap-4">
                            {/* Icon circle */}
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-grey-20 bg-cream-200 transition-colors duration-300 hover:border-grey-40">
                                <FeatureIcon name={feature.icon} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-display text-base small:text-lg text-grey-90 font-light leading-snug">
                                    {feature.title}
                                </h3>
                                <p className="font-sans text-sm text-grey-60 font-light leading-relaxed max-w-xs mx-auto">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function DividerSection({ content }: { content: DividerContent }) {
    const spacingClass = {
        small: "py-4",
        medium: "py-8",
        large: "py-16",
    }[content.spacing] ?? "py-8"

    if (content.style === "space") {
        return <div className={spacingClass} aria-hidden="true" />
    }

    if (content.style === "dots") {
        return (
            <div className={`${spacingClass} flex items-center justify-center`} aria-hidden="true">
                <div className="flex items-center gap-3">
                    <span className="h-1 w-1 rounded-full bg-grey-30" />
                    <span className="h-1 w-1 rounded-full bg-grey-30" />
                    <span className="h-1 w-1 rounded-full bg-grey-30" />
                </div>
            </div>
        )
    }

    // "line" default
    return (
        <div className={`${spacingClass} content-container`} aria-hidden="true">
            <hr className="border-0 border-t border-grey-20" />
        </div>
    )
}

function BannerSection({ content }: { content: BannerContent }) {
    const presetStyles: Record<string, string> = {
        info: "bg-blue-50 text-blue-900",
        promo: "bg-cream-200 text-grey-90 border-y border-soft-gold/30",
        warning: "bg-amber-50 text-amber-900",
    }

    const hasCustomColors = content.background_color || content.text_color

    const containerStyle: React.CSSProperties = hasCustomColors
        ? {
              backgroundColor: content.background_color ?? undefined,
              color: content.text_color ?? undefined,
          }
        : {}

    const containerClass = hasCustomColors
        ? ""
        : presetStyles[content.style] ?? presetStyles.info

    return (
        <section
            className={`w-full py-5 small:py-6 ${containerClass}`}
            style={containerStyle}
        >
            <div className="content-container">
                <div className="flex flex-col items-center gap-4 text-center small:flex-row small:justify-between small:text-left">
                    <p className="font-sans text-sm small:text-base font-light leading-relaxed">
                        {content.text}
                    </p>
                    {content.cta_text && content.cta_link && (
                        <div className="shrink-0">
                            <Link
                                href={content.cta_link}
                                className="inline-block rounded-full border border-current px-6 py-2.5 font-sans text-xs uppercase tracking-[0.12em] transition-opacity duration-200 hover:opacity-70"
                            >
                                {content.cta_text}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

function LogoGridSection({ content }: { content: LogoGridContent }) {
    return (
        <section className="py-12 small:py-16">
            <div className="content-container space-y-8">
                {content.heading && (
                    <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight text-center">
                        {content.heading}
                    </h2>
                )}

                <div className="flex flex-wrap items-center justify-center gap-8 small:gap-12">
                    {content.logos.map((logo, index) => {
                        const img = (
                            <div
                                key={index}
                                className="flex items-center justify-center"
                            >
                                <Image
                                    src={logo.image_url}
                                    alt={logo.alt}
                                    width={160}
                                    height={48}
                                    className="max-h-12 w-auto object-contain grayscale transition-all duration-300 hover:grayscale-0"
                                    loading="lazy"
                                />
                            </div>
                        )

                        if (logo.link) {
                            return (
                                <Link
                                    key={index}
                                    href={logo.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-40 rounded-sm"
                                    aria-label={logo.alt}
                                >
                                    <Image
                                        src={logo.image_url}
                                        alt={logo.alt}
                                        width={160}
                                        height={48}
                                        className="max-h-12 w-auto object-contain grayscale transition-all duration-300 hover:grayscale-0"
                                        loading="lazy"
                                    />
                                </Link>
                            )
                        }

                        return img
                    })}
                </div>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Certificates section — data fetched client-side from certificate module
// ---------------------------------------------------------------------------

type CertificateItem = {
    id: string
    title: string
    description: string | null
    image_url: string
    link: string | null
    sort_order: number
}

function CertificatesSection({ content }: { content: CertificatesContent }) {
    const [certificates, setCertificates] = useState<CertificateItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const backendUrl =
            process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const publishableKey =
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

        fetch(`${backendUrl}/store/certificates`, {
            headers: publishableKey
                ? { "x-publishable-api-key": publishableKey }
                : {},
            next: { revalidate: 60 },
        } as any)
            .then((res) => res.json())
            .then((data) => {
                setCertificates(data.certificates ?? [])
            })
            .catch(() => {
                setCertificates([])
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <section className="py-12 small:py-16">
                <div className="content-container">
                    <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-grey-30 border-t-grey-90" />
                    </div>
                </div>
            </section>
        )
    }

    if (certificates.length === 0) return null

    const columns = content.columns || 3
    const colClasses =
        columns === 2
            ? "grid-cols-1 xsmall:grid-cols-2"
            : columns === 4
                ? "grid-cols-2 xsmall:grid-cols-3 medium:grid-cols-4"
                : "grid-cols-1 xsmall:grid-cols-2 medium:grid-cols-3"

    return (
        <section className="py-12 small:py-16">
            <div className="content-container">
                {(content.label || content.heading || content.description) && (
                    <div className="text-center mb-10">
                        {content.label && (
                            <span className="font-sans text-xs tracking-[0.18em] uppercase text-grey-60 font-normal">
                                {content.label}
                            </span>
                        )}
                        {content.heading && (
                            <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight mt-2">
                                {content.heading}
                            </h2>
                        )}
                        {content.description && (
                            <p className="font-sans text-sm text-grey-50 font-light leading-relaxed text-center max-w-2xl mx-auto mt-5 mb-0">
                                {content.description}
                            </p>
                        )}
                    </div>
                )}

                <div className={`grid ${colClasses} gap-6 small:gap-8`}>
                    {certificates.map((cert) => {
                        const card = (
                            <div className="group flex flex-col items-center text-center">
                                <div className="relative w-full aspect-[4/3] bg-cream-100 border border-grey-20 rounded-sm overflow-hidden">
                                    <Image
                                        src={cert.image_url}
                                        alt={cert.title}
                                        fill
                                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                                        className="object-contain p-2"
                                        loading="lazy"
                                    />
                                </div>
                                <h3 className="font-sans text-sm text-grey-90 font-medium mt-3">
                                    {cert.title}
                                </h3>
                                {cert.description && (
                                    <p className="font-sans text-xs text-grey-50 font-light mt-1 leading-relaxed">
                                        {cert.description}
                                    </p>
                                )}
                            </div>
                        )

                        if (cert.link) {
                            return (
                                <a
                                    key={cert.id}
                                    href={cert.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-40 rounded-sm"
                                >
                                    {card}
                                </a>
                            )
                        }

                        return <div key={cert.id}>{card}</div>
                    })}
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
        case "accordion":
            return (
                <AccordionSection
                    content={section.content as unknown as AccordionContent}
                />
            )
        case "video":
            return (
                <VideoSection
                    content={section.content as unknown as VideoContent}
                />
            )
        case "file_download":
            return (
                <FileDownloadSection
                    content={section.content as unknown as FileDownloadContent}
                />
            )
        case "testimonial":
            return (
                <TestimonialSection
                    content={section.content as unknown as TestimonialContent}
                />
            )
        case "feature_grid":
            return (
                <FeatureGridSection
                    content={section.content as unknown as FeatureGridContent}
                />
            )
        case "divider":
            return (
                <DividerSection
                    content={section.content as unknown as DividerContent}
                />
            )
        case "banner":
            return (
                <BannerSection
                    content={section.content as unknown as BannerContent}
                />
            )
        case "logo_grid":
            return (
                <LogoGridSection
                    content={section.content as unknown as LogoGridContent}
                />
            )
        case "certificates":
            return (
                <CertificatesSection
                    content={section.content as unknown as CertificatesContent}
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
