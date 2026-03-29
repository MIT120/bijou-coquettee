import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import WishlistButton from "../wishlist-button"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const isOnSale = cheapestPrice?.price_type === "sale"
  const percentOff = cheapestPrice?.percentage_diff
    ? `${cheapestPrice.percentage_diff}%`
    : null

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
    >
      <div data-testid="product-wrapper" className="flex flex-col">

        {/* ── Image container ─────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-grey-5 aspect-[3/4]">

          {/* Product image — very subtle zoom on hover */}
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
          </div>

          {/* Scrim: appears on hover to lift overlaid elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-grey-90/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Sale badge — top-left, warm dark */}
          {isOnSale && percentOff && (
            <div className="absolute top-3 left-3 z-10 bg-grey-90 text-grey-0 text-[0.6rem] font-sans font-medium px-2 py-0.5 tracking-[0.1em] uppercase leading-tight">
              -{percentOff}
            </div>
          )}

          {/* Handmade badge — top-right, gold tint, always visible */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-cream-100/90 backdrop-blur-sm border border-gold-200 text-gold-600 text-[0.55rem] font-sans font-medium px-2 py-0.5 tracking-[0.08em] uppercase leading-tight rounded-sm">
            {/* Sparkle glyph — purely decorative */}
            <span aria-hidden="true" className="text-gold-400">✦</span>
            Ръчна изработка
          </div>

          {/* Wishlist button — fades in from top-right corner on hover */}
          {/* Positioned below the handmade badge with a gap */}
          <div className="absolute top-11 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-[-4px] group-hover:translate-y-0 transition-all duration-300 ease-out">
            <WishlistButton
              productId={product.id}
              size="sm"
              className="shadow-none border-gold-200 hover:border-gold-400 bg-cream-100/90 backdrop-blur-sm"
            />
          </div>

          {/* CTA strip — slides up from bottom of image on hover */}
          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <div className="flex items-center justify-center bg-grey-90/95 backdrop-blur-sm py-3 px-4">
              <span className="text-grey-0 text-[0.7rem] font-sans font-medium tracking-[0.18em] uppercase">
                Виж продукта
              </span>
              {/* Arrow — slides in with slight delay */}
              <span
                aria-hidden="true"
                className="ml-2 text-gold-300 text-xs opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300 delay-100"
              >
                →
              </span>
            </div>
          </div>
        </div>

        {/* ── Info block ──────────────────────────────────────────── */}
        <div className="pt-3 pb-1 space-y-0.5">

          {/* Product title */}
          <Text
            className="text-[0.8rem] small:text-sm text-grey-80 font-sans font-light tracking-[0.04em] leading-snug block transition-colors duration-200 group-hover:text-grey-90"
            data-testid="product-title"
          >
            {product.title}
          </Text>

          {/* Price row */}
          <div className="flex items-baseline gap-2 pt-0.5">
            {cheapestPrice && (
              <PreviewPrice price={cheapestPrice} />
            )}
          </div>

        </div>

      </div>
    </LocalizedClientLink>
  )
}
