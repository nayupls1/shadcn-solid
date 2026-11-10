import { createContext, omit, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { sxMerge } from "../lib/sx"
import { shimmerStyles } from "../lib/shimmer"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  type CollapsibleContentProps,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
} from "./collapsible"

// Port of shadcn/ui's base-vega `trace` (see the Tailwind variant for the source classes).
// `in-[a,button]:` and `[[data-slot=trace-title]~&]:` become `:is(a *, button *)` and
// `:is([data-slot=trace-title] ~ *)` conditions on the element itself; the running title's
// shimmer comes from the line's status via context. `Trace`'s `*:has-[>[data-slot=trace-line]]`
// rules style the links/buttons wrapping a line: apply `traceItemStyles.item` to them.

type TraceStatus = "running" | "error" | "pending"

const TraceLineContext = createContext<{ status: () => TraceStatus | undefined }>({ status: () => undefined })

const styles = stylex.create({
  trace: { display: "flex", width: "100%", minWidth: 0, flexDirection: "column", gap: "0.5rem" },
  line: {
    display: "flex",
    width: "fit-content",
    maxWidth: "100%",
    minWidth: 0,
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: { default: colors.mutedForeground, ":is(a:hover *, button:hover *)": colors.foreground },
    cursor: { default: null, ":is(a *, button *)": "pointer" },
    opacity: { default: null, ":is([data-status=pending])": 0.6 },
    transitionProperty: "color, background-color, border-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  lineError: { color: colors.destructive },
  icon: {
    display: "flex",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: { default: null, ":is([data-slot=trace-title] ~ *)": "-0.25rem" },
  },
  title: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  description: {
    flexShrink: 0,
    color: `color-mix(in oklch, ${colors.mutedForeground} 70%, transparent)`,
    fontVariantNumeric: "tabular-nums",
  },
  collapsible: { display: "flex", width: "100%", minWidth: 0, flexDirection: "column" },
  trigger: {
    display: "flex",
    width: "fit-content",
    maxWidth: "100%",
    minWidth: 0,
    cursor: "pointer",
    alignItems: "center",
    gap: "0.25rem",
    borderRadius: radius.md,
    borderWidth: 0,
    padding: 0,
    backgroundColor: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    textAlign: "left",
    color: {
      default: colors.mutedForeground,
      ":hover": colors.foreground,
      ":has([data-status=error])": colors.destructive,
    },
    transitionProperty: "color, background-color, border-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    boxShadow: { default: null, ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)` },
  },
  chevron: {
    transitionProperty: "transform",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transform: { default: null, ":is([aria-expanded=true] > *)": "rotate(90deg)" },
  },
  panel: {
    height: {
      default: "var(--collapsible-panel-height)",
      ":is([data-starting-style])": 0,
      ":is([data-ending-style])": 0,
    },
    minWidth: 0,
    overflow: "hidden",
    transitionProperty: "height",
    transitionDuration: "200ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  inner: {
    marginTop: "0.5rem",
    marginBottom: "0.25rem",
    marginLeft: "calc(0.5rem - 1px)",
    minWidth: 0,
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: colors.border,
    paddingRight: "0.25rem",
    paddingLeft: "1rem",
    lineHeight: 1.625,
    overflowWrap: "break-word",
    color: colors.mutedForeground,
  },
})

/** For links/buttons that wrap a `TraceLine` inside a `Trace` (Tailwind's `*:has-[>trace-line]`). */
const traceItemStyles = stylex.create({
  item: {
    display: "flex",
    width: "fit-content",
    maxWidth: "100%",
    minWidth: 0,
    borderRadius: radius.md,
    textAlign: "left",
    outline: "none",
    textDecorationLine: "none",
    color: "inherit",
    boxShadow: { default: null, ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)` },
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }
type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & XStyle
type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & XStyle

function Trace(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.trace, props.xstyle], props.class, props.style)
  return <div data-slot="trace" {...rest} class={a().class} style={a().style} />
}

type TraceLineProps = SpanProps & { status?: TraceStatus }

function TraceLine(props: TraceLineProps) {
  const rest = omit(props, "class", "style", "status", "xstyle")
  const a = () =>
    sxMerge([styles.line, props.status === "error" && styles.lineError, props.xstyle], props.class, props.style)
  return (
    <TraceLineContext value={{ status: () => props.status }}>
      <span data-slot="trace-line" data-status={props.status} {...rest} class={a().class} style={a().style} />
    </TraceLineContext>
  )
}

function TraceIcon(props: SpanProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.icon, props.xstyle], props.class, props.style)
  return <span data-slot="trace-icon" aria-hidden="true" {...rest} class={a().class} style={a().style} />
}

function TraceTitle(props: SpanProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const line = useContext(TraceLineContext)
  // `motion-reduce:shimmer-none` is part of `shimmerStyles.shimmer`'s reduced-motion media query.
  const a = () =>
    sxMerge([styles.title, line.status() === "running" && shimmerStyles.shimmer, props.xstyle], props.class, props.style)
  return <span data-slot="trace-title" {...rest} class={a().class} style={a().style} />
}

function TraceDescription(props: SpanProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.description, props.xstyle], props.class, props.style)
  return <span data-slot="trace-description" {...rest} class={a().class} style={a().style} />
}

type TraceCollapsibleProps = Omit<CollapsibleProps, "open"> &
  (
    | { open?: undefined }
    | { open: boolean; onOpenChange: NonNullable<CollapsibleProps["onOpenChange"]> }
  )

function TraceCollapsible(props: TraceCollapsibleProps) {
  const rest = omit(props, "xstyle")
  return <Collapsible data-slot="trace-collapsible" {...rest} xstyle={[styles.collapsible, props.xstyle]} />
}

function TraceCollapsibleTrigger(props: CollapsibleTriggerProps) {
  const rest = omit(props, "xstyle", "children")
  return (
    <CollapsibleTrigger data-slot="trace-collapsible-trigger" {...rest} xstyle={[styles.trigger, props.xstyle]}>
      {props.children}
      <TraceIcon xstyle={styles.chevron}>
        <Icon icon={ChevronRight} />
      </TraceIcon>
    </CollapsibleTrigger>
  )
}

function TraceCollapsibleContent(props: CollapsibleContentProps) {
  // Like shadcn: `class` (and `xstyle`) style the inner wrapper, other props go to the panel.
  const rest = omit(props, "class", "xstyle", "children")
  const a = () => sxMerge([styles.inner, props.xstyle], props.class)
  return (
    <CollapsibleContent data-slot="trace-collapsible-content" {...rest} xstyle={styles.panel}>
      <div data-slot="trace-collapsible-content-inner" class={a().class} style={a().style}>
        {props.children}
      </div>
    </CollapsibleContent>
  )
}

export {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
  traceItemStyles,
  type TraceLineProps,
  type TraceCollapsibleProps,
}
