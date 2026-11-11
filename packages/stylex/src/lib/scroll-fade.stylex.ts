import * as stylex from "@stylexjs/stylex"

/**
 * The edge sizes of shadcn's `scroll-fade-*` masks (see scroll-fade.ts). Typed, so StyleX
 * registers them with `@property` and the scroll-driven animation interpolates them, like
 * shadcn's `@property --scroll-fade-t/b/s/e`.
 */
export const scrollFadeVars = stylex.defineVars({
  t: stylex.types.lengthPercentage("0px"),
  b: stylex.types.lengthPercentage("0px"),
  s: stylex.types.lengthPercentage("0px"),
  e: stylex.types.lengthPercentage("0px"),
})
