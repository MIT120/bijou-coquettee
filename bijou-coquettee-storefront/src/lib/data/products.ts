"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import {
  applyProductFilters,
  hasProductFilter,
  type ProductFilterParams,
} from "@lib/util/product-filters"
import { logProductFilterFallback } from "@lib/util/product-fetch-log"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { cache } from "react"
import { getAuthHeaders, getCacheOptions } from "./cookies-server"
import { getRegion, retrieveRegion } from "./regions"

const PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+metadata,+tags"

const FALLBACK_PAGE_SIZE = 100
const FALLBACK_MAX_PRODUCTS = 500
const SORT_FETCH_LIMIT = 500

type ProductQuery = Record<string, unknown>

/**
 * Fetch a single product by handle. Cached per request so generateMetadata
 * and the page component share one fetch.
 */
export const getProductByHandle = cache(
  async (
    countryCode: string,
    handle: string
  ): Promise<HttpTypes.StoreProduct | null> => {
    try {
      const { response } = await listProducts({
        countryCode,
        queryParams: { handle, limit: 1 },
      })

      return response.products[0] ?? null
    } catch (error) {
      console.error(
        `[getProductByHandle] Failed for "${handle}":`,
        error instanceof Error ? error.message : error
      )
      return null
    }
  }
)

async function fetchAllProductsUnfiltered(
  fetchProducts: (query: ProductQuery) => Promise<{
    products: HttpTypes.StoreProduct[]
    count: number
  }>,
  regionId: string
): Promise<HttpTypes.StoreProduct[]> {
  const allProducts: HttpTypes.StoreProduct[] = []
  let offset = 0

  while (allProducts.length < FALLBACK_MAX_PRODUCTS) {
    const { products, count } = await fetchProducts({
      limit: FALLBACK_PAGE_SIZE,
      offset,
      region_id: regionId,
      fields: PRODUCT_FIELDS,
    })

    allProducts.push(...products)

    if (
      products.length < FALLBACK_PAGE_SIZE ||
      allProducts.length >= count ||
      allProducts.length >= FALLBACK_MAX_PRODUCTS
    ) {
      break
    }

    offset += FALLBACK_PAGE_SIZE
  }

  return allProducts
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  const fetchProducts = (query: ProductQuery) =>
    sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query,
        headers,
        next,
        cache: "force-cache",
      }
    )

  const buildResponse = (
    products: HttpTypes.StoreProduct[],
    count: number
  ) => {
    const nextPage = count > offset + limit ? _pageParam + 1 : null

    return {
      response: {
        products,
        count,
      },
      nextPage,
      queryParams,
    }
  }

  const query = {
    limit,
    offset,
    region_id: region.id,
    fields: PRODUCT_FIELDS,
    ...queryParams,
  }

  const filterParams: ProductFilterParams = {
    handle: queryParams?.handle,
    collection_id: queryParams?.collection_id,
    category_id: queryParams?.category_id,
    id: queryParams?.id,
    tag_id: queryParams?.tag_id,
    q: queryParams?.q,
  }

  try {
    const { products, count } = await fetchProducts(query)
    return buildResponse(products, count)
  } catch (error) {
    if (!hasProductFilter(filterParams)) {
      throw error
    }

    logProductFilterFallback("listProducts", error)

    let allProducts: HttpTypes.StoreProduct[] = []

    try {
      allProducts = await fetchAllProductsUnfiltered(
        fetchProducts,
        region.id
      )
    } catch (fallbackError) {
      console.error(
        "[listProducts] Unfiltered fallback also failed:",
        fallbackError instanceof Error ? fallbackError.message : fallbackError
      )
      return buildResponse([], 0)
    }

    const filtered = applyProductFilters(allProducts, filterParams)
    const paginated = filtered.slice(offset, offset + limit)

    return buildResponse(paginated, filtered.length)
  }
}

export const getProductsByIds = async ({
  ids,
  countryCode,
}: {
  ids: string[]
  countryCode: string
}): Promise<HttpTypes.StoreProduct[]> => {
  if (!ids?.length) {
    return []
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return []
  }

  try {
    const { response } = await listProducts({
      countryCode,
      queryParams: { id: ids, limit: ids.length },
    })

    const byId = new Map(
      response.products.map((product) => [product.id, product])
    )

    return ids
      .map((id) => byId.get(id))
      .filter((product): product is HttpTypes.StoreProduct => !!product)
  } catch (error) {
    console.error("Error fetching products by IDs:", error)
    return []
  }
}

export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const displayLimit = queryParams?.limit || 12
  const safePage = Math.max(page, 1)

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      ...queryParams,
      limit: SORT_FETCH_LIMIT,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)
  const offset = (safePage - 1) * displayLimit
  const paginatedProducts = sortedProducts.slice(offset, offset + displayLimit)
  const nextPage = count > offset + displayLimit ? safePage + 1 : null

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
