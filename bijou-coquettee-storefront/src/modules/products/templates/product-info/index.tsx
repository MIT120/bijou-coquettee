import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="font-sans text-xs tracking-[0.08em] uppercase text-grey-50 hover:text-grey-70 transition-colors"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="font-display text-2xl small:text-3xl leading-tight text-grey-90 font-light"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-sm text-grey-60 whitespace-pre-line leading-relaxed"
          data-testid="product-description"
        >
          {product.description}
        </Text>

        {/* Product Details - Flat rows matching wireframe */}
        <div className="border-t border-grey-10 pt-4 mt-1">
          <h3 className="font-sans text-xs tracking-[0.12em] uppercase text-grey-40 font-medium mb-3">
            Информация за продукта
          </h3>
          <div className="flex flex-col divide-y divide-grey-10">
            {product.weight && (
              <div className="flex items-center justify-between py-2.5">
                <span className="font-sans text-sm text-grey-60">Тегло</span>
                <span className="font-sans text-sm text-grey-90 font-medium">{product.weight} g</span>
              </div>
            )}
            {product.material && (
              <div className="flex items-center justify-between py-2.5">
                <span className="font-sans text-sm text-grey-60">Материал</span>
                <span className="font-sans text-sm text-grey-90 font-medium">{product.material}</span>
              </div>
            )}
            {product.origin_country && (
              <div className="flex items-center justify-between py-2.5">
                <span className="font-sans text-sm text-grey-60">Произход</span>
                <span className="font-sans text-sm text-grey-90 font-medium">{product.origin_country}</span>
              </div>
            )}
            {product.type && (
              <div className="flex items-center justify-between py-2.5">
                <span className="font-sans text-sm text-grey-60">Тип</span>
                <span className="font-sans text-sm text-grey-90 font-medium">{product.type.value}</span>
              </div>
            )}
            {(product.length || product.width || product.height) && (
              <div className="flex items-center justify-between py-2.5">
                <span className="font-sans text-sm text-grey-60">Размери</span>
                <span className="font-sans text-sm text-grey-90 font-medium">
                  {[product.length && `${product.length}L`, product.width && `${product.width}W`, product.height && `${product.height}H`].filter(Boolean).join(" x ")}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2.5">
              <span className="font-sans text-sm text-grey-60">Доставка</span>
              <span className="font-sans text-sm text-grey-90 font-medium">1-3 работни дни</span>
            </div>
          </div>
        </div>

        {/* Handmade Quality Badge */}
        <div className="flex items-center gap-3 mt-1 p-3 bg-grey-5 rounded-lg border border-grey-10">
          <div className="flex-shrink-0 w-10 h-10 rounded-full border border-soft-gold flex items-center justify-center bg-white">
            <svg className="w-5 h-5 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <div>
            <p className="font-sans text-xs font-medium text-grey-80 tracking-wide">
              Ръчна изработка
            </p>
            <p className="font-sans text-[0.65rem] text-grey-50 font-light">
              Сертифицирани материали
            </p>
          </div>
        </div>

        {/* Product Disclaimer */}
        <div className="p-3 border border-grey-10 rounded-lg bg-cream/50">
          <p className="font-sans text-[0.65rem] text-grey-50 font-light leading-relaxed">
            <span className="font-medium text-grey-60">Важно:</span> Изображението е с илюстративна цел. Видът и цветът може да се различава в зависимост от устройството. Продуктът е ръчна изработка и може да има минимални различия.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
