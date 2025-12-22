import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { convertToLocale } from "@lib/util/money"
import Thumbnail from "@modules/products/components/thumbnail"

type ProductLineItemProps = {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}

const ProductLineItem = ({ item, currencyCode }: ProductLineItemProps) => {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Product Image with quantity badge */}
      <div className="relative flex-shrink-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          <Thumbnail
            thumbnail={item.variant?.product?.thumbnail}
            size="square"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Quantity badge */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold">
          {item.quantity}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Text className="font-medium text-gray-900 text-sm line-clamp-2">
          {item.product_title}
        </Text>

        {/* Variant info */}
        {item.variant_title && item.variant_title !== "Default Variant" && (
          <Text className="text-xs text-gray-600 mt-1">
            {item.variant_title}
          </Text>
        )}

        {/* Metal type badge for jewelry */}
        {item.variant?.product?.material && (
          <div className="mt-1">
            <span className="inline-block bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-200">
              {item.variant.product.material}
            </span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col items-end justify-between">
        <Text className="font-semibold text-gray-900">
          {convertToLocale({
            amount: item.total ?? 0,
            currency_code: currencyCode,
          })}
        </Text>
        {item.quantity > 1 && (
          <Text className="text-xs text-gray-500">
            {convertToLocale({
              amount: (item.total ?? 0) / item.quantity,
              currency_code: currencyCode,
            })}{" "}
            each
          </Text>
        )}
      </div>
    </div>
  )
}

export default ProductLineItem
