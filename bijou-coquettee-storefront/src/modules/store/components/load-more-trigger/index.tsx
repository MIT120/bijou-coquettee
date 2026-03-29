"use client"

/**
 * LoadMoreTrigger
 *
 * Rendered at the bottom of the product grid. Does two things:
 *
 *   1. Sentinel: An invisible 1 px div that fires `onLoadMore` when it
 *      enters the viewport (via useSentinel). This is the automatic path.
 *
 *   2. Button fallback: A visible "Load more" button for users with
 *      JavaScript disabled or who prefer explicit control. The button is
 *      always rendered; the sentinel supplements it — it never replaces it.
 *      This is the SEO-safe pattern recommended by Vercel.
 *
 * Loading state:
 *   When `isLoading` is true the button is replaced by three pulsing dots
 *   in the brand's gold tone. The dots use staggered animation-delay so
 *   they breathe in sequence (the "walking dots" pattern) rather than all
 *   flashing simultaneously.
 *
 * End state:
 *   When `hasMore` is false, a horizontal rule with "all items shown" copy
 *   fades in. No "You've reached the end!" toast — that pattern interrupts
 *   scroll momentum on mobile.
 */

import { useRef } from "react"
import { useSentinel } from "@lib/hooks/use-sentinel"

type LoadMoreTriggerProps = {
  /** Call this to fetch the next page. */
  onLoadMore: () => void
  /** True while the next page fetch is in-flight. */
  isLoading: boolean
  /** False when there are no more pages. Hides the button and sentinel. */
  hasMore: boolean
  /** Total number of products in the full result set. */
  totalCount: number
  /** Number of products rendered so far. */
  loadedCount: number
}

export default function LoadMoreTrigger({
  onLoadMore,
  isLoading,
  hasMore,
  totalCount,
  loadedCount,
}: LoadMoreTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useSentinel(sentinelRef, onLoadMore, {
    enabled: hasMore && !isLoading,
    rootMargin: "300px",
  })

  return (
    <div className="flex flex-col items-center gap-6 mt-12 mb-4 w-full">
      {/* Progress indicator — always visible */}
      {totalCount > 0 && (
        <p className="text-xs text-grey-40 font-sans tracking-wider">
          {Math.min(loadedCount, totalCount)} / {totalCount} items
        </p>
      )}

      {hasMore ? (
        <>
          {/* Walking-dots loading indicator */}
          {isLoading ? (
            <div
              role="status"
              aria-label="Loading more products"
              className="flex items-center gap-2 py-3"
            >
              {/* Three dots with staggered delay */}
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
              <span className="sr-only">Loading</span>
            </div>
          ) : (
            /* Load More button — visible at all times as explicit fallback */
            <button
              type="button"
              onClick={onLoadMore}
              className={[
                "group flex items-center gap-2",
                "border border-grey-20 rounded-full",
                "px-8 py-2.5",
                "text-xs font-sans tracking-widest uppercase text-grey-60",
                "hover:border-grey-40 hover:text-grey-90",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-gold-400 focus-visible:ring-offset-2",
                "transition-all duration-200",
              ].join(" ")}
            >
              {/* Animated plus icon */}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:rotate-90"
              >
                <path
                  d="M5 1v8M1 5h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Load more
            </button>
          )}

          {/* Invisible sentinel — positioned 300px below the fold trigger */}
          <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
        </>
      ) : (
        /* End-of-results state */
        <div
          className={[
            "flex items-center gap-4 w-full max-w-xs",
            "opacity-0 animate-[fade-in-top_0.4s_ease_forwards]",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <div className="flex-1 h-px bg-grey-20" />
          <span className="text-[0.65rem] font-sans tracking-widest uppercase text-grey-40 whitespace-nowrap">
            All {totalCount} items shown
          </span>
          <div className="flex-1 h-px bg-grey-20" />
        </div>
      )}
    </div>
  )
}
