import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  return (
    <>
      {/* Fixed bottom bar on mobile */}
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0 translate-y-full"
          enterTo="opacity-100 translate-y-0"
          leave="ease-in duration-300"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-full"
        >
          <div
            className="bg-white flex flex-col gap-y-3 justify-center items-center p-4 pb-6 w-full border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
            data-testid="mobile-actions"
          >
            {/* Product title and price */}
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-ui-fg-base truncate max-w-[60%]" data-testid="mobile-title">
                {product.title}
              </span>
              {selectedPrice ? (
                <div className="flex items-center gap-x-2 text-ui-fg-base">
                  {selectedPrice.price_type === "sale" && (
                    <span className="line-through text-sm text-ui-fg-muted">
                      {selectedPrice.original_price}
                    </span>
                  )}
                  <span
                    className={clx("font-semibold", {
                      "text-ui-fg-interactive": selectedPrice.price_type === "sale",
                    })}
                  >
                    {selectedPrice.calculated_price}
                  </span>
                </div>
              ) : (
                <div></div>
              )}
            </div>

            {/* Action buttons */}
            <div className={clx("grid w-full gap-3", {
              "grid-cols-1": isSimple,
              "grid-cols-2": !isSimple
            })}>
              {!isSimple && (
                <Button
                  onClick={open}
                  variant="secondary"
                  className="w-full h-12"
                  data-testid="mobile-actions-button"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">
                      {variant
                        ? Object.values(options).join(" / ")
                        : "Select Options"}
                    </span>
                    <ChevronDown className="ml-2 flex-shrink-0" />
                  </div>
                </Button>
              )}
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || !variant}
                className="w-full h-12"
                isLoading={isAdding}
                data-testid="mobile-cart-button"
              >
                {!variant
                  ? "Select options"
                  : !inStock
                    ? "Out of stock"
                    : "Add to cart"}
              </Button>
            </div>
          </div>
        </Transition>
      </div>

      {/* Options selection modal */}
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-end justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel
                className="w-full max-h-[85vh] transform overflow-hidden text-left flex flex-col bg-white rounded-t-2xl"
                data-testid="mobile-actions-modal"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <Dialog.Title className="text-lg font-semibold text-ui-fg-base">
                    Select Options
                  </Dialog.Title>
                  <button
                    onClick={close}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-ui-fg-base flex justify-center items-center transition-colors"
                    data-testid="close-modal-button"
                  >
                    <X />
                  </button>
                </div>

                {/* Modal content */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  {(product.variants?.length ?? 0) > 1 && (
                    <div className="flex flex-col gap-y-6">
                      {(product.options || []).map((option) => {
                        return (
                          <div key={option.id}>
                            <OptionSelect
                              option={option}
                              current={options[option.id]}
                              updateOption={updateOptions}
                              title={option.title ?? ""}
                              disabled={optionsDisabled}
                              variants={product.variants ?? undefined}
                              selectedOptions={options}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Modal footer with confirm button */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <Button
                    onClick={close}
                    className="w-full h-12"
                    disabled={!variant}
                  >
                    {variant ? "Confirm Selection" : "Select all options"}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
