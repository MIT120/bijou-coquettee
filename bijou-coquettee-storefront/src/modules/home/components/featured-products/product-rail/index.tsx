import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="content-container py-10 small:py-32 border-t border-grey-10 first:border-t-0">
      <div className="flex flex-col small:flex-row justify-between items-start small:items-center mb-8 small:mb-16 gap-4">
        <div>
          <div className="inline-block mb-3">
            <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-grey-60 font-normal">
              Collection
            </span>
          </div>
          <Text className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-[-0.01em] block">
            {collection.title}
          </Text>
          {pricedProducts && pricedProducts.length > 0 && (
            <Text className="text-sm text-grey-50 mt-2 font-light">
              {pricedProducts.length} {pricedProducts.length === 1 ? 'piece' : 'pieces'}
            </Text>
          )}
        </div>
        <InteractiveLink 
          href={`/collections/${collection.handle}`}
          className="font-sans text-sm uppercase tracking-[0.12em] text-grey-60 hover:text-grey-90 transition-colors duration-200 font-medium border-b border-transparent hover:border-grey-50 pb-1 mt-8 small:mt-0"
        >
          View all →
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-3 large:grid-cols-4 gap-x-4 small:gap-x-8 gap-y-8 small:gap-y-24">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id} className="group">
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
