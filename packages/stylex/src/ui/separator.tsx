import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Separator as SeparatorPrimitive } from "base-ui-solidjs/separator"
import { colors } from "../tokens.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `separator` (see the Tailwind variant for the source classes).
const styles = stylex.create({
  base: {
    flexShrink: 0,
    backgroundColor: colors.border,
  },
  horizontal: { height: "1px", width: "100%" },
  vertical: { width: "1px", alignSelf: "stretch" },
})

type SeparatorProps = Omit<SeparatorPrimitive.Props, "class"> & { class?: string; xstyle?: stylex.StyleXStyles }

function Separator(props: SeparatorProps) {
  const rest = omit(props, "class", "xstyle", "orientation")
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={props.orientation ?? "horizontal"}
      {...rest}
      class={(state) =>
        cx(
          stylex.attrs(
            styles.base,
            state.orientation === "vertical" ? styles.vertical : styles.horizontal,
            props.xstyle,
          ).class,
          props.class,
        )
      }
    />
  )
}

export { Separator, type SeparatorProps }
