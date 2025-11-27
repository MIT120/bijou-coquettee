"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"

import { t as translate, getLocale } from "@lib/util/translations"
import XIcon from "@modules/common/icons/x"

type SearchBarProps = {
  className?: string
  autoFocus?: boolean
  variant?: "default" | "compact"
}

const SearchBar = ({
  className,
  autoFocus = false,
  variant = "default",
}: SearchBarProps) => {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const countryCode = (params?.countryCode as string) || ""
  const [value, setValue] = useState(() => searchParams?.get("query") ?? "")
  const inputRef = useRef<HTMLInputElement>(null)

  const activeQuery = searchParams?.get("query") ?? ""

  useEffect(() => {
    setValue(activeQuery)
  }, [activeQuery])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [autoFocus])

  const locale = useMemo(() => getLocale(countryCode), [countryCode])

  const placeholder = translate("search.placeholder", locale)
  const searchLabel = translate("search.cta", locale)

  const basePath = countryCode ? `/${countryCode}/search` : "/search"

  const buildSearchUrl = (queryValue: string) => {
    const paramsCopy = new URLSearchParams(searchParams ?? undefined)

    if (queryValue) {
      paramsCopy.set("query", queryValue)
    } else {
      paramsCopy.delete("query")
    }

    paramsCopy.delete("page")

    const queryString = paramsCopy.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedValue = value.trim()
    router.push(buildSearchUrl(trimmedValue))
  }

  const handleClear = () => {
    if (!value) {
      return
    }

    setValue("")
    router.push(buildSearchUrl(""))
  }

  const formWidthClass =
    variant === "compact" ? "w-full" : "w-full max-w-md"

  const wrapperBase =
    "flex items-center gap-2 rounded-full border border-ui-border-base bg-ui-bg-subtle focus-within:border-ui-fg-base focus-within:ring-1 focus-within:ring-ui-fg-base transition-colors"

  const wrapperClass =
    variant === "compact"
      ? `${wrapperBase} px-3 py-1.5 text-small-regular`
      : `${wrapperBase} px-4 py-2`

  const buttonClass =
    variant === "compact"
      ? "text-small-regular font-medium text-ui-fg-base hover:text-ui-fg-subtle transition-colors"
      : "text-small-regular font-medium text-ui-fg-base hover:text-ui-fg-subtle transition-colors"

  return (
    <form
      className={`${formWidthClass} ${className ?? ""}`}
      onSubmit={handleSubmit}
    >
      <label htmlFor="global-product-search" className="sr-only">
        {placeholder}
      </label>
      <div className={wrapperClass}>
        <input
          id="global-product-search"
          ref={inputRef}
          name="query"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-small-regular placeholder:text-ui-fg-muted focus:outline-none"
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-ui-fg-muted hover:text-ui-fg-base transition-colors"
            aria-label={translate("common.clear", locale)}
          >
            <XIcon size="16" />
          </button>
        ) : null}
        <button type="submit" className={buttonClass}>
          {searchLabel}
        </button>
      </div>
    </form>
  )
}

export default SearchBar


