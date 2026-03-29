import { notFound } from "next/navigation"
import { Suspense } from "react"

import { listProductsWithSort } from "@lib/data/products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import HorizontalRefinementBar from "@modules/store/components/horizontal-refinement-bar"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts, {
  extractAvailableColors,
} from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  colorFilter,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  /** Comma-separated color names from the URL ?color= param. */
  colorFilter?: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  // Parse color filter
  const selectedColors = (colorFilter ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }

  getParents(category)

  // True when this is a top-level category (no parent) — we show a hero banner.
  const isTopLevel = parents.length === 0

  // Fetch all products in this category to build the color filter swatch list.
  // Wrapped in try-catch so a backend failure does not crash the entire page.
  let availableColors: string[] = []
  try {
    const { response: { products: allProducts } } = await listProductsWithSort({
      page: 1,
      queryParams: {
        limit: 100,
        category_id: [category.id],
      },
      sortBy: sort,
      countryCode,
    })
    availableColors = extractAvailableColors(allProducts)
  } catch {
    // If the color-swatch fetch fails, render without color filters rather
    // than crashing the whole template.
  }

  return (
    /*
     * Outermost wrapper: full-width with no horizontal padding at this level.
     * content-container is applied per-section so the sticky filter bar can
     * stretch edge-to-edge while header/grid stay constrained to max-w-8xl.
     */
    <div data-testid="category-container">

      {/*
       * ── Category hero (top-level categories only) ───────────────────
       *
       * Design rationale: Top-level category pages (Rings, Necklaces, etc.)
       * benefit from a branded hero banner — it sets the editorial mood and
       * communicates breadth before the user scans product cards.
       *
       * Sub-category pages (e.g. /categories/rings/engagement) already have
       * narrow context, so a banner would feel redundant and waste vertical
       * space.  We skip the banner for those and go straight to the header.
       */}
      {isTopLevel && (
        <div
          className="relative w-full bg-cream-200 overflow-hidden"
          aria-hidden="false"
        >
          {/* Subtle warm gradient — no image dependency, so it works even
              before the CMS plugs in a real hero photo */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-cream-100 via-cream-200 to-cream-300"
            aria-hidden="true"
          />

          {/* Decorative ring silhouette — pure CSS, zero network requests */}
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 w-40 h-40 small:w-64 small:h-64 rounded-full border border-soft-gold/30"
            aria-hidden="true"
          />
          <div
            className="absolute right-16 top-1/2 -translate-y-1/2 w-24 h-24 small:w-44 small:h-44 rounded-full border border-soft-gold/20"
            aria-hidden="true"
          />

          {/* Hero text */}
          <div className="content-container relative py-12 small:py-16">
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-grey-40 font-sans mb-3">
              Bijou Coquettee
            </p>
            <h1
              className="font-display text-4xl small:text-5xl text-grey-90 tracking-wide leading-tight max-w-xs small:max-w-sm"
              data-testid="category-page-title"
            >
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-3 text-sm text-grey-50 font-sans max-w-sm leading-relaxed">
                {category.description}
              </p>
            )}
            <div className="mt-5 w-10 h-px bg-soft-gold" aria-hidden="true" />
          </div>
        </div>
      )}

      {/*
       * ── Compact header for sub-category pages ───────────────────────
       *
       * Breadcrumb trail + category name in the standard editorial style.
       * No hero banner — the nav breadcrumb is orientation enough.
       */}
      {!isTopLevel && (
        <div className="content-container pt-10 pb-6">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-x-2 text-[0.7rem] font-sans text-grey-40 mb-3 flex-wrap"
          >
            {parents
              .slice()
              .reverse()
              .map((parent, idx) => (
                <span key={parent.id} className="flex items-center gap-x-2">
                  {idx > 0 && (
                    <span aria-hidden="true" className="text-grey-20">
                      /
                    </span>
                  )}
                  <LocalizedClientLink
                    href={`/categories/${parent.handle}`}
                    className="hover:text-grey-90 transition-colors"
                    data-testid="sort-by-link"
                  >
                    {parent.name}
                  </LocalizedClientLink>
                </span>
              ))}
            <span aria-hidden="true" className="text-grey-20">
              /
            </span>
            <span className="text-grey-90">{category.name}</span>
          </nav>

          <h1
            className="font-display text-3xl small:text-4xl text-grey-90 tracking-wide leading-tight"
            data-testid="category-page-title"
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 text-sm text-grey-50 font-sans max-w-sm leading-relaxed">
              {category.description}
            </p>
          )}
          <div className="mt-4 w-12 h-px bg-soft-gold" aria-hidden="true" />
        </div>
      )}

      {/* Sub-category links (chips) — shown when child categories exist */}
      {category.category_children && category.category_children.length > 0 && (
        <div className="content-container pb-4">
          <ul className="flex flex-wrap gap-2">
            {category.category_children.map((c) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/categories/${c.handle}`}
                  className="inline-flex items-center h-8 px-4 rounded-full border border-grey-20 text-xs font-sans text-grey-60 hover:border-grey-40 hover:text-grey-90 transition-all duration-150"
                >
                  {c.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Sticky horizontal filter / sort bar ─────────────────────── */}
      <HorizontalRefinementBar
        sortBy={sort}
        availableColors={availableColors}
      />

      {/* ── Product grid ─────────────────────────────────────────────── */}
      <div className="content-container pt-8 pb-16">
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
            colorFilter={selectedColors}
          />
        </Suspense>
      </div>

    </div>
  )
}
