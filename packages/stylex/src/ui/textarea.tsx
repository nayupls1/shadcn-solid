import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"

const SHADOW_XS = "0 1px 2px 0 rgb(0 0 0 / 0.05)"

// Port of shadcn/ui's base-vega `textarea` (see the Tailwind variant for the source classes).
const styles = stylex.create({
  base: {
    display: "flex",
    fieldSizing: "content",
    minHeight: "4rem",
    width: "100%",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.input, ":focus-visible": colors.ring },
    backgroundColor: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
    paddingInline: "0.625rem",
    paddingBlock: "0.5rem",
    fontSize: { default: "1rem", "@media (min-width: 48rem)": "0.875rem" },
    lineHeight: { default: "1.5rem", "@media (min-width: 48rem)": "1.25rem" },
    boxShadow: {
      default: SHADOW_XS,
      ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent), ${SHADOW_XS}`,
    },
    transitionProperty: "color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    cursor: { default: null, ":disabled": "not-allowed" },
    opacity: { default: null, ":disabled": 0.5 },
    "::placeholder": { color: colors.mutedForeground },
  },
  // `aria-invalid:*`: merged after `base` so it wins over `:focus-visible` (Tailwind's variant order).
  invalid: {
    borderColor: `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`,
    boxShadow: `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent)), ${SHADOW_XS}`,
  },
})

type TextareaProps = Omit<ComponentProps<"textarea">, "class"> & { class?: string; xstyle?: stylex.StyleXStyles }

function Textarea(props: TextareaProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () =>
    stylex.attrs(styles.base, String(props["aria-invalid"]) === "true" && styles.invalid, props.xstyle)
  return <textarea data-slot="textarea" {...rest} class={cx(attrs().class, props.class)} />
}

export { Textarea, type TextareaProps }
