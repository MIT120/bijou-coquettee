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
    id: "aurora-column",
    image:
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
    label: "Maison Capsule 01",
    title: "Aurora Column Ring",
    caption: "Sculpted in recycled 18k gold with hand-set diamonds.",
  },
  {
    id: "noir-riviere",
    image:
      "https://images.unsplash.com/photo-1518544801958-efcbf8a7ec10?auto=format&fit=crop&w=1200&q=80",
    label: "Midnight Reverie",
    title: "Noir Rivière Necklace",
    caption: "Suspended black opals that glow under evening light.",
  },
  {
    id: "atelier-robe",
    image:
      "https://images.unsplash.com/photo-1518544889280-37f4ca38e4b4?auto=format&fit=crop&w=1200&q=80",
    label: "Atelier Atelier",
    title: "Lumière Draped Cuff",
    caption: "Liquid metal silhouette with couture tailoring.",
  },
]

const accentImages = [
  {
    id: "atelier-detail",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80",
    alt: "Artisan shaping gold cuff",
    position: "top-6 -left-4",
  },
  {
    id: "model-portrait",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80",
    alt: "Model wearing statement earrings",
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
    <section className="relative overflow-hidden bg-[#f7f3ed]">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/70 to-transparent pointer-events-none" />
      <div className="content-container relative z-10 flex flex-col gap-16 py-16 small:py-24 large:flex-row large:items-center">
        <div className="w-full space-y-8 large:w-5/12">
          <div className="space-y-4">
            <span className="inline-flex items-center text-[0.65rem] tracking-[0.45em] uppercase text-amber-500">
              {t("hero.curatedTagline", locale)}
            </span>
            <Heading
              level="h1"
              className="text-4xl small:text-5xl large:text-6xl text-grey-90 font-light leading-tight"
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

          <div className="flex flex-col gap-4 small:flex-row">
            <LocalizedClientLink href="/store">
              <Button
                size="large"
                className="w-full rounded-full border border-grey-90 bg-grey-90 px-8 py-4 text-sm font-light uppercase tracking-[0.35em] text-white transition-colors duration-300 hover:bg-black small:w-auto"
              >
                {t("hero.shopCollection", locale)}
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="#lookbook">
              <Button
                variant="secondary"
                size="large"
                className="w-full rounded-full border border-grey-40 bg-transparent px-8 py-4 text-sm font-light uppercase tracking-[0.35em] text-grey-80 transition-all duration-300 hover:border-grey-80 small:w-auto"
              >
                {t("hero.lookbookCta", locale)}
              </Button>
            </LocalizedClientLink>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-grey-20 pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl font-light text-grey-90">{stat.value}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-grey-50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs uppercase tracking-[0.35em] text-grey-50">
            {t("hero.premiumGuarantee", locale)}
          </p>
        </div>

        <div className="relative w-full large:w-7/12">
          <div className="relative h-[520px] overflow-hidden rounded-[36px] border border-white/50 bg-white/40 shadow-[0_25px_80px_rgba(27,23,20,0.25)] backdrop-blur">
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
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-full bg-white/90 px-5 py-4 shadow-lg backdrop-blur">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-grey-50">
                  {heroSlides[activeSlide].label}
                </p>
                <p className="text-lg text-grey-90">{heroSlides[activeSlide].title}</p>
                <p className="text-sm text-grey-60">
                  {heroSlides[activeSlide].caption}
                </p>
              </div>
              <div className="flex gap-3">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 w-8 rounded-full transition-all ${index === activeSlide ? "bg-grey-90" : "bg-grey-30"
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
              className={`absolute hidden w-36 overflow-hidden rounded-3xl border border-white/40 shadow-xl small:block ${accent.position}`}
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

