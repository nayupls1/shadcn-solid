import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { ScrollArea as ScrollAreaPrimitive } from "base-ui-solidjs/scroll-area"
import { colors } from "../tokens.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `scroll-area` (see the Tailwind variant for the source classes).
const styles = stylex.create({
  root: { position: "relative" },
  viewport: {
    width: "100%",
    height: "100%",
    borderRadius: "inherit",
    transitionProperty: "color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outlineStyle: "none",
    outlineWidth: { default: null, ":focus-visible": "1px" },
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
    },
  },
  scrollbar: {
    display: "flex",
    touchAction: "none",
    padding: "1px",
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none",
  },
  horizontal: {
    height: "0.625rem",
    flexDirection: "column",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "transparent",
  },
  vertical: {
    height: "100%",
    width: "0.625rem",
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    borderLeftColor: "transparent",
  },
  thumb: {
    position: "relative",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    borderRadius: "9999px",
    backgroundColor: colors.border,
  },
})

type XProps = {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

type ScrollAreaProps = Omit<ScrollAreaPrimitive.Root.Props, "class"> & XProps

function ScrollArea(props: ScrollAreaProps) {
  const rest = omit(props, "class", "children", "xstyle")
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      {...rest}
      class={cx(stylex.attrs(styles.root, props.xstyle).class, props.class)}
    >
      <ScrollAreaPrimitive.Viewport data-slot="scroll-area-viewport" {...stylex.attrs(styles.viewport)}>
        {props.children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

type ScrollBarProps = Omit<ScrollAreaPrimitive.Scrollbar.Props, "class"> & XProps

function scrollBarStyles(orientation: "vertical" | "horizontal") {
  return [styles.scrollbar, orientation === "horizontal" ? styles.horizontal : styles.vertical]
}

function ScrollBar(props: ScrollBarProps) {
  const rest = omit(props, "class", "orientation", "xstyle")
  const orientation = () => props.orientation ?? "vertical"
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation()}
      orientation={orientation()}
      {...rest}
      class={cx(stylex.attrs(...scrollBarStyles(orientation()), props.xstyle).class, props.class)}
    >
      <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" {...stylex.attrs(styles.thumb)} />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar, type ScrollAreaProps, type ScrollBarProps }
