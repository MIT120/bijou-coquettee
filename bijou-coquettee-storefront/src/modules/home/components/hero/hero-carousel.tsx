"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { t } from "@lib/util/translations"
import { useSyncedLocale } from "@lib/hooks/use-synced-locale"
import type { Locale } from "@/i18n/locale"
import type { CarouselSlide } from "@/types/carousel"

interface HeroCarouselProps {
  locale: Locale
  slides: CarouselSlide[]
}

const CATEGORIES = [
  { label: "Гривни", href: "/categories/bracelets" },
  { label: "Колиета", href: "/categories/necklaces" },
  { label: "Обеци", href: "/categories/earrings" },
  { label: "Комплекти", href: "/categories/sets" },
  { label: "Всички", href: "/store" },
]

/** Duration (ms) each card holds the active spotlight before rotating */
const SPOTLIGHT_INTERVAL = 4500

/** Duration (ms) before auto-advancing to the next page of 3 slides */
const PAGE_INTERVAL = SPOTLIGHT_INTERVAL * 3 + 200

const HeroCarousel = ({ locale: initialLocale, slides }: HeroCarouselProps) => {
  const locale = useSyncedLocale(initialLocale)
  const [activePage, setActivePage] = useState(0)
  const [activeCard, setActiveCard] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [mounted, setMounted] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(id)
  }, [])

  // Group slides into pages of 3
  const pages: CarouselSlide[][] = []
  for (let i = 0; i < slides.length; i += 3) {
    pages.push(slides.slice(i, i + 3))
  }
  const totalPages = pages.length
  const currentPage = pages[activePage] ?? []
  const collectionName = currentPage[0]?.subtitle ?? t("hero.curatedTagline", locale)

  const goToPage = useCallback(
    (index: number) => {
      setActivePage(index)
      setActiveCard(0)
    },
    []
  )

  const goToNext = useCallback(() => {
    if (totalPages === 0) return
    goToPage((activePage + 1) % totalPages)
  }, [activePage, totalPages, goToPage])

  const goToPrev = useCallback(() => {
    goToPage((activePage - 1 + totalPages) % totalPages)
  }, [activePage, totalPages, goToPage])

  // Spotlight rotation — cycles through the 3 cards on the current page
  useEffect(() => {
    if (isPaused || currentPage.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveCard((prev) => {
        const next = (prev + 1) % currentPage.length
        return next
      })
    }, SPOTLIGHT_INTERVAL)
    return () => window.clearInterval(timer)
  }, [isPaused, activePage, currentPage.length])

  // Page rotation — advances to the next group of 3 after all cards are shown
  useEffect(() => {
    if (isPaused || totalPages <= 1) return
    const timer = window.setInterval(goToNext, PAGE_INTERVAL)
    return () => window.clearInterval(timer)
  }, [isPaused, goToNext, totalPages])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX
    touchEndX.current = null
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      touchEndX.current = e.changedTouches[0].clientX
      if (touchStartX.current === null || touchEndX.current === null) return
      const delta = touchStartX.current - touchEndX.current
      if (delta > 50) goToNext()
      else if (delta < -50) goToPrev()
    },
    [goToNext, goToPrev]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev()
      else if (e.key === "ArrowRight") goToNext()
    },
    [goToPrev, goToNext]
  )

  return (
    <section
      className="relative overflow-hidden"
      role="region"
      aria-label="Hero carousel"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── HERO CONTAINER ──────────────────────────────────────────────── */}
      <div className="relative w-full bg-[#120f0c] h-[460px] small:h-[560px] large:h-[660px]">

        {/* ── COLLECTION LABEL ──────────────────────────────────────────── */}
        <div
          className="absolute top-7 small:top-9 left-6 small:left-10 z-20 pointer-events-none"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-6px)",
            transition: "opacity 800ms ease, transform 800ms ease",
          }}
        >
          <span className="inline-flex items-center gap-2.5 font-sans text-[0.58rem] tracking-[0.32em] uppercase text-[#c9a96e]/60 font-normal">
            <span
              className="h-px bg-[#c9a96e]/40"
              style={{
                width: mounted ? "20px" : "0px",
                transition: "width 600ms ease 200ms",
              }}
            />
            {collectionName}
          </span>
        </div>

        {/* ── BROWSE LINK ───────────────────────────────────────────────── */}
        <div className="absolute bottom-6 small:bottom-8 right-6 small:right-10 z-20">
          <LocalizedClientLink
            href="/categories/bracelets"
            className="inline-flex items-center gap-2 font-sans text-[0.6rem] tracking-[0.22em] uppercase text-white/35 hover:text-white/70 transition-colors duration-500 group/link"
          >
            Разгледай гривните
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 -translate-x-1 opacity-0 group-hover/link:translate-x-0 group-hover/link:opacity-100 transition-all duration-400"
            >
              <polyline points="3 8 13 8" />
              <polyline points="9 4 13 8 9 12" />
            </svg>
          </LocalizedClientLink>
        </div>

        {/* ── IMAGE BELT — 3 panels, flat baseline, gap borders ─────────── */}
        {/*
          The belt shows all 3 images simultaneously in a horizontal strip.
          A 2px gap between panels acts as the divider border the client requested.
          The active card expands slightly and brightens; the others recede.
          On mobile the belt is swipeable and shows one card at a time in the
          active-card logic while keeping the strip visible.
        */}
        <div
          className="absolute inset-0 flex items-stretch"
          style={{ gap: "2px" }}
        >
          {currentPage.map((slide, index) => {
            const isActive = index === activeCard
            const productHref = slide.product_handle
              ? `/products/${slide.product_handle}`
              : (slide.cta_link ?? null)

            /*
             * Each card occupies a flex share of the strip.
             * Active card gets a slightly larger flex-grow so it expands into
             * the strip without breaking the 3-panel layout.
             */
            const cardStyle: React.CSSProperties = {
              flexGrow: isActive ? 1.35 : 1,
              flexShrink: 1,
              flexBasis: 0,
              opacity: mounted ? 1 : 0,
              transition: [
                "flex-grow 700ms cubic-bezier(0.4,0,0.2,1)",
                "opacity 700ms ease",
              ].join(", "),
              transitionDelay: mounted ? "0ms" : `${index * 90}ms`,
            }

            const cardClass =
              "relative overflow-hidden cursor-pointer group/card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/60"

            const cardInner = (
              <>
                {/* Product image */}
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  style={{
                    transform: isActive ? "scale(1)" : "scale(1.04)",
                    transition: "transform 1100ms cubic-bezier(0.4,0,0.2,1)",
                  }}
                />

                {/* Gradient overlay — lighter when active */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isActive
                      ? "linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.10) 100%)"
                      : "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.38) 100%)",
                    transition: "background 700ms ease",
                  }}
                />

                {/* Active spotlight ring — thin gold top border */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5 bg-[#c9a96e]"
                  style={{
                    opacity: isActive ? 0.7 : 0,
                    transition: "opacity 500ms ease",
                  }}
                />

                {/* Product label — slides up when active */}
                <div
                  className="absolute bottom-0 inset-x-0 z-10 px-4 small:px-6 py-5 small:py-7"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(8px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                  }}
                >
                  <p className="text-white/90 text-xs small:text-sm font-display font-light leading-snug">
                    {slide.title}
                  </p>
                  {productHref && (
                    <span className="inline-flex items-center gap-1 mt-1.5 font-sans text-[0.58rem] tracking-[0.18em] uppercase text-[#c9a96e]/70">
                      View product
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-2.5 h-2.5"
                      >
                        <polyline points="2 6 10 6" />
                        <polyline points="7 3 10 6 7 9" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Hover label on inactive cards */}
                {!isActive && (
                  <div className="absolute bottom-0 inset-x-0 z-10 px-4 small:px-6 py-5 small:py-7 opacity-0 group-hover/card:opacity-100 transition-opacity duration-400">
                    <p className="text-white/55 text-xs small:text-sm font-display font-light leading-snug">
                      {slide.title}
                    </p>
                  </div>
                )}

                {/* Card index indicator (bottom-left dot) */}
                <div className="absolute bottom-4 left-4 small:bottom-6 small:left-6 z-10 flex items-center gap-1">
                  {currentPage.map((_, dotIndex) => (
                    <div
                      key={dotIndex}
                      style={{
                        width: dotIndex === index ? "16px" : "4px",
                        height: "2px",
                        borderRadius: "999px",
                        background:
                          dotIndex === index
                            ? "rgba(201,169,110,0.80)"
                            : "rgba(255,255,255,0.20)",
                        transition: "width 400ms ease, background 300ms ease",
                      }}
                    />
                  ))}
                </div>
              </>
            )

            return productHref ? (
              <LocalizedClientLink
                key={slide.id}
                href={productHref}
                onClick={() => setActiveCard(index)}
                className={cardClass}
                style={cardStyle}
                aria-label={`View ${slide.title}`}
              >
                {cardInner}
              </LocalizedClientLink>
            ) : (
              <button
                key={slide.id}
                onClick={() => setActiveCard(index)}
                className={cardClass}
                style={cardStyle}
                aria-label={`View ${slide.title}`}
              >
                {cardInner}
              </button>
            )
          })}
        </div>

        {/* ── PAGE DOTS (only if more than one group of 3) ──────────────── */}
        {totalPages > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className="p-1.5 focus-visible:outline-none group/dot"
                aria-label={`Collection ${i + 1}`}
              >
                <div
                  style={{
                    height: "2px",
                    borderRadius: "999px",
                    width: i === activePage ? "28px" : "8px",
                    background:
                      i === activePage
                        ? "rgba(201,169,110,0.75)"
                        : "rgba(255,255,255,0.18)",
                    transition: "width 500ms ease, background 400ms ease",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CATEGORY PILLS ────────────────────────────────────────────── */}
      <div className="bg-cream-200 border-t border-grey-10">
        <div className="content-container py-4 small:py-5">
          <div className="flex items-center justify-center gap-2 small:gap-3 flex-wrap">
            {CATEGORIES.map((cat) => (
              <LocalizedClientLink
                key={cat.href}
                href={cat.href}
                className="px-5 py-2 small:px-6 small:py-2.5 rounded-full border border-grey-20 bg-white text-xs small:text-sm font-sans tracking-[0.06em] text-grey-70 hover:bg-grey-90 hover:text-white hover:border-grey-90 transition-all duration-300 shadow-sm"
              >
                {cat.label}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroCarousel
