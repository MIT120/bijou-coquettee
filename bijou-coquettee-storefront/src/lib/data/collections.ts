"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies-server"

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

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next,
        cache: "force-cache",
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
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
