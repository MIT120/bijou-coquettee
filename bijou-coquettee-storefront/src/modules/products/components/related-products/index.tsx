import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

async function fetchRelatedProducts(
  product: HttpTypes.StoreProduct,
  countryCode: string
): Promise<HttpTypes.StoreProduct[]> {
  const baseParams: HttpTypes.StoreProductListParams = {
    is_giftcard: false,
    limit: 12,
  }

  if (product.collection_id) {
    const { response } = await listProducts({
      queryParams: {
        ...baseParams,
        collection_id: [product.collection_id],
      },
      countryCode,
    })

    const collectionMatches = response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )

    if (collectionMatches.length) {
      return collectionMatches
    }
  }

  const tagIds =
    product.tags?.map((tag) => tag.id).filter((id): id is string => !!id) ?? []

  if (tagIds.length) {
    const { response } = await listProducts({
      queryParams: {
        ...baseParams,
        tag_id: tagIds,
      },
      countryCode,
    })

    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  }

  return []
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let products: HttpTypes.StoreProduct[] = []

  try {
    products = await fetchRelatedProducts(product, countryCode)
  } catch (error) {
    console.error("[RelatedProducts] Failed to fetch related products:", error)
    return null
  }

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-base-regular text-gray-600 mb-6">
          Related products
        </span>
        <p className="text-2xl-regular text-ui-fg-base max-w-lg">
          You might also want to check out these products.
        </p>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {products.map((relatedProduct) => (
          <li key={relatedProduct.id}>
            <Product region={region} product={relatedProduct} />
          </li>
        ))}
      </ul>
    </div>
  )
}
