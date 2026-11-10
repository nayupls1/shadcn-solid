import { createContext, omit, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { colors, radius } from "../tokens.stylex"
import { bubbleMarker, messageMarker } from "../lib/markers.stylex"
import { sxMerge } from "../lib/sx"

// Port of shadcn/ui's base-vega `bubble` (see the Tailwind variant for the source classes).
// The variants style the `bubble-content` child (`*:data-[slot=bubble-content]:…`), which StyleX
// can't target, so `Bubble` passes its variant down by context and `BubbleContent` applies it.
// `group-data-[align=end]/message` and `/bubble` are named-marker ancestor conditions.

type BubbleVariant = "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive"

const BubbleContext = createContext<{ variant: () => BubbleVariant } | undefined>(undefined)


const styles = stylex.create({
  group: { display: "flex", minWidth: 0, flexDirection: "column", gap: "0.5rem" },
  bubble: {
    position: "relative",
    display: "flex",
    width: "fit-content",
    maxWidth: { default: "80%", ":is([data-variant=ghost])": "100%" },
    minWidth: 0,
    flexDirection: "column",
    gap: "0.25rem",
    alignSelf: { default: null, [stylex.when.ancestor("[data-align=end]", messageMarker)]: "flex-end", ":is([data-align=end])": "flex-end" },
  },
  ghostBubble: { borderStyle: "none" },
  content: {
    width: "fit-content",
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: "transparent", ":is(button,a):focus-visible": colors.ring },
    paddingInline: "0.75rem",
    paddingBlock: "0.5rem",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    lineHeight: 1.625,
    overflowWrap: "break-word",
    alignSelf: { default: null, [stylex.when.ancestor("[data-align=end]", bubbleMarker)]: "flex-end" },
    textAlign: { default: null, ":is(button)": "left" },
    color: "inherit",
    textDecorationLine: "none",
    transitionProperty: { default: null, ":is(button,a)": "color, background-color, border-color" },
    transitionDuration: { default: null, ":is(button,a)": "150ms" },
    transitionTimingFunction: { default: null, ":is(button,a)": "cubic-bezier(0.4, 0, 0.2, 1)" },
    outline: { default: null, ":is(button,a)": "none" },
    boxShadow: { default: null, ":is(button,a):focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)` },
    cursor: { default: null, ":is(button,a)": "pointer" },
  },
  default: {
    backgroundColor: { default: colors.primary, ":is(button,a):hover": `color-mix(in oklch, ${colors.primary} 80%, transparent)` },
    color: colors.primaryForeground,
  },
  secondary: {
    backgroundColor: {
      default: colors.secondary,
      ":is(button,a):hover": `color-mix(in oklch, ${colors.secondary}, ${colors.foreground} 5%)`,
    },
    color: colors.secondaryForeground,
  },
  muted: {
    backgroundColor: {
      default: colors.muted,
      ":is(button,a):hover": `color-mix(in oklch, ${colors.muted}, ${colors.foreground} 5%)`,
    },
  },
  tinted: {
    backgroundColor: {
      default: `light-dark(oklch(from ${colors.primary} 0.93 calc(c * 0.4) h), oklch(from ${colors.primary} 0.3 calc(c * 0.4) h))`,
      ":is(button,a):hover": `light-dark(oklch(from ${colors.primary} 0.88 calc(c * 0.5) h), oklch(from ${colors.primary} 0.35 calc(c * 0.5) h))`,
    },
    color: colors.foreground,
  },
  outline: {
    borderColor: { default: colors.border, ":is(button,a):focus-visible": colors.ring },
    backgroundColor: {
      default: colors.background,
      ":is(button,a):hover": `light-dark(${colors.muted}, color-mix(in oklch, ${colors.input} 30%, transparent))`,
    },
    color: { default: null, ":is(button,a):hover": colors.foreground },
  },
  ghost: {
    borderRadius: 0,
    backgroundColor: {
      default: "transparent",
      ":is(button,a):hover": `light-dark(${colors.muted}, color-mix(in oklch, ${colors.muted} 50%, transparent))`,
    },
    color: { default: null, ":is(button,a):hover": colors.foreground },
    padding: 0,
  },
  destructive: {
    backgroundColor: {
      default: `light-dark(color-mix(in oklch, ${colors.destructive} 10%, transparent), color-mix(in oklch, ${colors.destructive} 20%, transparent))`,
      ":is(button,a):hover": `light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 30%, transparent))`,
    },
    color: colors.destructive,
  },
  reactions: {
    position: "absolute",
    zIndex: 10,
    display: "flex",
    width: "fit-content",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    borderRadius: "9999px",
    backgroundColor: colors.muted,
    paddingInline: { default: "0.375rem", ":has(button)": 0 },
    paddingBlock: { default: "0.125rem", ":has(button)": 0 },
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    boxShadow: `0 0 0 3px ${colors.card}`,
  },
  top: { top: 0, transform: "translateY(-75%)" },
  bottom: { bottom: 0, transform: "translateY(75%)" },
  start: { left: "0.75rem" },
  end: { right: "0.75rem" },
})

const variantStyles = {
  default: styles.default,
  secondary: styles.secondary,
  muted: styles.muted,
  tinted: styles.tinted,
  outline: styles.outline,
  ghost: styles.ghost,
  destructive: styles.destructive,
}

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }
type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & XStyle

function BubbleGroup(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.group, props.xstyle], props.class, props.style)
  return <div data-slot="bubble-group" {...rest} class={a().class} style={a().style} />
}

type BubbleProps = DivProps & { variant?: BubbleVariant | null; align?: "start" | "end" }

function Bubble(props: BubbleProps) {
  const rest = omit(props, "class", "style", "variant", "align", "xstyle")
  const variant = () => props.variant ?? "default"
  const a = () =>
    sxMerge(
      [bubbleMarker, styles.bubble, variant() === "ghost" && styles.ghostBubble, props.xstyle],
      props.class,
      props.style,
    )
  return (
    <BubbleContext value={{ variant }}>
      <div
        data-slot="bubble"
        data-variant={variant()}
        data-align={props.align ?? "start"}
        {...rest}
        class={a().class}
        style={a().style}
      />
    </BubbleContext>
  )
}

type BubbleContentProps = Omit<useRender.ComponentProps<"div">, "class"> & XStyle

function BubbleContent(props: BubbleContentProps) {
  const rest = omit(props, "class", "style", "render", "children", "xstyle")
  const bubble = useContext(BubbleContext)
  return useRender({
    defaultTagName: "div",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    state: { slot: "bubble-content" },
    get props() {
      const a = sxMerge(
        [styles.content, bubble && variantStyles[bubble.variant()], props.xstyle],
        props.class,
        props.style,
      )
      return mergeProps<Record<string, unknown>>({ class: a.class, style: a.style }, rest)
    },
  })
}

type BubbleReactionsProps = DivProps & { align?: "start" | "end"; side?: "top" | "bottom" }

function BubbleReactions(props: BubbleReactionsProps) {
  const rest = omit(props, "class", "style", "side", "align", "xstyle")
  const a = () =>
    sxMerge(
      [
        styles.reactions,
        (props.side ?? "bottom") === "top" ? styles.top : styles.bottom,
        (props.align ?? "end") === "start" ? styles.start : styles.end,
        props.xstyle,
      ],
      props.class,
      props.style,
    )
  return (
    <div
      data-slot="bubble-reactions"
      data-align={props.align ?? "end"}
      data-side={props.side ?? "bottom"}
      {...rest}
      class={a().class}
      style={a().style}
    />
  )
}

export {
  BubbleGroup,
  Bubble,
  BubbleContent,
  BubbleReactions,
  type BubbleProps,
  type BubbleContentProps,
  type BubbleReactionsProps,
  type BubbleVariant,
}
