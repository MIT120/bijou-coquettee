import type { Locale } from "@/i18n/locale"
import type { CarouselSlide } from "@/types/carousel"
import { getCarouselSlides } from "@lib/data/carousel"
import HeroCarousel from "./hero-carousel"

const fallbackSlides: CarouselSlide[] = [
  {
    id: "pearl-bracelet",
    title: "Pearl & Crystal Bracelet",
    subtitle: "Swarovski Collection",
    description: "Delicate pearl bracelet with Swarovski crystal accent.",
    image_url: "/bracelet-pearl-swarovski.png",
    cta_text: null,
    cta_link: null,
    overlay_color: null,
    overlay_opacity: null,
    sort_order: 0,
    is_active: true,
  },
  {
    id: "crystal-hand",
    title: "Crystal Cord Bracelet",
    subtitle: "Everyday Elegance",
    description:
      "Sterling silver 925 with Swarovski crystals on jewellery cord.",
    image_url: "/bracelet-swarovski-crystal-hand.png",
    cta_text: null,
    cta_link: null,
    overlay_color: null,
    overlay_opacity: null,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "emerald-bracelet",
    title: "Emerald Crystal Bracelet",
    subtitle: "Colour Collection",
    description: "Rich emerald Swarovski crystals for a striking look.",
    image_url: "/bracelet-swarovski-emerald.png",
    cta_text: null,
    cta_link: null,
    overlay_color: null,
    overlay_opacity: null,
    sort_order: 2,
    is_active: true,
  },
]

const Hero = async ({
  locale,
  slides,
}: {
  locale: Locale
  slides?: CarouselSlide[]
}) => {
  const fetchedSlides = slides ?? (await getCarouselSlides())
  const activeSlides = fetchedSlides.length > 0 ? fetchedSlides : fallbackSlides

  return <HeroCarousel locale={locale} slides={activeSlides} />
}

export default Hero
