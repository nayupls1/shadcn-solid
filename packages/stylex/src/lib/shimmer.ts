import * as stylex from "@stylexjs/stylex"

// StyleX port of the `shimmer` utility from shadcn's tailwind.css (vendored in
// @shadcn-solid/tailwind's shadcn.css). Defaults only: spread `3ch + 40px`, angle 20deg, 2s.
// The highlight differs in dark mode, so it's a `light-dark()` color.

const highlight =
  "light-dark(oklch(from currentColor l c h / calc(alpha * 0.2)), oklch(from currentColor max(0.8, calc(l + 0.4)) c h / calc(alpha + 0.4)))"
const spread = "(3ch + 40px)"

const shimmerKeyframes = stylex.keyframes({
  from: { backgroundPosition: "100% 0" },
  to: { backgroundPosition: "0 0" },
})

export const shimmerStyles = stylex.create({
  shimmer: {
    backgroundImage: {
      default: `linear-gradient(110deg, currentColor calc(50% - ${spread}), color-mix(in oklch, ${highlight}, currentColor 50%) calc(50% - ${spread} * 0.5), ${highlight} 50%, color-mix(in oklch, ${highlight}, currentColor 50%) calc(50% + ${spread} * 0.5), currentColor calc(50% + ${spread}))`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    backgroundRepeat: "no-repeat",
    backgroundSize: `calc(200% + ${spread} * 2) 100%`,
    backgroundPosition: "0 0",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: { default: "transparent", "@media (prefers-reduced-motion: reduce)": "currentColor" },
    animationName: { default: shimmerKeyframes, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "2s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  /** `shimmer-none`. */
  none: {
    backgroundImage: "none",
    WebkitTextFillColor: "currentColor",
  },
})
