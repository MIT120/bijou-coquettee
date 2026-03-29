"use client"

import React from "react"

/**
 * AnimatedProductGrid
 *
 * A client-side wrapper that applies staggered fade-in + slide-up entrance
 * animations to each product card when the grid first mounts.
 *
 * Animation contract:
 *   - Each <li> begins: opacity 0, translateY 16px
 *   - Animates to: opacity 1, translateY 0
 *   - Duration: 400ms, ease-out
 *   - Stagger: 60ms per card, capped so card[n] delay = min(n * 60ms, 420ms)
 *   - prefers-reduced-motion: cards appear instantly (no transform, no fade)
 *
 * Only transform + opacity are animated — no layout-triggering properties.
 */
const AnimatedProductGrid = ({
  children,
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  className?: string
  "data-testid"?: string
}) => {
  return (
    <ul
      className={className}
      data-testid={dataTestId}
    >
      {React.Children.map(children, (child, index) => {
        const staggerDelay = Math.min(index * 60, 420)
        return (
          <li
            key={index}
            className="product-card-entrance motion-reduce:opacity-100 motion-reduce:[animation:none]"
            style={
              {
                "--stagger-delay": `${staggerDelay}ms`,
              } as React.CSSProperties
            }
          >
            {/* Strip the wrapping <li> from the child if it already is one */}
            {child}
          </li>
        )
      })}
    </ul>
  )
}

export default AnimatedProductGrid
