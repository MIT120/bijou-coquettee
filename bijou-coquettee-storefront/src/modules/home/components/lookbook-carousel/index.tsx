"use client"

import { useRef } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button, Heading, Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useSyncedLocale } from "@lib/hooks/use-synced-locale"
import { t } from "@lib/util/translations"
import type { Locale } from "@/i18n/locale"

const lookbookSlides = [
  {
    id: "crystal-bracelet",
    chapter: "Swarovski Collection",
    title: "Crystal Cord Bracelet",
    detail: "Sterling silver 925 with Swarovski crystals on jewellery cord.",
    palette: "Crystal · Silver",
    badge: "Bestseller",
    image: "/bracelet-swarovski-crystal.png",
  },
  {
    id: "red-crystal-bracelet",
    chapter: "Colour Collection",
    title: "Red Crystal Bracelet",
    detail: "Vibrant red Swarovski crystals on delicate cord.",
    palette: "Red · Silver",
    badge: "New arrival",
    image: "/bracelet-swarovski-red.png",
  },
  {
    id: "teal-crystal-bracelet",
    chapter: "Colour Collection",
    title: "Teal Crystal Bracelet",
    detail: "Stunning teal Swarovski crystals for a refined look.",
    palette: "Teal · Silver",
    badge: "Popular",
    image: "/bracelet-swarovski-teal-alt.png",
  },
  {
    id: "rose-gold-crystal-bracelet",
    chapter: "Gift Collection",
    title: "Rose Gold Crystal Bracelet",
    detail: "Warm rose gold Swarovski crystals, the perfect gift.",
    palette: "Rose Gold · Silver",
    badge: "Gift ready",
    image: "/bracelet-swarovski-rose-gold.png",
  },
]

const capsuleNotes = [
  { label: "Materials", value: "Swarovski crystals · Sterling silver 925 · Jewellery cord" },
  { label: "Styles", value: "Crystal cord bracelet · Pearl bracelet · Colour collection" },
  { label: "Palette", value: "Crystal · Red · Teal · Blue · Emerald · Rose Gold" },
]

const LookbookCarousel = ({ locale: initialLocale }: { locale: Locale }) => {
  const locale = useSyncedLocale(initialLocale)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: "prev" | "next") => {
    if (!sliderRef.current) return
    const scrollAmount = sliderRef.current.clientWidth * 0.85
    sliderRef.current.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <section id="lookbook" className="bg-cream-100 py-12 small:py-28">
      <div className="content-container space-y-10">
        <div className="flex flex-col gap-6 large:flex-row large:items-end large:justify-between">
          <div className="space-y-4 max-w-2xl">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.22em] text-soft-gold font-normal">
              {t("lookbook.subtitle", locale)}
            </span>
            <Heading
              level="h2"
              className="font-display text-3xl small:text-4xl large:text-5xl text-grey-90 font-light leading-tight"
            >
              {t("lookbook.title", locale)}
            </Heading>
            <Text className="text-base text-grey-60">
              {t("lookbook.body", locale)}
            </Text>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleScroll("prev")}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-grey-30 text-grey-60 transition-colors hover:border-grey-80 hover:text-grey-90"
              aria-label="Previous lookbook slide"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("next")}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-grey-30 text-grey-60 transition-colors hover:border-grey-80 hover:text-grey-90"
              aria-label="Next lookbook slide"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="no-scrollbar flex gap-4 small:gap-8 overflow-x-auto pb-4"
        >
          {lookbookSlides.map((slide) => (
            <div
              key={slide.id}
              className="relative w-[260px] shrink-0 snap-start small:w-[320px] large:w-[360px]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] border border-white/40 bg-white shadow-warm-lg">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 30vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent" />
                <span className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-1 font-sans text-xs uppercase tracking-[0.18em] text-grey-80 font-normal">
                  {slide.badge}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="font-sans text-[0.6rem] uppercase tracking-[0.22em] text-white/70 font-normal">
                    {slide.chapter}
                  </p>
                  <p className="font-display text-2xl font-light">{slide.title}</p>
                  <p className="text-sm text-white/80">{slide.detail}</p>
                  <p className="mt-3 font-sans text-[0.65rem] uppercase tracking-[0.18em] text-white/60 font-normal">
                    {slide.palette}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8 small:flex-row small:items-center small:justify-between">
          <LocalizedClientLink href="/store">
            <Button
              size="large"
              className="rounded-full border border-grey-90 bg-grey-90 px-10 py-4 text-xs font-sans font-medium uppercase tracking-[0.12em] text-white hover:bg-grey-80"
            >
              {t("lookbook.cta", locale)}
            </Button>
          </LocalizedClientLink>
          <div className="grid grid-cols-1 gap-4 small:grid-cols-3 small:gap-8">
            {capsuleNotes.map((note) => (
              <div key={note.label}>
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.18em] text-grey-40 font-normal">
                  {note.label}
                </p>
                <p className="text-sm text-grey-80">{note.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LookbookCarousel



