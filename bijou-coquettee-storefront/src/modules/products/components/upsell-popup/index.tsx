"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button, clx } from "@medusajs/ui"
import { XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type UpsellPopupProps = {
  show: boolean
  onClose: () => void
  relatedProducts: HttpTypes.StoreProduct[]
  currentProductTitle: string
}

const UpsellPopup = ({
  show,
  onClose,
  relatedProducts,
  currentProductTitle,
}: UpsellPopupProps) => {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    if (show) {
      // Small delay to allow the DOM to render before triggering the transition
      const timer = setTimeout(() => setIsAnimated(true), 50)
      return () => clearTimeout(timer)
    } else {
      setIsAnimated(false)
    }
  }, [show])

  if (!show) return null

  const displayProducts = relatedProducts.slice(0, 3)
  const hasRelatedProducts = displayProducts.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-end small:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Добавено в кошницата"
    >
      {/* Backdrop */}
      <div
        className={clx(
          "absolute inset-0 bg-[rgba(28,20,15,0.50)] backdrop-blur-sm transition-opacity duration-300",
          isAnimated ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popup panel */}
      <div
        className={clx(
          "relative w-full small:w-auto small:min-w-[480px] small:max-w-[560px]",
          "bg-white rounded-t-2xl small:rounded-2xl shadow-2xl",
          "transition-all duration-500 ease-out",
          isAnimated
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={clx(
            "absolute top-4 right-4 z-10",
            "w-8 h-8 flex items-center justify-center",
            "rounded-full bg-grey-5 hover:bg-grey-10 transition-colors",
            "text-grey-40 hover:text-grey-60",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-40"
          )}
          aria-label="Затвори"
        >
          <XMark className="w-4 h-4" />
        </button>

        <div className="p-6 small:p-8">
          {/* Confirmation header */}
          <div className="flex items-start gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-full bg-gold-50 border border-gold-100 flex items-center justify-center flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              {/* Checkmark icon */}
              <svg
                className="w-4 h-4 text-soft-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-medium text-grey-90">
                Добавено в кошницата
              </p>
              <p className="font-sans text-xs text-grey-40 mt-0.5 truncate">
                {currentProductTitle}
              </p>
            </div>
          </div>

          {/* Upsell section — only rendered when there are suggestions */}
          {hasRelatedProducts && (
            <div className="border-t border-grey-10 pt-5">
              <div className="mb-5">
                <h3 className="font-display text-xl text-grey-90 font-light tracking-wide leading-snug">
                  Допълнете комплекта
                </h3>
                <p className="font-sans text-xs text-grey-40 mt-1">
                  Клиентите често купуват и тези бижута
                </p>
              </div>

              {/* Product suggestions */}
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {displayProducts.map((product) => {
                  const variant = product.variants?.[0]
                  const price = variant?.calculated_price

                  return (
                    <LocalizedClientLink
                      key={product.id}
                      href={`/products/${product.handle}`}
                      className="flex-shrink-0 w-[136px] group"
                      onClick={onClose}
                    >
                      {/* Product image */}
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-grey-5 mb-2">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title || ""}
                            fill
                            sizes="136px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          /* Placeholder for missing thumbnails */
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-grey-20"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <p className="font-sans text-xs text-grey-80 truncate leading-snug group-hover:text-grey-60 transition-colors duration-200">
                        {product.title}
                      </p>

                      {price?.calculated_amount != null &&
                        price?.currency_code && (
                          <p className="font-sans text-xs text-grey-50 font-medium mt-0.5">
                            {convertToLocale({
                              amount: price.calculated_amount,
                              currency_code: price.currency_code,
                            })}
                          </p>
                        )}
                    </LocalizedClientLink>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div
            className={clx(
              "flex flex-col xsmall:flex-row gap-3",
              hasRelatedProducts ? "mt-6" : "mt-2"
            )}
          >
            <Button
              variant="secondary"
              className="flex-1 rounded-full text-xs tracking-wide font-sans h-10"
              onClick={onClose}
            >
              Продължи пазаруването
            </Button>
            <LocalizedClientLink href="/cart" className="flex-1">
              <Button
                variant="primary"
                className="w-full rounded-full text-xs tracking-wide font-sans h-10 bg-grey-90 hover:bg-grey-80"
                onClick={onClose}
              >
                Към кошницата
              </Button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpsellPopup
