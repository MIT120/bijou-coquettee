import { Suspense } from "react"

import { listProductsWithSort } from "@lib/data/products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import HorizontalRefinementBar from "@modules/store/components/horizontal-refinement-bar"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { t } from "@lib/util/translations-server"

import PaginatedProducts, {
  extractAvailableColors,
  PaginatedProductsCount,
} from "./paginated-products"
import InfiniteProductGridShell from "./infinite-product-grid-shell"

const PRODUCT_LIMIT = 12

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  colorFilter,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  /** Comma-separated color names from the URL ?color= param. */
  colorFilter?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Parse color filter
  const selectedColors = (colorFilter ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)

  // Fetch the full product list (unfiltered) to populate color swatches
  // AND capture the raw total count for the infinite-scroll progress indicator.
  // Wrapped in try-catch so a backend failure does not crash the entire page.
  let availableColors: string[] = []
  let totalCount = 0
  try {
    const {
      response: { products: allProducts, count: rawCount },
    } = await listProductsWithSort({
      page: 1,
      queryParams: { limit: 100 },
      sortBy: sort,
      countryCode,
    })

    availableColors = extractAvailableColors(allProducts)

    // If a color filter is active, re-compute the filtered count so the
    // progress indicator shows "X / Y (filtered)" rather than the full catalog.
    if (selectedColors.length > 0) {
      totalCount = await PaginatedProductsCount({
        sortBy: sort,
        countryCode,
        colorFilter: selectedColors,
      })
    } else {
      totalCount = rawCount
    }
  } catch {
    // If the fetch fails we render without color filters and infinite scroll
    // falls back to showing the "Load more" button with no count indicator.
  }

  const pageTitle = await t("store.allProducts", countryCode)

  return (
    /*
     * Outermost wrapper: full-width, no horizontal padding at this level.
     * content-container is applied per-section so the sticky filter bar can
     * span the full viewport width with its own background while the page
     * header and product grid stay constrained to max-w-8xl.
     */
    <div data-testid="category-container">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="content-container pt-10 pb-6">
        {/*
          Eyebrow — fine uppercase tracking above the main title gives
          the header a premium editorial feel without visual weight.
        */}
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-grey-40 font-sans mb-2">
          Bijou Coquettee
        </p>

        {/*
          Title — large display serif for authority and elegance.
          font-display maps to Cormorant Garamond (tailwind.config.js).
        */}
        <h1
          className="font-display text-3xl small:text-4xl text-grey-90 tracking-wide leading-tight"
          data-testid="store-page-title"
        >
          {pageTitle}
        </h1>

        {/* Thin gold rule — a jewellery-house signature detail */}
        <div className="mt-4 w-12 h-px bg-soft-gold" aria-hidden="true" />
      </div>

      {/* ── Sticky horizontal filter / sort bar ─────────────────────── */}
      <HorizontalRefinementBar
        sortBy={sort}
        availableColors={availableColors}
      />

      {/* ── Infinite-scroll product grid ─────────────────────────────── */}
      <div className="content-container pt-8 pb-16">
        <Suspense fallback={<SkeletonProductGrid numberOfProducts={PRODUCT_LIMIT} />}>
          {/*
            InfiniteProductGridShell is a server component that pre-builds
            all RSC page nodes and passes them to the client InfiniteProductGrid
            shell. The shell then mounts them one-by-one behind Suspense boundaries
            as the user scrolls. See:
              - infinite-product-grid-shell.tsx  (server bridge)
              - infinite-product-grid/index.tsx  (client orchestrator)
              - load-more-trigger/index.tsx       (sentinel + button)

            The `key` prop forces a full remount whenever sort/filter/page
            changes so the page list resets to [initialPage] automatically.
          */}
          <InfiniteProductGridShell
            firstPageNode={
              <PaginatedProducts
                sortBy={sort}
                page={1}
                countryCode={countryCode}
                colorFilter={selectedColors}
              />
            }
            renderPage={(p) => (
              <PaginatedProducts
                sortBy={sort}
                page={p}
                countryCode={countryCode}
                colorFilter={selectedColors}
              />
            )}
            totalCount={totalCount}
            pageSize={PRODUCT_LIMIT}
            initialPage={pageNumber}
            key={`${sort}|${selectedColors.join(",")}|${pageNumber}`}
          />
        </Suspense>
      </div>

    </div>
  )
}

export default StoreTemplate
