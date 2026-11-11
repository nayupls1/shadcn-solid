import * as stylex from "@stylexjs/stylex"
import { scrollFadeVars as v } from "./scroll-fade.stylex"

/**
 * shadcn's `scroll-fade-x`, `scroll-fade-y` and `scroll-fade-b` utilities (shadcn.css): an edge
 * mask that fades in as content scrolls under that edge, driven by a scroll timeline on the
 * element itself. Sizes and reveal distance read the same overridable variables
 * (`--scroll-fade-size`, `--scroll-fade-s-size`, ..., `--scroll-fade-reveal`).
 *
 * Unlike shadcn's, browsers without scroll-driven animations show no fade (shadcn shows a static
 * one there).
 */

// `min(12%, calc(var(--spacing) * 10))` and `calc(var(--spacing) * 24)` with Tailwind's 0.25rem.
const sizeT = "var(--scroll-fade-t-size, var(--scroll-fade-size, min(12%, 2.5rem)))"
const sizeB = "var(--scroll-fade-b-size, var(--scroll-fade-size, min(12%, 2.5rem)))"
const sizeS = "var(--scroll-fade-s-size, var(--scroll-fade-size, min(12%, 2.5rem)))"
const sizeE = "var(--scroll-fade-e-size, var(--scroll-fade-size, min(12%, 2.5rem)))"

const revealT = stylex.keyframes({ from: { [v.t]: "0px" }, to: { [v.t]: sizeT } })
const revealB = stylex.keyframes({ from: { [v.b]: sizeB }, to: { [v.b]: "0px" } })
const revealS = stylex.keyframes({ from: { [v.s]: "0px" }, to: { [v.s]: sizeS } })
const revealE = stylex.keyframes({ from: { [v.e]: sizeE }, to: { [v.e]: "0px" } })

const SUPPORTS = "@supports (animation-timeline: scroll())"

export const scrollFade = stylex.create({
  x: {
    maskImage: {
      default: `linear-gradient(to right, transparent 0, #000 ${v.s}, #000 calc(100% - ${v.e}), transparent 100%)`,
      ":dir(rtl)": `linear-gradient(to left, transparent 0, #000 ${v.s}, #000 calc(100% - ${v.e}), transparent 100%)`,
    },
    maskComposite: "intersect",
    maskRepeat: "no-repeat",
    animationName: { default: null, [SUPPORTS]: `${revealS}, ${revealE}` },
    animationDuration: { default: null, [SUPPORTS]: "1ms" },
    animationTimingFunction: { default: null, [SUPPORTS]: "ease-in-out" },
    animationTimeline: { default: null, [SUPPORTS]: "scroll(self inline), scroll(self inline)" },
    animationRange: {
      default: null,
      [SUPPORTS]: "0 var(--scroll-fade-reveal, 6rem), calc(100% - var(--scroll-fade-reveal, 6rem)) 100%",
    },
    animationFillMode: { default: null, [SUPPORTS]: "both" },
  },
  y: {
    maskImage: `linear-gradient(to bottom, transparent 0, #000 ${v.t}, #000 calc(100% - ${v.b}), transparent 100%)`,
    maskComposite: "intersect",
    maskRepeat: "no-repeat",
    animationName: { default: null, [SUPPORTS]: `${revealT}, ${revealB}` },
    animationDuration: { default: null, [SUPPORTS]: "1ms" },
    animationTimingFunction: { default: null, [SUPPORTS]: "ease-in-out" },
    animationTimeline: { default: null, [SUPPORTS]: "scroll(self y), scroll(self y)" },
    animationRange: {
      default: null,
      [SUPPORTS]: "0 var(--scroll-fade-reveal, 6rem), calc(100% - var(--scroll-fade-reveal, 6rem)) 100%",
    },
    animationFillMode: { default: null, [SUPPORTS]: "both" },
  },
  b: {
    maskImage: `linear-gradient(to bottom, #000 0, #000 calc(100% - ${v.b}), transparent 100%)`,
    maskComposite: "intersect",
    maskRepeat: "no-repeat",
    animationName: { default: null, [SUPPORTS]: revealB },
    animationDuration: { default: null, [SUPPORTS]: "1ms" },
    animationTimingFunction: { default: null, [SUPPORTS]: "ease-in-out" },
    animationTimeline: { default: null, [SUPPORTS]: "scroll(self y)" },
    animationRange: { default: null, [SUPPORTS]: "calc(100% - var(--scroll-fade-reveal, 6rem)) 100%" },
    animationFillMode: { default: null, [SUPPORTS]: "both" },
  },
})
