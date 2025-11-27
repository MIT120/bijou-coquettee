import Image from "next/image"
import { Heading, Text } from "@medusajs/ui"

import type { Locale } from "@/i18n/locale"
import { t } from "@lib/util/translations"

const editorialShots = [
  {
    id: "atelier-glow",
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
    title: "Atelier Glow",
    descriptor: "Molten satin finish, natural morning light.",
    layout: "tall",
  },
  {
    id: "sculpted-lattice",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    title: "Sculpted Lattice",
    descriptor: "Hand-built lattice cuff awaiting gemstones.",
    layout: "wide",
  },
  {
    id: "portrait-study",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    title: "Portrait Study",
    descriptor: "Earrings styled with sheer silk organza.",
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
    <section className="bg-[#0d0b0a] py-24 text-white">
      <div className="content-container space-y-12">
        <div className="flex flex-col gap-8 large:flex-row large:items-end large:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="text-[0.6rem] uppercase tracking-[0.4em] text-white/60">
              {t("editorial.subtitle", locale)}
            </span>
            <Heading
              level="h2"
              className="text-3xl small:text-4xl large:text-5xl font-light text-white"
            >
              {t("editorial.title", locale)}
            </Heading>
            <Text className="text-base text-white/70">
              {t("editorial.description", locale)}
            </Text>
          </div>
          <div className="grid grid-cols-3 gap-6 text-right">
            {highlights.map((highlight) => (
              <div key={highlight.label}>
                <p className="text-3xl font-light">{highlight.value}</p>
                <p className="text-[0.6rem] uppercase tracking-[0.35em] text-white/50">
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
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/60">
                    {shot.descriptor}
                  </p>
                  <p className="text-2xl font-light">{shot.title}</p>
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



