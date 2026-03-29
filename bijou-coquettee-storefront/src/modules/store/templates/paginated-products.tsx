import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { OPTION_TITLES } from "@modules/store/components/refinement-list/color-filter"
import EmptyFilterState from "@modules/store/components/empty-filter-state"
import AnimatedProductGrid from "@modules/store/components/product-grid-animated"

const PRODUCT_LIMIT = 12

// Option title names that represent a color/metal choice.
const COLOR_OPTION_TITLES = OPTION_TITLES

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

/** Extract all unique color/metal values from a product list. */
export function extractAvailableColors(
  products: Awaited<
    ReturnType<typeof listProductsWithSort>
  >["response"]["products"]
): string[] {
  const seen = new Set<string>()

  for (const product of products) {
    for (const option of product.options ?? []) {
      if (!COLOR_OPTION_TITLES.includes(option.title?.toLowerCase().trim() ?? "")) {
        continue
      }
      for (const v of option.values ?? []) {
        if (v.value) seen.add(v.value)
      }
    }
  }

  return Array.from(seen).sort((a, b) => a.localeCompare(b))
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  colorFilter,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  colorFilter?: string[]
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  // Apply client-side color/metal filter when one or more colors are selected.
  // Medusa's store API does not expose option-value filtering natively, so we
  // filter the already-fetched products in memory (listProductsWithSort fetches
  // up to 100 products and then paginates locally).
  if (colorFilter && colorFilter.length > 0) {
    const normalizedFilter = colorFilter.map((c) => c.toLowerCase().trim())

    products = products.filter((product) => {
      for (const option of product.options ?? []) {
        if (
          !COLOR_OPTION_TITLES.includes(
            option.title?.toLowerCase().trim() ?? ""
          )
        ) {
          continue
        }
        for (const v of option.values ?? []) {
          if (
            v.value &&
            normalizedFilter.includes(v.value.toLowerCase().trim())
          ) {
            return true
          }
        }
      }
      return false
    })

    count = products.length

    // Re-paginate after filtering
    const pageParam = (page - 1) * PRODUCT_LIMIT
    products = products.slice(pageParam, pageParam + PRODUCT_LIMIT)
  }

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  // Show the empty state when filters produce zero results
  if (products.length === 0) {
    return <EmptyFilterState />
  }

  return (
    <>
      {/*
        Grid: 2-col on mobile, strict 3-col from the "small" breakpoint (1024px).
        Dropping the 4-col breakpoint keeps cards large and the photography
        prominent — the right call for a luxury jewelry context.
        AnimatedProductGrid wraps each card in a staggered entrance animation.
      */}
      <AnimatedProductGrid
        className="grid grid-cols-2 w-full small:grid-cols-3 gap-x-4 gap-y-8 small:gap-x-6 small:gap-y-10"
        data-testid="products-list"
      >
        {products.map((p) => (
          <ProductPreview key={p.id} product={p} region={region} />
        ))}
      </AnimatedProductGrid>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}

/**
 * PaginatedProductsCount
 *
 * Lightweight server component that fetches only the product count
 * for a given filter set. Used by InfiniteProductGrid to know the total
 * so it can render the "X / Y items" progress indicator and determine
 * whether more pages exist — without duplicating the full grid fetch.
 *
 * This is intentionally a separate export rather than embedding count
 * in PaginatedProducts' return value so that the grid server component
 * never needs to become a client component.
 */
export async function PaginatedProductsCount({
  sortBy,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  colorFilter,
}: {
  sortBy?: SortOptions
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  colorFilter?: string[]
}): Promise<number> {
  const queryParams: PaginatedProductsParams = { limit: 12 }

  if (collectionId) queryParams["collection_id"] = [collectionId]
  if (categoryId) queryParams["category_id"] = [categoryId]
  if (productsIds) queryParams["id"] = productsIds
  if (sortBy === "created_at") queryParams["order"] = "created_at"

  const region = await getRegion(countryCode)
  if (!region) return 0

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page: 1,
    queryParams,
    sortBy,
    countryCode,
  })

  if (colorFilter && colorFilter.length > 0) {
    const normalizedFilter = colorFilter.map((c) => c.toLowerCase().trim())
    products = products.filter((product) => {
      for (const option of product.options ?? []) {
        if (!COLOR_OPTION_TITLES.includes(option.title?.toLowerCase().trim() ?? "")) continue
        for (const v of option.values ?? []) {
          if (v.value && normalizedFilter.includes(v.value.toLowerCase().trim())) return true
        }
      }
      return false
    })
    count = products.length
  }

  return count
}
