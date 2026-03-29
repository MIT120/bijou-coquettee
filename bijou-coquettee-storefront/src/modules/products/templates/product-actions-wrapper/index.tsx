import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const product = await listProducts({
    queryParams: { id: [id] },
    regionId: region.id,
  }).then(({ response }) => response.products[0])

  if (!product) {
    return null
  }

  // Fetch related products for upsell popup
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
    // silently fail - upsell is not critical
  }

  return (
    <ProductActions
      product={product}
      region={region}
      relatedProducts={relatedProducts}
    />
  )
}
