"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies-server"

const COLLECTION_PAGE_SIZE = 100
const COLLECTION_MAX = 500

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  const allCollections: HttpTypes.StoreCollection[] = []
  let offset = 0
  let totalCount = 0

  while (allCollections.length < COLLECTION_MAX) {
    const { collections, count } = await sdk.client.fetch<{
      collections: HttpTypes.StoreCollection[]
      count: number
    }>("/store/collections", {
      query: {
        ...queryParams,
        limit: String(COLLECTION_PAGE_SIZE),
        offset: String(offset),
      },
      next,
      cache: "force-cache",
    })

    totalCount = count
    allCollections.push(...collections)

    if (
      collections.length < COLLECTION_PAGE_SIZE ||
      allCollections.length >= count ||
      allCollections.length >= COLLECTION_MAX
    ) {
      break
    }

    offset += COLLECTION_PAGE_SIZE
  }

  return {
    collections: allCollections,
    count: totalCount || allCollections.length,
  }
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection | undefined> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  try {
    return await sdk.client
      .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
        query: { handle, fields: "*products" },
        next,
        cache: "force-cache",
      })
      .then(({ collections }) => collections[0])
  } catch (error) {
    console.error(
      `[getCollectionByHandle] handle query failed for "${handle}":`,
      error instanceof Error ? error.message : error
    )

    try {
      const { collections } = await listCollections()
      return collections.find((collection) => collection.handle === handle)
    } catch (fallbackError) {
      console.error(
        `[getCollectionByHandle] fallback failed for "${handle}":`,
        fallbackError instanceof Error ? fallbackError.message : fallbackError
      )
      return undefined
    }
  }
}
