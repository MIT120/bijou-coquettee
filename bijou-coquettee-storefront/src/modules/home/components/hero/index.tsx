"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button, Heading, Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { t } from "@lib/util/translations"
import { useSyncedLocale } from "@lib/hooks/use-synced-locale"
import type { Locale } from "@/i18n/locale"

const heroSlides = [
  {
    id: "crystal-necklace",
    image: "/591584938_1156724146529006_9094936061071654546_n.jpg",
    label: "Swarovski Collection",
    title: "Invisible Thread Necklace",
    caption: "Delicate Swarovski crystal floating on invisible thread.",
  },
  {
    id: "tennis-bracelet",
    image: "/589758115_1839941379994791_4987365088989408098_n.jpg",
    label: "Statement Pieces",
    title: "Crystal Tennis Bracelet",
    caption: "Silver bezel-set Swarovski crystals in timeless design.",
  },
  {
    id: "gift-collection",
    image: "/590257172_1575048736863680_2302007701388531458_n.jpg",
    label: "Gift Ready",
    title: "Crystal Bracelet Gift Set",
    caption: "Beautifully packaged Swarovski crystal bracelet.",
  },
]

const accentImages = [
  {
    id: "gold-bracelet",
    image: "/476497969_1392647638852240_3397655176834990255_n.jpg",
    alt: "Gold Swarovski crystal bracelet",
    position: "top-6 -left-4",
  },
  {
    id: "necklace-detail",
    image: "/591584938_1156724146529006_9094936061071654546_n.jpg",
    alt: "Crystal necklace on model",
    position: "-bottom-8 -right-6",
  },
]

const Hero = ({ locale: initialLocale }: { locale: Locale }) => {
  const locale = useSyncedLocale(initialLocale)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6500)

    return () => window.clearInterval(timer)
  }, [])

  const stats = [
    { value: "03", label: t("hero.stats.ateliers", locale) },
    { value: "148", label: t("hero.stats.heirlooms", locale) },
    { value: "48h", label: t("hero.stats.delivery", locale) },
  ]

  return (
    <section className="relative overflow-hidden bg-cream-200">
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
                <p className="font-display text-3xl small:text-4xl font-light text-grey-90">{stat.value}</p>
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
              {heroSlides.map((slide, index) => (
                <div key={slide.id} className="relative h-full w-full shrink-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4 small:bottom-6 small:left-6 small:right-6 flex items-center justify-between rounded-full bg-white/90 px-4 py-3 small:px-5 small:py-4 shadow-warm-lg backdrop-blur">
              <div className="min-w-0 flex-1 mr-3">
                <p className="hidden small:block font-sans text-[0.6rem] uppercase tracking-[0.22em] text-grey-50 font-normal">
                  {heroSlides[activeSlide].label}
                </p>
                <p className="text-sm small:text-lg text-grey-90 truncate">{heroSlides[activeSlide].title}</p>
                <p className="hidden small:block text-sm text-grey-60">
                  {heroSlides[activeSlide].caption}
                </p>
              </div>
              <div className="flex gap-2 small:gap-3 shrink-0">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 w-5 small:w-8 rounded-full transition-all ${index === activeSlide ? "bg-grey-90" : "bg-grey-30"
                      }`}
                    aria-label={`Show ${slide.title}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {accentImages.map((accent) => (
            <div
              key={accent.id}
              className={`absolute hidden w-36 overflow-hidden rounded-3xl border border-white/40 shadow-warm-xl small:block ${accent.position}`}
            >
              <Image
                src={accent.image}
                alt={accent.alt}
                width={256}
                height={320}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero

