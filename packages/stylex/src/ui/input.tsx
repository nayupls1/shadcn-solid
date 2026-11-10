import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Input as InputPrimitive } from "base-ui-solidjs/input"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"

const SHADOW_XS = "0 1px 2px 0 rgb(0 0 0 / 0.05)"

// Port of shadcn/ui's base-vega `input` (see the Tailwind variant for the source classes).
const styles = stylex.create({
  base: {
    height: "2.25rem",
    width: "100%",
    minWidth: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.input, ":focus-visible": colors.ring },
    backgroundColor: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
    paddingInline: "0.625rem",
    paddingBlock: "0.25rem",
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
    pointerEvents: { default: null, ":disabled": "none" },
    cursor: { default: null, ":disabled": "not-allowed" },
    opacity: { default: null, ":disabled": 0.5 },
    "::placeholder": { color: colors.mutedForeground },
    "::file-selector-button": {
      display: "inline-flex",
      height: "1.75rem",
      borderWidth: 0,
      backgroundColor: "transparent",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
      color: colors.foreground,
    },
  },
  // `aria-invalid:*`: a separate style merged after `base` (like Button), so it wins over
  // `:focus-visible` the way Tailwind's variant order does.
  invalid: {
    borderColor: `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`,
    boxShadow: `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent)), ${SHADOW_XS}`,
  },
})

type InputProps = Omit<InputPrimitive.Props, "class"> & { class?: string; xstyle?: stylex.StyleXStyles }

function Input(props: InputProps) {
  const rest = omit(props, "class", "xstyle", "type")
  const attrs = () =>
    stylex.attrs(styles.base, String(props["aria-invalid"]) === "true" && styles.invalid, props.xstyle)
  return <InputPrimitive type={props.type} data-slot="input" {...rest} class={cx(attrs().class, props.class)} />
}

export { Input, type InputProps }
