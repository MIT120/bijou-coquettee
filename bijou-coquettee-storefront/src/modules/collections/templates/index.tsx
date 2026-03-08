import { Suspense } from "react"

import { listProductsWithSort } from "@lib/data/products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { COLOR_FILTER_PARAM } from "@modules/store/components/refinement-list/color-filter"
import PaginatedProducts, {
  extractAvailableColors,
} from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  colorFilter,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  /** Comma-separated color names from the URL ?color= param. */
  colorFilter?: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Parse color filter from URL param (comma-separated string -> array)
  const selectedColors = (colorFilter ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)

  // Fetch the full (unfiltered) product list for this collection so we can
  // extract which color/metal values are actually available as filter options.
  const { response: { products: allProducts } } = await listProductsWithSort({
    page: 1,
    queryParams: {
      limit: 100,
      collection_id: [collection.id],
    },
    sortBy: sort,
    countryCode,
  })

  const availableColors = extractAvailableColors(allProducts)

  return (
    <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
      <RefinementList
        sortBy={sort}
        availableColors={availableColors}
      />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1>{collection.title}</h1>
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            colorFilter={selectedColors}
          />
        </Suspense>
      </div>
    </div>
  )
}
