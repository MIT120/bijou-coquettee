import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies-server"

const CATEGORY_PAGE_SIZE = 100
const CATEGORY_MAX = 500

function flattenCategories(
  categories: HttpTypes.StoreProductCategory[]
): HttpTypes.StoreProductCategory[] {
  return categories.flatMap((category) => [
    category,
    ...(category.category_children
      ? flattenCategories(category.category_children)
      : []),
  ])
}

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const allCategories: HttpTypes.StoreProductCategory[] = []
  let offset = 0

  try {
    while (allCategories.length < CATEGORY_MAX) {
      const { product_categories, count } = await sdk.client.fetch<{
        product_categories: HttpTypes.StoreProductCategory[]
        count: number
      }>("/store/product-categories", {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit: CATEGORY_PAGE_SIZE,
          offset,
          ...query,
        },
        next,
        cache: "force-cache",
      })

      allCategories.push(...product_categories)

      if (
        product_categories.length < CATEGORY_PAGE_SIZE ||
        allCategories.length >= count ||
        allCategories.length >= CATEGORY_MAX
      ) {
        break
      }

      offset += CATEGORY_PAGE_SIZE
    }

    return allCategories
  } catch (error) {
    console.error(
      "[listCategories] Failed:",
      error instanceof Error ? error.message : error
    )
    return []
  }
}

export const getCategoryByHandle = async (
  categoryHandle: string[]
): Promise<HttpTypes.StoreProductCategory | undefined> => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  try {
    return await sdk.client
      .fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "*category_children, *products",
            handle,
          },
          next,
          cache: "force-cache",
        }
      )
      .then(({ product_categories }) => product_categories[0])
  } catch (error) {
    console.error(
      `[getCategoryByHandle] handle query failed for "${handle}":`,
      error instanceof Error ? error.message : error
    )

    const categories = await listCategories()
    return flattenCategories(categories).find(
      (category) => category.handle === handle
    )
  }
}
