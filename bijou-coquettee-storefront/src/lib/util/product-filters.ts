import { HttpTypes } from "@medusajs/types"

export type ProductFilterParams = {
  handle?: string | string[]
  collection_id?: string | string[]
  category_id?: string | string[]
  id?: string | string[]
  tag_id?: string | string[]
  q?: string
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export function matchesSearchQuery(
  product: HttpTypes.StoreProduct,
  term: string
): boolean {
  const normalized = term.toLowerCase().trim()

  if (!normalized) {
    return true
  }

  const tokens = normalized.split(/\s+/).filter(Boolean)
  const haystack = [
    product.title,
    product.description,
    product.handle,
    ...(product.tags?.map((tag) => tag.value) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return tokens.every((token) => haystack.includes(token))
}

export function applyProductFilters(
  products: HttpTypes.StoreProduct[],
  params: ProductFilterParams
): HttpTypes.StoreProduct[] {
  let filtered = products

  const handles = toArray(params.handle)
  if (handles.length) {
    filtered = filtered.filter(
      (product) => product.handle && handles.includes(product.handle)
    )
  }

  const collectionIds = toArray(params.collection_id)
  if (collectionIds.length) {
    filtered = filtered.filter(
      (product) =>
        product.collection_id && collectionIds.includes(product.collection_id)
    )
  }

  const categoryIds = toArray(params.category_id)
  if (categoryIds.length) {
    filtered = filtered.filter((product) =>
      product.categories?.some(
        (category) => category.id && categoryIds.includes(category.id)
      )
    )
  }

  const ids = toArray(params.id)
  if (ids.length) {
    filtered = filtered.filter(
      (product) => product.id && ids.includes(product.id)
    )
  }

  const tagIds = toArray(params.tag_id)
  if (tagIds.length) {
    filtered = filtered.filter((product) =>
      product.tags?.some((tag) => tag.id && tagIds.includes(tag.id))
    )
  }

  if (params.q) {
    filtered = filtered.filter((product) =>
      matchesSearchQuery(product, String(params.q))
    )
  }

  return filtered
}

export function hasProductFilter(
  params?: ProductFilterParams | null
): boolean {
  if (!params) {
    return false
  }

  return !!(
    params.handle ||
    params.collection_id ||
    params.category_id ||
    params.id ||
    params.tag_id ||
    params.q
  )
}
