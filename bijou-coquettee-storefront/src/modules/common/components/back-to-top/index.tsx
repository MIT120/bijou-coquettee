"use client"

/**
 * BackToTop
 *
 * A floating button that appears after the user scrolls 600 px.
 * Positioned fixed at the bottom-right, stacked above the mobile
 * sticky add-to-cart bar (z-40 on that bar → z-50 here).
 *
 * Transitions: opacity + translate so it slides up from below the
 * viewport edge rather than just fading in.
 *
 * Respects prefers-reduced-motion: the translate animation is suppressed
 * and only the opacity crossfade occurs.
 */

import { useScrollDepth } from "@lib/hooks/use-scroll-depth"

type BackToTopProps = {
  /** Scroll threshold in px before the button becomes visible. Default 600. */
  threshold?: number
}

export default function BackToTop({ threshold = 600 }: BackToTopProps) {
  const { showBackToTop, scrollToTop } = useScrollDepth({ threshold })

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className={[
        // Layout
        "fixed bottom-8 right-6 z-50",
        "flex items-center justify-center gap-1.5",
        "h-10 px-4",
        // Visual — warm cream background with soft gold border
        "bg-cream-100 border border-gold-300",
        "text-grey-70 text-xs font-sans tracking-widest uppercase",
        "rounded-full shadow-md",
        // Hover / focus
        "hover:bg-gold-50 hover:border-gold-400 hover:text-grey-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
        "transition-all duration-300",
        // Visibility — slide up from y-4 when shown, respect reduced-motion
        showBackToTop
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
        "motion-reduce:translate-y-0",
      ].join(" ")}
    >
      {/* Up arrow — inline SVG keeps bundle size zero */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <path
          d="M6 10V2M6 2L2.5 5.5M6 2L9.5 5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Top
    </button>
  )
}
