import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Collections | Bijou Coquettee",
  description: "Explore our curated jewelry collections.",
}

export default async function CollectionsPage() {
  const { collections } = await listCollections({ fields: "id,title,handle" })

  return (
    <div data-testid="collections-container">
      {/* ── Page hero ──────────────────────────────────────────────────── */}
      <div className="relative w-full bg-cream-200 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-cream-100 via-cream-200 to-cream-300"
          aria-hidden="true"
        />

        {/* Decorative ring silhouettes */}
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 w-40 h-40 small:w-64 small:h-64 rounded-full border border-soft-gold/30"
          aria-hidden="true"
        />
        <div
          className="absolute right-16 top-1/2 -translate-y-1/2 w-24 h-24 small:w-44 small:h-44 rounded-full border border-soft-gold/20"
          aria-hidden="true"
        />

        <div className="content-container relative py-12 small:py-16">
          <p className="text-[0.6rem] uppercase tracking-[0.25em] text-grey-40 font-sans mb-3">
            Bijou Coquettee
          </p>
          <h1 className="font-display text-4xl small:text-5xl text-grey-90 tracking-wide leading-tight max-w-xs small:max-w-sm">
            Колекции
          </h1>
          <p className="mt-3 text-sm text-grey-50 font-sans max-w-sm leading-relaxed">
            Разгледайте нашите внимателно подбрани колекции от изящни бижута.
          </p>
          <div className="mt-5 w-10 h-px bg-soft-gold" aria-hidden="true" />
        </div>
      </div>

      {/* ── Collections grid ───────────────────────────────────────────── */}
      <div className="content-container py-12">
        {!collections || collections.length === 0 ? (
          <p className="text-sm text-grey-50 font-sans text-center py-16">
            Няма налични колекции в момента.
          </p>
        ) : (
          <ul className="grid grid-cols-1 small:grid-cols-2 large:grid-cols-3 gap-6">
            {collections.map((collection: HttpTypes.StoreCollection) => (
              <li key={collection.id}>
                <LocalizedClientLink
                  href={`/collections/${collection.handle}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-ui-border-base bg-cream hover:border-soft-gold/50 hover:shadow-warm-md transition-all duration-200 p-6 h-full"
                  data-testid={`collection-${collection.handle}-link`}
                >
                  {/* Decorative accent */}
                  <div className="w-8 h-px bg-soft-gold mb-1" aria-hidden="true" />

                  <h2 className="font-display text-2xl text-grey-90 tracking-wide leading-tight group-hover:text-soft-gold transition-colors duration-200">
                    {collection.title}
                  </h2>

                  <span className="mt-auto inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.12em] text-grey-50 group-hover:text-grey-90 transition-colors duration-200">
                    Разгледай
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <line x1="0" y1="7" x2="12" y2="7" />
                      <polyline points="7,2 12,7 7,12" />
                    </svg>
                  </span>
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
