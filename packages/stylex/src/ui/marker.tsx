import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { colors } from "../tokens.stylex"
import { markerMarker } from "../lib/markers.stylex"
import { sxMerge } from "../lib/sx"
import { renderProps } from "@shadcn-solid/primitives/render-props"

// Port of shadcn/ui's base-vega `marker` (see the Tailwind variant for the source classes).
// `group/marker` is a named marker. `[a]:` (the marker rendered as a link) is an `:is(a)` condition;
// links nested inside `MarkerContent` (`*:[a]:underline`) need their own styles in StyleX.

const separatorLine = {
  content: "''",
  height: "1px",
  minWidth: 0,
  flex: "1 1 0%",
  backgroundColor: colors.border,
} as const

const styles = stylex.create({
  marker: {
    position: "relative",
    display: "flex",
    minHeight: "1rem",
    width: "100%",
    alignItems: "center",
    gap: "0.5rem",
    textAlign: "left",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: { default: colors.mutedForeground, ":is(a):hover": colors.foreground },
    textDecorationLine: { default: null, ":is(a)": "underline" },
    textUnderlineOffset: { default: null, ":is(a)": "3px" },
  },
  separator: {
    "::before": { ...separatorLine, marginRight: "0.25rem" },
    "::after": { ...separatorLine, marginLeft: "0.25rem" },
  },
  border: {
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    paddingBottom: "0.5rem",
  },
  icon: { width: "1rem", height: "1rem", flexShrink: 0 },
  content: {
    minWidth: 0,
    overflowWrap: "break-word",
    flex: { default: null, [stylex.when.ancestor("[data-variant=separator]", markerMarker)]: "none" },
    textAlign: { default: null, [stylex.when.ancestor("[data-variant=separator]", markerMarker)]: "center" },
  },
})

type MarkerVariant = "default" | "separator" | "border"

type MarkerProps = Omit<useRender.ComponentProps<"div">, "class"> & {
  variant?: MarkerVariant | null
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

/** The marker's styles for a variant, for custom elements. */
function markerStyles(variant: MarkerVariant = "default") {
  return [markerMarker, styles.marker, variant === "separator" && styles.separator, variant === "border" && styles.border]
}

function Marker(props: MarkerProps) {
  const rest = omit(props, "class", "style", "variant", "render", "children", "xstyle")
  return useRender({
    defaultTagName: "div",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    state: () => ({ slot: "marker", variant: props.variant ?? "default" }),
    props: renderProps(() => {
      const a = sxMerge([...markerStyles(props.variant ?? "default"), props.xstyle], props.class, props.style)
      return mergeProps<Record<string, unknown>>({ class: a.class, style: a.style }, rest)
    }),
  })
}

type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & {
  class?: string
  xstyle?: stylex.StyleXStyles
}

function MarkerIcon(props: SpanProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.icon, props.xstyle], props.class, props.style)
  return <span data-slot="marker-icon" aria-hidden="true" {...rest} class={a().class} style={a().style} />
}

function MarkerContent(props: SpanProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.content, props.xstyle], props.class, props.style)
  return <span data-slot="marker-content" {...rest} class={a().class} style={a().style} />
}

export { Marker, MarkerIcon, MarkerContent, markerStyles, type MarkerProps, type MarkerVariant }
