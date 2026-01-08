"use client"

import { clx } from "@medusajs/ui"

type CheckoutProgressProps = {
  currentStep: "address" | "delivery" | "payment" | "review"
}

const steps = [
  { id: "address", label: "Address", number: 1 },
  { id: "delivery", label: "Delivery", number: 2 },
  { id: "payment", label: "Payment", number: 3 },
  { id: "review", label: "Review", number: 4 },
] as const

const CheckoutProgress = ({ currentStep }: CheckoutProgressProps) => {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <div className="w-full mb-8">
      {/* Mobile version - Compact dots */}
      <div className="flex items-center justify-between md:hidden">
        {steps.map((step, index) => {
          const isComplete = index < currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center w-full">
                <div
                  className={clx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200",
                    {
                      "bg-green-600 text-white": isComplete,
                      "bg-gray-900 text-white ring-4 ring-gray-900 ring-opacity-20": isCurrent,
                      "bg-gray-200 text-gray-500": !isComplete && !isCurrent,
                    }
                  )}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={clx(
                    "text-xs mt-2 font-medium transition-colors",
                    isCurrent ? "text-gray-900" : "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-6">
                  <div
                    className={clx(
                      "h-full transition-colors duration-200",
                      isComplete ? "bg-green-600" : "bg-gray-200"
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop version - Full width with labels */}
      <div className="hidden md:flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isComplete = index < currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center w-full">
                  <div
                    className={clx(
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-200 flex-shrink-0",
                      {
                        "bg-green-600 text-white": isComplete,
                        "bg-gray-900 text-white ring-4 ring-gray-900 ring-opacity-20 scale-110": isCurrent,
                        "bg-gray-200 text-gray-500": !isComplete && !isCurrent,
                      }
                    )}
                  >
                    {isComplete ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-4">
                      <div
                        className={clx(
                          "h-full transition-colors duration-200",
                          isComplete ? "bg-green-600" : "bg-gray-200"
                        )}
                      />
                    </div>
                  )}
                </div>
                <span
                  className={clx(
                    "text-sm mt-2 font-medium transition-colors",
                    isCurrent ? "text-gray-900" : "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CheckoutProgress
