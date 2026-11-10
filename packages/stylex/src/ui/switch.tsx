import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Switch as SwitchPrimitive } from "base-ui-solidjs/switch"
import { colors } from "../tokens.stylex"
import { fieldLabelMarker, peerMarker } from "../lib/markers.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"

// Port of shadcn/ui's base-vega `switch` (see the Tailwind variant for the source classes).
// The `group-data-[size=*]/switch` thumb sizes come from the `size` prop instead.
const shadowXs = "0 1px 2px 0 rgb(0 0 0 / 0.05)"
const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const invalidRing = `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`
const invalidBorder = `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`

const styles = stylex.create({
  root: {
    position: "relative",
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    borderRadius: "9999px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "transparent",
      ":focus-visible:not([aria-invalid=true])": { default: colors.ring, [stylex.when.ancestor(":has(:focus-visible)", fieldLabelMarker)]: "transparent" },
      ":is([aria-invalid=true])": invalidBorder,
    },
    backgroundColor: {
      default: null,
      ":is([data-checked])": colors.primary,
      ":is([data-unchecked])": `light-dark(${colors.input}, color-mix(in oklch, ${colors.input} 80%, transparent))`,
    },
    boxShadow: {
      default: shadowXs,
      ":focus-visible:not([aria-invalid=true])": { default: `${focusRing}, ${shadowXs}`, [stylex.when.ancestor(":has(:focus-visible)", fieldLabelMarker)]: shadowXs },
      ":is([aria-invalid=true])": `${invalidRing}, ${shadowXs}`,
    },
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    cursor: { default: null, ":is([data-disabled])": "not-allowed" },
    opacity: { default: null, ":is([data-disabled])": 0.5 },
    "::after": {
      content: '""',
      position: "absolute",
      insetInline: "-0.75rem",
      insetBlock: "-0.5rem",
    },
  },
  rootDefault: { height: "18.4px", width: "32px" },
  rootSm: { height: "14px", width: "24px" },
  thumb: {
    pointerEvents: "none",
    display: "block",
    borderRadius: "9999px",
    backgroundColor: {
      default: colors.background,
      ":is([data-checked])": `light-dark(${colors.background}, ${colors.primaryForeground})`,
      ":is([data-unchecked])": `light-dark(${colors.background}, ${colors.foreground})`,
    },
    transform: {
      default: null,
      ":is([data-checked])": "translateX(calc(100% - 2px))",
      ":is([data-unchecked])": "translateX(0)",
    },
    transitionProperty: "transform",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  thumbDefault: { width: "1rem", height: "1rem" },
  thumbSm: { width: "0.75rem", height: "0.75rem" },
})

type SwitchProps = Omit<SwitchPrimitive.Root.Props, "class"> & {
  class?: string
  size?: "sm" | "default"
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function Switch(props: SwitchProps) {
  const rest = omit(props, "class", "style", "size", "xstyle")
  const sm = () => props.size === "sm"
  const attrs = () => stylex.attrs(peerMarker, styles.root, sm() ? styles.rootSm : styles.rootDefault, props.xstyle)
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={props.size ?? "default"}
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        {...stylex.attrs(styles.thumb, sm() ? styles.thumbSm : styles.thumbDefault)}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, type SwitchProps }
