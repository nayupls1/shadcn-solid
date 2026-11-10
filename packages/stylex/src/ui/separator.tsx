import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Separator as SeparatorPrimitive } from "base-ui-solidjs/separator"
import { colors } from "../tokens.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"

// Port of shadcn/ui's base-vega `separator`.
const styles = stylex.create({
  base: { flexShrink: 0, backgroundColor: colors.border },
  horizontal: { height: "1px", width: "100%" },
  vertical: { width: "1px", alignSelf: "stretch" },
})

type SeparatorProps = Omit<SeparatorPrimitive.Props, "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function Separator(props: SeparatorProps) {
  const rest = omit(props, "class", "style", "orientation", "xstyle")
  const vertical = () => props.orientation === "vertical"
  const attrs = () =>
    stylex.attrs(styles.base, vertical() ? styles.vertical : styles.horizontal, props.xstyle)
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={props.orientation ?? "horizontal"}
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

export { Separator, type SeparatorProps }
