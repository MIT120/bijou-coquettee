"use client"

import { Heading, Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  getEcontPreference,
  validateEcontPreference,
  type EcontPreference,
} from "@lib/data/econt"
import { getLocale, t } from "@lib/util/translations"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const locale = getLocale(countryCode)
  const [econtPreference, setEcontPreference] =
    useState<EcontPreference | null>(null)
  const [econtValidation, setEcontValidation] = useState<{
    valid: boolean
    error?: string
  }>({ valid: true })
  const [isLoadingEcont, setIsLoadingEcont] = useState(false)
  // Fix 4: Track whether the validation error is from a transient fetch failure
  // vs. genuine missing data — transient errors should warn but not hard-block.
  const [econtFetchFailed, setEcontFetchFailed] = useState(false)

  // Fix 3: Terms & conditions acceptance state
  const [termsAccepted, setTermsAccepted] = useState(false)

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
      setEcontFetchFailed(false)
      getEcontPreference(cart.id)
        .then(async (preference) => {
          setEcontPreference(preference)
          const validation = await validateEcontPreference(preference)
          setEcontValidation(validation)
        })
        .catch((err) => {
          // Fix 4: A network/fetch error should not hard-block the user.
          // We flag the fetch failure separately so the UI can show a soft warning.
          console.error("[Review] Failed to fetch Econt preference:", err)
          setEcontFetchFailed(true)
          // Keep the previous validation state (default: valid: true) so the
          // button is not needlessly blocked by a transient connectivity issue.
        })
        .finally(() => {
          setIsLoadingEcont(false)
        })
    } else if (!isBulgaria) {
      // Non-Bulgaria orders don't need Econt validation
      setEcontValidation({ valid: true })
    }
  }, [isOpen, isBulgaria, cart?.id])

  // The payment button is ready only when:
  // 1. Econt data is valid (for Bulgaria orders), OR the fetch failed transiently
  // 2. Terms & conditions are accepted
  const econtValid = !isBulgaria || econtValidation.valid || econtFetchFailed
  const canPlaceOrder = econtValid && termsAccepted && !isLoadingEcont

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
          {t("checkout.review", locale)}
        </Heading>
      </div>

      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                {t("checkout.reviewConfirmText", locale)}
              </Text>
            </div>
          </div>

          {/* Show Econt validation error for Bulgaria orders */}
          {isBulgaria && !econtValidation.valid && !isLoadingEcont && !econtFetchFailed && (
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
                  {isBulgaria
                    ? "Непълни данни за доставка"
                    : "Incomplete delivery data"}
                </Text>
                <Text className="text-red-700 text-small-regular">
                  {econtValidation.error}
                </Text>
                <Text className="text-red-600 text-small-regular mt-2">
                  Моля, върнете се към стъпка &quot;{t("checkout.delivery", locale)}&quot; и попълнете
                  данните за Econt доставка.
                </Text>
              </div>
            </div>
          )}

          {/* Fix 4: Soft warning when the Econt validation fetch itself failed */}
          {isBulgaria && econtFetchFailed && !isLoadingEcont && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <Text className="text-amber-800 font-medium text-small-regular">
                  {isBulgaria
                    ? "Не може да се провери статусът на доставката"
                    : "Could not verify delivery status"}
                </Text>
                <Text className="text-amber-700 text-small-regular">
                  {isBulgaria
                    ? "Уверете се, че сте запазили данните за Econt доставка преди да потвърдите поръчката."
                    : "Please make sure you saved your Econt delivery details before placing the order."}
                </Text>
              </div>
            </div>
          )}

          {/* Fix 3: Terms & Conditions checkbox — required before placing order */}
          <div className="mb-6">
            <label
              className={clx(
                "flex items-start gap-3 cursor-pointer group rounded-lg border p-4 transition-colors",
                termsAccepted
                  ? "border-ui-border-interactive bg-ui-bg-base"
                  : "border-ui-border-base bg-ui-bg-subtle hover:border-ui-border-strong"
              )}
            >
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 flex-shrink-0 rounded border-ui-border-strong text-ui-fg-base focus:ring-ui-border-interactive cursor-pointer"
                data-testid="terms-checkbox"
                aria-required="true"
              />
              <span className="text-small-regular text-ui-fg-base leading-relaxed">
                {isBulgaria ? (
                  <>
                    Съгласен/на съм с{" "}
                    <a
                      href="/bg/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      общите условия
                    </a>{" "}
                    на Bijou Coquettee и потвърждавам, че съм запознат/а с{" "}
                    <a
                      href="/bg/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      политиката за поверителност
                    </a>
                    .
                  </>
                ) : (
                  <>
                    I agree to the{" "}
                    <a
                      href="/bg/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      terms and conditions
                    </a>{" "}
                    and acknowledge the{" "}
                    <a
                      href="/bg/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      privacy policy
                    </a>
                    .
                  </>
                )}
              </span>
            </label>

            {/* Helper text shown when checkbox is not checked */}
            {!termsAccepted && (
              <p className="mt-2 text-xs text-ui-fg-subtle pl-1">
                {isBulgaria
                  ? "Необходимо е да приемете общите условия, за да финализирате поръчката."
                  : "You must accept the terms and conditions to place your order."}
              </p>
            )}
          </div>

          <PaymentButton
            cart={cart}
            data-testid="submit-order-button"
            econtValid={canPlaceOrder}
            isLoadingEcont={isLoadingEcont}
          />
        </>
      )}
    </div>
  )
}

export default Review
