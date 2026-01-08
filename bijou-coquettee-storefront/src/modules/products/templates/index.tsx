import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import ProductCommentsSection from "@modules/products/components/product-comments"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-4 small:py-12 relative gap-x-8 gap-y-4 small:gap-y-8"
        data-testid="product-container"
      >
        {/* Product Info - Hidden on mobile, shown in sidebar on desktop */}
        <div className="hidden small:flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>

        {/* Image Gallery - Full width on mobile */}
        <div className="block w-full relative small:px-4 order-first small:order-none">
          <ImageGallery images={product?.images || []} />
        </div>

        {/* Product Actions & Info on Mobile */}
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full gap-y-4 small:gap-y-12">
          {/* Show product info on mobile only */}
          <div className="small:hidden">
            <ProductInfo product={product} />
          </div>

          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>

          {/* Show product tabs on mobile only */}
          <div className="small:hidden mt-4">
            <ProductTabs product={product} />
          </div>
        </div>
      </div>
      <div className="content-container my-16 small:my-24">
        {/* Product comments & community insights */}
        <ProductCommentsSection productId={product.id} />
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
