let fallbackCount = 0

export function logProductFilterFallback(context: string, error: unknown) {
  fallbackCount += 1
  const message = error instanceof Error ? error.message : String(error)

  console.warn(
    `[medusa.products.fallback] context=${context} count=${fallbackCount} error=${message}`
  )
}

export function getProductFilterFallbackCount() {
  return fallbackCount
}
