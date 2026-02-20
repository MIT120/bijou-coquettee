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
    id: "halo-cascade",
    chapter: "Celestial Sculpt",
    title: "Halo Cascade Set",
    detail: "Pavé diamond collar paired with luminous drop earrings.",
    palette: "Champagne · Ice",
    badge: "Limited 12",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "atelier-veil",
    chapter: "Atelier Veil",
    title: "Mirage Sautoir",
    detail: "Hand-knotted pearls, mirrored links, midnight silk tassel.",
    palette: "Opal · Noir",
    badge: "Runway edit",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "nocturne",
    chapter: "Nocturne Metals",
    title: "Lunar Serpentine",
    detail: "Fluid platinum cuff orbiting a smoky quartz cabochon.",
    palette: "Platinum · Smoke",
    badge: "Made-to-order",
    image:
      "https://images.unsplash.com/photo-1518544889280-37f4ca38e4b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "solstice",
    chapter: "Solstice Bloom",
    title: "Aurora Petal Studs",
    detail: "Iridescent mother-of-pearl petals hugging diamond cores.",
    palette: "Rose · Opaline",
    badge: "New arrival",
    image:
      "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "atelier-lustre",
    chapter: "Lustre Atelier",
    title: "Gilded Column Choker",
    detail: "Architectural silhouette with brushed satin panels.",
    palette: "Gilt · Porcelain",
    badge: "Bespoke",
    image:
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=900&q=80",
  },
]

const capsuleNotes = [
  { label: "Textures", value: "Hammered satin · Mirror link · Silk cord" },
  { label: "Settings", value: "Invisible micro pavé · Floating claw" },
  { label: "Palette", value: "Champagne · Noir · Opaline" },
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
    <section id="lookbook" className="bg-[#fefcf8] py-12 small:py-28">
      <div className="content-container space-y-10">
        <div className="flex flex-col gap-6 large:flex-row large:items-end large:justify-between">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[0.65rem] uppercase tracking-[0.4em] text-amber-500">
              {t("lookbook.subtitle", locale)}
            </span>
            <Heading
              level="h2"
              className="text-3xl small:text-4xl large:text-5xl text-grey-90 font-light leading-tight"
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
              <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] border border-white/40 bg-white shadow-[0_20px_60px_rgba(27,23,20,.15)]">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 30vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent" />
                <span className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-1 text-xs uppercase tracking-[0.3em] text-grey-80">
                  {slide.badge}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/70">
                    {slide.chapter}
                  </p>
                  <p className="text-2xl font-light">{slide.title}</p>
                  <p className="text-sm text-white/80">{slide.detail}</p>
                  <p className="mt-3 text-[0.65rem] uppercase tracking-[0.35em] text-white/60">
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
              className="rounded-full border border-grey-90 bg-grey-90 px-10 py-4 text-xs font-light uppercase tracking-[0.4em] text-white hover:bg-black"
            >
              {t("lookbook.cta", locale)}
            </Button>
          </LocalizedClientLink>
          <div className="grid grid-cols-1 gap-4 small:grid-cols-3 small:gap-8">
            {capsuleNotes.map((note) => (
              <div key={note.label}>
                <p className="text-[0.6rem] uppercase tracking-[0.35em] text-grey-40">
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



