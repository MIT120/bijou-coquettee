import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink 
      href={`/products/${product.handle}`} 
      className="group block transition-opacity duration-300 hover:opacity-90"
    >
      <div data-testid="product-wrapper" className="space-y-3">
        <div className="relative overflow-hidden bg-grey-5 aspect-square">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="space-y-1">
          <Text 
            className="text-sm small:text-base text-grey-90 font-light tracking-wide block group-hover:text-grey-70 transition-colors duration-200" 
            data-testid="product-title"
          >
            {product.title}
          </Text>
          <div className="flex items-center">
            {cheapestPrice && (
              <PreviewPrice price={cheapestPrice} />
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
