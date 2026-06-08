"use client"

import { useParams, useRouter } from "next/navigation"
import { getLocale, t } from "@lib/util/translations"

export default function ProductFetchError() {
  const router = useRouter()
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const locale = getLocale(countryCode)

  return (
    <div
      className="flex flex-col items-center justify-center py-24 px-4 text-center"
      data-testid="product-fetch-error"
      role="alert"
    >
      <h3 className="font-display text-xl text-grey-70 mb-2 tracking-wide">
        {t("store.fetchError", locale)}
      </h3>
      <p className="text-sm text-grey-40 font-sans max-w-xs leading-relaxed mb-8">
        {t("store.fetchErrorDescription", locale)}
      </p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="inline-flex items-center h-10 px-6 rounded-full border border-grey-90 bg-grey-90 text-white text-xs tracking-widest uppercase font-sans transition-all duration-150 hover:bg-grey-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-90 focus-visible:ring-offset-2"
      >
        {t("store.tryAgain", locale)}
      </button>
    </div>
  )
}
