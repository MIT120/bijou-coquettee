/**
 * SkeletonProductPreview
 *
 * Mirrors the exact structure of ProductPreview so the layout
 * does not shift when real content appears. Uses the brand's
 * cream/warm-neutral palette instead of flat grey so the skeleton
 * reads as intentional on the light linen background.
 *
 * animate-pulse is declared here once; all child elements inherit
 * the opacity oscillation via CSS cascade.
 */
const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse space-y-3" aria-hidden="true">
      {/* Image placeholder — square to match ProductPreview's aspect-square */}
      <div className="relative overflow-hidden aspect-square bg-cream-200 rounded-sm">
        {/*
          Shimmer sweep: a semi-transparent gradient that slides from left
          to right over the placeholder. Uses the custom `shimmer` keyframe
          registered in tailwind.config.js.
          motion-reduce collapses the translate so only the ambient pulse
          of the parent animate-pulse remains — a gentler effect for users
          who prefer less motion.
        */}
        <div
          className={[
            "absolute inset-0",
            "bg-gradient-to-r from-transparent via-cream-100/60 to-transparent",
            "animate-shimmer motion-reduce:animate-none",
          ].join(" ")}
        />

        {/* Bottom-right badge placeholder */}
        <div className="absolute bottom-2 right-2 w-16 h-3 rounded-sm bg-cream-300/70" />
      </div>

      {/* Text block */}
      <div className="space-y-1">
        {/* Product title — two lines to handle longer names gracefully */}
        <div className="h-3.5 w-4/5 rounded-sm bg-cream-300" />
        <div className="h-3.5 w-3/5 rounded-sm bg-cream-300/70" />

        {/* Price */}
        <div className="h-3.5 w-1/4 rounded-sm bg-gold-200/80" />

        {/* Caption line */}
        <div className="h-2 w-2/5 rounded-sm bg-cream-200" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
