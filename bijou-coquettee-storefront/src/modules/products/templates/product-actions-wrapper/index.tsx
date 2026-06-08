import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Renders product actions. Uses the product already fetched on the page
 * instead of re-querying by id (avoids duplicate API calls that can 500).
 */
export default async function ProductActionsWrapper({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const relatedQueryParams: HttpTypes.StoreProductListParams = {
    limit: 5,
    is_giftcard: false,
  }
  if (region?.id) {
    relatedQueryParams.region_id = region.id
  }
  if (product.collection_id) {
    relatedQueryParams.collection_id = [product.collection_id]
  }

  let relatedProducts: HttpTypes.StoreProduct[] = []
  try {
    const { response } = await listProducts({
      queryParams: relatedQueryParams,
      regionId: region.id,
    })
    relatedProducts = response.products
      .filter((p) => p.id !== product.id)
      .slice(0, 4)
  } catch {
    // Upsell is optional — collection filter may fail on some backends
  }

  return (
    <ProductActions
      product={product}
      region={region}
      relatedProducts={relatedProducts}
    />
  )
}
