import { describe, expect, it } from "vitest"
import { HttpTypes } from "@medusajs/types"
import {
  applyProductFilters,
  hasProductFilter,
  matchesSearchQuery,
} from "../product-filters"

const sampleProduct = (
  overrides: Partial<HttpTypes.StoreProduct> = {}
): HttpTypes.StoreProduct =>
  ({
    id: "prod_1",
    handle: "rose-gold-ring",
    title: "Rose Gold Pearl Ring",
    description: "Elegant pearl ring in rose gold",
    collection_id: "col_1",
    categories: [{ id: "cat_1" }],
    tags: [{ id: "tag_1", value: "pearl" }],
    ...overrides,
  }) as HttpTypes.StoreProduct

describe("hasProductFilter", () => {
  it("detects active filters", () => {
    expect(hasProductFilter({ handle: "ring" })).toBe(true)
    expect(hasProductFilter({ q: "ring" })).toBe(true)
    expect(hasProductFilter({ limit: 12 } as never)).toBe(false)
  })
})

describe("matchesSearchQuery", () => {
  it("matches all search tokens", () => {
    const product = sampleProduct()
    expect(matchesSearchQuery(product, "rose pearl")).toBe(true)
    expect(matchesSearchQuery(product, "rose diamond")).toBe(false)
  })
})

describe("applyProductFilters", () => {
  const products = [
    sampleProduct(),
    sampleProduct({
      id: "prod_2",
      handle: "silver-necklace",
      title: "Silver Necklace",
      collection_id: "col_2",
      categories: [{ id: "cat_2" }],
      tags: [{ id: "tag_2", value: "silver" }],
    }),
  ]

  it("filters by handle", () => {
    const result = applyProductFilters(products, {
      handle: "rose-gold-ring",
    })
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe("prod_1")
  })

  it("filters by collection_id", () => {
    const result = applyProductFilters(products, {
      collection_id: ["col_2"],
    })
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe("prod_2")
  })

  it("filters by category_id", () => {
    const result = applyProductFilters(products, {
      category_id: ["cat_1"],
    })
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe("prod_1")
  })

  it("filters by id", () => {
    const result = applyProductFilters(products, {
      id: ["prod_2"],
    })
    expect(result).toHaveLength(1)
    expect(result[0]?.handle).toBe("silver-necklace")
  })

  it("filters by tag_id", () => {
    const result = applyProductFilters(products, {
      tag_id: ["tag_2"],
    })
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe("prod_2")
  })

  it("filters by search query", () => {
    const result = applyProductFilters(products, { q: "silver necklace" })
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe("prod_2")
  })
})
