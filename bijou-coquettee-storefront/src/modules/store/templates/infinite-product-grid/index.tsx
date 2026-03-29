"use client"

/**
 * InfiniteProductGrid  (CLIENT COMPONENT)
 *
 * Orchestrates infinite scroll while keeping PaginatedProducts as a
 * pure server component. See infinite-product-grid-shell.tsx for the
 * full architecture explanation.
 *
 * What this component owns:
 *   - The list of page numbers currently mounted in the DOM.
 *   - The isLoading flag shown in LoadMoreTrigger.
 *   - URL synchronisation via history.replaceState.
 *   - The Suspense boundary for each page beyond page 1.
 *
 * What this component does NOT own:
 *   - Data fetching. All product data comes from the pre-built RSC nodes
 *     in `prebuiltPages` (built server-side in infinite-product-grid-shell).
 *   - Filter / sort state. That lives in the URL and is owned by
 *     RefinementList + StoreTemplate. When filters change, StoreTemplate
 *     passes a new `key` which forces a full remount and resets the page
 *     list to [initialPage].
 */

import {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import LoadMoreTrigger from "@modules/store/components/load-more-trigger"
import BackToTop from "@modules/common/components/back-to-top"

type InfiniteProductGridProps = {
  /** The already-rendered server node for the initial page. */
  firstPageNode: ReactNode
  /**
   * Map of page number → pre-built RSC node.
   * Built server-side; the client never fetches data directly.
   * Keys start at 2 (page 1 is firstPageNode).
   */
  prebuiltPages: Record<number, ReactNode>
  /** Total product count across all pages (for the progress indicator). */
  totalCount: number
  /** Products per page. Must match PRODUCT_LIMIT in paginated-products. */
  pageSize?: number
  /** Page number that was server-rendered. Usually 1. */
  initialPage?: number
}

export default function InfiniteProductGrid({
  firstPageNode,
  prebuiltPages,
  totalCount,
  pageSize = 12,
  initialPage = 1,
}: InfiniteProductGridProps) {
  // Ordered list of page numbers whose Suspense boundaries are mounted.
  const [pages, setPages] = useState<number[]>([initialPage])
  const [isLoading, setIsLoading] = useState(false)

  // Track pages already appended to prevent the sentinel + button both
  // triggering a duplicate append in the same render cycle.
  const appendedRef = useRef<Set<number>>(new Set([initialPage]))

  const lastPage = pages[pages.length - 1]
  const loadedCount = Math.min(lastPage * pageSize, totalCount)
  const hasMore = loadedCount < totalCount && (lastPage + 1) in prebuiltPages

  const loadNextPage = useCallback(() => {
    const nextPage = lastPage + 1
    // Guard against duplicate loads.
    if (appendedRef.current.has(nextPage)) return
    if (!(nextPage in prebuiltPages)) return

    appendedRef.current.add(nextPage)
    setIsLoading(true)
    setPages((prev) => [...prev, nextPage])

    // Sync URL without polluting the browser back-stack.
    try {
      const url = new URL(window.location.href)
      url.searchParams.set("page", String(nextPage))
      window.history.replaceState(null, "", url.toString())
    } catch {
      // Silent — replaceState can throw in sandboxed iframes.
    }
  }, [lastPage, prebuiltPages])

  // Clear loading state once the newly appended page's Suspense resolves.
  // We approximate this: when `pages` grows, wait 600 ms (the skeleton
  // has animate-pulse which looks intentional at this duration), then clear.
  const prevLengthRef = useRef(pages.length)
  useEffect(() => {
    if (pages.length <= prevLengthRef.current) return
    prevLengthRef.current = pages.length

    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [pages.length])

  return (
    <div className="w-full">
      {/* Page 1 — always the SSR'd node, no Suspense wrapper needed */}
      {firstPageNode}

      {/* Pages 2+ — each in its own Suspense boundary so they stream in
          independently and don't block one another */}
      {pages.slice(1).map((pageNum) => (
        <Suspense
          key={pageNum}
          fallback={
            <div
              className="mt-8"
              aria-label={`Loading page ${pageNum}`}
              role="status"
            >
              <SkeletonProductGrid numberOfProducts={pageSize} />
            </div>
          }
        >
          <div className="mt-8">{prebuiltPages[pageNum]}</div>
        </Suspense>
      ))}

      {/* Sentinel + walking dots + load-more button + end-of-results */}
      <LoadMoreTrigger
        onLoadMore={loadNextPage}
        isLoading={isLoading}
        hasMore={hasMore}
        totalCount={totalCount}
        loadedCount={loadedCount}
      />

      {/* Floating back-to-top button — slides up after 600 px of scroll */}
      <BackToTop threshold={600} />
    </div>
  )
}
