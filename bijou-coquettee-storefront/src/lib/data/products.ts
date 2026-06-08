"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies-server"
import { getRegion, retrieveRegion } from "./regions"

const PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+metadata,+tags"

/**
 * Fetch a single product by handle. Falls back to listing products and
 * filtering in memory when the handle query fails (some deployments return
 * 500 for filtered /store/products requests).
 */
export const getProductByHandle = async (
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

  const fetchProducts = (query: Record<string, unknown>) =>
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
    const nextPage = count > offset + limit ? pageParam + 1 : null

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
    region_id: region?.id,
    fields: PRODUCT_FIELDS,
    ...queryParams,
  }

  try {
    const { products, count } = await fetchProducts(query)
    return buildResponse(products, count)
  } catch (error) {
    const hasFilter =
      queryParams?.handle ||
      queryParams?.collection_id ||
      queryParams?.category_id ||
      queryParams?.id ||
      queryParams?.q

    if (!hasFilter) {
      throw error
    }

    console.error(
      "[listProducts] Filtered query failed, falling back to in-memory filter:",
      error instanceof Error ? error.message : error
    )

    let allProducts: HttpTypes.StoreProduct[] = []

    try {
      const result = await fetchProducts({
        limit: 100,
        offset: 0,
        region_id: region?.id,
        fields: PRODUCT_FIELDS,
      })
      allProducts = result.products
    } catch (fallbackError) {
      console.error(
        "[listProducts] Unfiltered fallback also failed:",
        fallbackError instanceof Error ? fallbackError.message : fallbackError
      )
      return buildResponse([], 0)
    }

    let filtered = allProducts

    if (queryParams?.handle) {
      const handles = Array.isArray(queryParams.handle)
        ? queryParams.handle
        : [queryParams.handle]
      filtered = filtered.filter(
        (product) => product.handle && handles.includes(product.handle)
      )
    }

    if (queryParams?.collection_id) {
      const collectionIds = Array.isArray(queryParams.collection_id)
        ? queryParams.collection_id
        : [queryParams.collection_id]
      filtered = filtered.filter(
        (product) =>
          product.collection_id &&
          collectionIds.includes(product.collection_id)
      )
    }

    if (queryParams?.category_id) {
      const categoryIds = Array.isArray(queryParams.category_id)
        ? queryParams.category_id
        : [queryParams.category_id]
      filtered = filtered.filter((product) =>
        product.categories?.some(
          (category) => category.id && categoryIds.includes(category.id)
        )
      )
    }

    if (queryParams?.id) {
      const ids = Array.isArray(queryParams.id)
        ? queryParams.id
        : [queryParams.id]
      filtered = filtered.filter(
        (product) => product.id && ids.includes(product.id)
      )
    }

    if (queryParams?.q) {
      const term = String(queryParams.q).toLowerCase().trim()
      filtered = filtered.filter((product) => {
        const haystack = [
          product.title,
          product.description,
          product.handle,
          ...(product.tags?.map((tag) => tag.value) ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return haystack.includes(term)
      })
    }

    const paginated = filtered.slice(offset, offset + limit)
    return buildResponse(paginated, filtered.length)
  }
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const getProductsByIds = async ({
  ids,
  countryCode,
}: {
  ids: string[]
  countryCode: string
}): Promise<HttpTypes.StoreProduct[]> => {
  if (!ids || ids.length === 0) {
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

    return response.products
  } catch (error) {
    console.error("Error fetching products by IDs:", error)
    return []
  }
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
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
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
