import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { PreviewCard as PreviewCardPrimitive } from "base-ui-solidjs/preview-card"
import { colors, radius } from "../tokens.stylex"
import { animate } from "../lib/animate"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `hover-card` (see the Tailwind variant for the source classes).
const styles = stylex.create({
  positioner: {
    isolation: "isolate",
    zIndex: 50,
  },
  content: {
    zIndex: 50,
    width: "16rem",
    transformOrigin: "var(--transform-origin)",
    borderRadius: radius.lg,
    backgroundColor: colors.popover,
    padding: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.popoverForeground,
    boxShadow: `0 0 0 1px color-mix(in oklch, ${colors.foreground} 10%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`,
    outline: "2px solid transparent",
    outlineOffset: "2px",
    transitionDuration: "100ms",
    animationDuration: "100ms",
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

function HoverCard(props: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger(props: PreviewCardPrimitive.Trigger.Props) {
  return <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

type HoverCardContentProps = Omit<PreviewCardPrimitive.Popup.Props, "class"> &
  Pick<PreviewCardPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  XStyle

function HoverCardContent(props: HoverCardContentProps) {
  const rest = omit(props, "class", "xstyle", "side", "sideOffset", "align", "alignOffset")
  const attrs = () =>
    stylex.attrs(
      animate.openClosed,
      animate.fadeIn0,
      animate.fadeOut0,
      animate.zoomIn95,
      animate.zoomOut95,
      animate.slideInFromSide2,
      styles.content,
      props.xstyle,
    )
  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
      <PreviewCardPrimitive.Positioner
        align={props.align ?? "center"}
        alignOffset={props.alignOffset ?? 4}
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 4}
        class={stylex.attrs(styles.positioner).class}
      >
        <PreviewCardPrimitive.Popup data-slot="hover-card-content" {...rest} class={cx(attrs().class, props.class)} />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
