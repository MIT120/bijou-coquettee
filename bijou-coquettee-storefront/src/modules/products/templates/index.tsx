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
import ProductViewTracker from "@modules/products/components/product-view-tracker"

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
      <ProductViewTracker product={product} region={region} />
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-4 small:py-12 relative gap-x-10 gap-y-4 small:gap-y-8"
        data-testid="product-container"
      >
        {/* Image Gallery - Takes more space on desktop */}
        <div className="block w-full relative order-first small:order-none small:flex-1">
          <ImageGallery images={product?.images || []} />
        </div>

        {/* Product Info & Actions - Right sidebar on desktop */}
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:w-[400px] small:min-w-[360px] w-full gap-y-5">
          <ProductInfo product={product} />

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

          {/* Shipping & Returns accordion below actions */}
          <ProductTabs product={product} />
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
