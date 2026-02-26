"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { Button, Heading, Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { t } from "@lib/util/translations"
import { useSyncedLocale } from "@lib/hooks/use-synced-locale"
import type { Locale } from "@/i18n/locale"
import type { CarouselSlide } from "@/types/carousel"

interface HeroCarouselProps {
  locale: Locale
  slides: CarouselSlide[]
}

const HeroCarousel = ({ locale: initialLocale, slides }: HeroCarouselProps) => {
  const locale = useSyncedLocale(initialLocale)
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToNext = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (isPaused || slides.length <= 1) return

    const timer = window.setInterval(goToNext, 6500)
    return () => window.clearInterval(timer)
  }, [isPaused, goToNext, slides.length])

  const stats = [
    { value: "03", label: t("hero.stats.ateliers", locale) },
    { value: "148", label: t("hero.stats.heirlooms", locale) },
    { value: "48h", label: t("hero.stats.delivery", locale) },
  ]

  const currentSlide = slides[activeSlide]

  return (
    <section
      className="relative overflow-hidden bg-cream-200"
      role="region"
      aria-label="Hero carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/70 to-transparent pointer-events-none" />
      <div className="content-container relative z-10 flex flex-col gap-8 small:gap-16 py-10 small:py-24 large:flex-row large:items-center">
        <div className="w-full space-y-6 small:space-y-8 large:w-5/12">
          <div className="space-y-3 small:space-y-4">
            <span className="inline-flex items-center font-sans text-[0.65rem] tracking-[0.22em] uppercase text-soft-gold font-normal">
              {t("hero.curatedTagline", locale)}
            </span>
            <Heading
              level="h1"
              className="font-display text-3xl small:text-5xl large:text-6xl text-grey-90 font-light leading-tight"
            >
              {t("hero.title", locale)}
            </Heading>
            <Text className="text-base small:text-lg text-grey-60 leading-relaxed">
              {t("hero.description", locale)}
            </Text>
            <Text className="text-base text-grey-50">
              {t("hero.discoverStatement", locale)}
            </Text>
          </div>

          <div className="flex flex-col gap-3 small:gap-4 small:flex-row">
            <LocalizedClientLink href="/store">
              <Button
                size="large"
                className="w-full rounded-full border border-grey-90 bg-grey-90 px-6 py-3 small:px-8 small:py-4 text-xs small:text-sm font-sans font-medium uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-grey-80 small:w-auto"
              >
                {t("hero.shopCollection", locale)}
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="#lookbook">
              <Button
                variant="secondary"
                size="large"
                className="w-full rounded-full border border-grey-30 bg-transparent px-6 py-3 small:px-8 small:py-4 text-xs small:text-sm font-sans font-medium uppercase tracking-[0.12em] text-grey-80 transition-all duration-300 hover:border-grey-70 small:w-auto"
              >
                {t("hero.lookbookCta", locale)}
              </Button>
            </LocalizedClientLink>
          </div>

          <div className="grid grid-cols-3 gap-3 small:gap-6 border-t border-grey-20 pt-6 small:pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1 min-w-0">
                <p className="font-display text-3xl small:text-4xl font-light text-grey-90">
                  {stat.value}
                </p>
                <p className="font-sans text-[0.6rem] small:text-xs uppercase tracking-[0.18em] text-grey-50 leading-tight font-normal">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className="font-sans text-[0.6rem] small:text-xs uppercase tracking-[0.18em] text-grey-50 font-normal">
            {t("hero.premiumGuarantee", locale)}
          </p>
        </div>

        <div className="relative w-full large:w-7/12">
          <div className="relative h-[380px] small:h-[520px] overflow-hidden rounded-[24px] small:rounded-[36px] border border-white/50 bg-white/40 shadow-warm-xl backdrop-blur">
            <div
              className="flex h-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {slides.map((slide, index) => {
                const overlayStyle = slide.overlay_color
                  ? { backgroundColor: slide.overlay_color }
                  : undefined
                const overlayOpacity =
                  slide.overlay_opacity != null
                    ? slide.overlay_opacity / 100
                    : 0.4

                return (
                  <div key={slide.id} className="relative h-full w-full shrink-0">
                    <Image
                      src={slide.image_url}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 55vw"
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={
                        overlayStyle
                          ? { ...overlayStyle, opacity: overlayOpacity }
                          : undefined
                      }
                    >
                      {!overlayStyle && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div
              className="absolute bottom-4 left-4 right-4 small:bottom-6 small:left-6 small:right-6 flex items-center justify-between rounded-full bg-white/90 px-4 py-3 small:px-5 small:py-4 shadow-warm-lg backdrop-blur"
              aria-live="polite"
            >
              <div className="min-w-0 flex-1 mr-3">
                {currentSlide.subtitle && (
                  <p className="hidden small:block font-sans text-[0.6rem] uppercase tracking-[0.22em] text-grey-50 font-normal">
                    {currentSlide.subtitle}
                  </p>
                )}
                <p className="text-sm small:text-lg text-grey-90 truncate">
                  {currentSlide.title}
                </p>
                {currentSlide.description && (
                  <p className="hidden small:block text-sm text-grey-60">
                    {currentSlide.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 small:gap-3 shrink-0">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 w-5 small:w-8 rounded-full transition-all ${
                      index === activeSlide ? "bg-grey-90" : "bg-grey-30"
                    }`}
                    aria-label={`Show slide ${index + 1}: ${slide.title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroCarousel
