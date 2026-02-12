"use client"

import { Heading, Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  getEcontPreference,
  validateEcontPreference,
  type EcontPreference,
} from "@lib/data/econt"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()
  const [econtPreference, setEcontPreference] =
    useState<EcontPreference | null>(null)
  const [econtValidation, setEcontValidation] = useState<{
    valid: boolean
    error?: string
  }>({ valid: true })
  const [isLoadingEcont, setIsLoadingEcont] = useState(false)

  const isOpen = searchParams.get("step") === "review"
  const isBulgaria =
    cart?.shipping_address?.country_code?.toLowerCase() === "bg"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  // Fetch and validate Econt preference for Bulgaria orders
  useEffect(() => {
    if (isOpen && isBulgaria && cart?.id) {
      setIsLoadingEcont(true)
      getEcontPreference(cart.id)
        .then(async (preference) => {
          setEcontPreference(preference)
          const validation = await validateEcontPreference(preference)
          setEcontValidation(validation)
        })
        .catch((err) => {
          console.error("[Review] Failed to fetch Econt preference:", err)
          setEcontValidation({
            valid: false,
            error:
              "Грешка при проверка на данните за доставка. Моля, опитайте отново.",
          })
        })
        .finally(() => {
          setIsLoadingEcont(false)
        })
    } else if (!isBulgaria) {
      // Non-Bulgaria orders don't need Econt validation
      setEcontValidation({ valid: true })
    }
  }, [isOpen, isBulgaria, cart?.id])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Medusa
                Store&apos;s Privacy Policy.
              </Text>
            </div>
          </div>

          {/* Show Econt validation error for Bulgaria orders */}
          {isBulgaria && !econtValidation.valid && !isLoadingEcont && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <Text className="text-red-800 font-medium text-small-regular">
                  Непълни данни за доставка
                </Text>
                <Text className="text-red-700 text-small-regular">
                  {econtValidation.error}
                </Text>
                <Text className="text-red-600 text-small-regular mt-2">
                  Моля, върнете се към стъпка &quot;Delivery&quot; и попълнете
                  данните за Econt доставка.
                </Text>
              </div>
            </div>
          )}

          <PaymentButton
            cart={cart}
            data-testid="submit-order-button"
            econtValid={!isBulgaria || econtValidation.valid}
            isLoadingEcont={isLoadingEcont}
          />
        </>
      )}
    </div>
  )
}

export default Review
