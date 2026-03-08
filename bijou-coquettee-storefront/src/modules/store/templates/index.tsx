import { Suspense } from "react"

import { listProductsWithSort } from "@lib/data/products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { t } from "@lib/util/translations-server"

import PaginatedProducts, {
  extractAvailableColors,
} from "./paginated-products"

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

  // Fetch the full product list (unfiltered) to populate color swatches.
  // Wrapped in try-catch so a backend failure does not crash the entire page.
  let availableColors: string[] = []
  try {
    const { response: { products: allProducts } } = await listProductsWithSort({
      page: 1,
      queryParams: { limit: 100 },
      sortBy: sort,
      countryCode,
    })
    availableColors = extractAvailableColors(allProducts)
  } catch {
    // If the color-swatch fetch fails, render without color filters rather
    // than crashing the whole template.
  }

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} availableColors={availableColors} />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">{await t("store.allProducts", countryCode)}</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            colorFilter={selectedColors}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
