import { Text } from "@medusajs/ui"

const TrustSignals = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <Text className="font-semibold text-gray-900 text-sm">Secure Checkout</Text>
          <Text className="text-xs text-gray-600">
            256-bit SSL encryption
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <Text className="font-semibold text-gray-900 text-sm">
            Authenticity Guaranteed
          </Text>
          <Text className="text-xs text-gray-600">
            All jewelry is certified authentic
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <div className="flex-1">
          <Text className="font-semibold text-gray-900 text-sm">30-Day Returns</Text>
          <Text className="text-xs text-gray-600">
            Free returns and exchanges
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </div>
        <div className="flex-1">
          <Text className="font-semibold text-gray-900 text-sm">Premium Packaging</Text>
          <Text className="text-xs text-gray-600">
            Elegant gift box included
          </Text>
        </div>
      </div>

      {/* Payment icons */}
      <div className="pt-4 border-t border-gray-100">
        <Text className="text-xs text-gray-500 mb-3 font-medium">
          Accepted Payment Methods
        </Text>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700">
            💳 Visa
          </div>
          <div className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700">
            💳 Mastercard
          </div>
          <div className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700">
            💰 Cash on Delivery
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrustSignals
