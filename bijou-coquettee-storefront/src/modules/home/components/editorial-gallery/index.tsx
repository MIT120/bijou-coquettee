import Image from "next/image"
import { Heading, Text } from "@medusajs/ui"

import type { Locale } from "@/i18n/locale"
import { t } from "@lib/util/translations"

const editorialShots = [
  {
    id: "crystal-necklace",
    image: "/591584938_1156724146529006_9094936061071654546_n.jpg",
    title: "Crystal Elegance",
    descriptor: "Invisible thread necklace, natural light.",
    layout: "tall",
  },
  {
    id: "tennis-bracelet",
    image: "/589758115_1839941379994791_4987365088989408098_n.jpg",
    title: "Silver Brilliance",
    descriptor: "Bezel-set Swarovski crystal tennis bracelet.",
    layout: "wide",
  },
  {
    id: "gold-bracelet",
    image: "/476497969_1392647638852240_3397655176834990255_n.jpg",
    title: "Golden Glow",
    descriptor: "Champagne crystals on invisible thread.",
    layout: "standard",
  },
]

const EditorialGallery = ({ locale }: { locale: Locale }) => {
  const highlights = [
    { value: "12", label: t("editorial.highlights.silhouettes", locale) },
    { value: "480", label: t("editorial.highlights.gems", locale) },
    { value: "28", label: t("editorial.highlights.appointments", locale) },
  ]

  return (
    <section className="bg-grey-90 py-14 small:py-24 text-white">
      <div className="content-container space-y-8 small:space-y-12">
        <div className="flex flex-col gap-6 small:gap-8 large:flex-row large:items-end large:justify-between">
          <div className="max-w-2xl space-y-3 small:space-y-4">
            <span className="font-sans text-[0.6rem] uppercase tracking-[0.22em] text-white/60 font-normal">
              {t("editorial.subtitle", locale)}
            </span>
            <Heading
              level="h2"
              className="font-display text-2xl small:text-4xl large:text-5xl font-light text-white"
            >
              {t("editorial.title", locale)}
            </Heading>
            <Text className="text-sm small:text-base text-white/70">
              {t("editorial.description", locale)}
            </Text>
          </div>
          <div className="grid grid-cols-3 gap-4 small:gap-6 text-right">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="min-w-0">
                <p className="font-display text-2xl small:text-3xl font-light">{highlight.value}</p>
                <p className="font-sans text-[0.5rem] small:text-[0.6rem] uppercase tracking-[0.18em] text-white/50 leading-tight font-normal">
                  {highlight.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 small:grid-cols-2 large:grid-cols-3">
          {editorialShots.map((shot) => {
            const layoutClass =
              shot.layout === "tall"
                ? "small:row-span-2"
                : shot.layout === "wide"
                  ? "small:col-span-2 large:col-span-2"
                  : ""

            return (
              <div
                key={shot.id}
                className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 ${layoutClass}`}
              >
                <div className="relative h-[320px] small:h-full">
                  <Image
                    src={shot.image}
                    alt={shot.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-white/60 font-normal">
                    {shot.descriptor}
                  </p>
                  <p className="font-display text-2xl font-light">{shot.title}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default EditorialGallery



