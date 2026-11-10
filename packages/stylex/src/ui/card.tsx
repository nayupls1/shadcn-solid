import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "../tokens.stylex"
import { sxMerge } from "../lib/sx"

// Port of shadcn/ui's base-vega `card` (see the Tailwind variant for the source classes).
// `--card-spacing` is a plain custom property, as in shadcn. Rules that target the card's children
// (`*:[img:first-child]:rounded-t-xl`, `[.border-b]:pb-*`) have no StyleX equivalent: round images
// and pad bordered headers/footers with `xstyle`.

const styles = stylex.create({
  card: {
    "--card-spacing": { default: "1.5rem", ":is([data-size=sm])": "1rem" },
    display: "flex",
    flexDirection: "column",
    gap: "var(--card-spacing)",
    overflow: "hidden",
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    paddingBlock: "var(--card-spacing)",
    paddingTop: { default: "var(--card-spacing)", ":has(> img:first-child)": 0 },
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.cardForeground,
    boxShadow: `0 0 0 1px color-mix(in oklch, ${colors.foreground} 10%, transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05)`,
  },
  header: {
    containerType: "inline-size",
    containerName: "card-header",
    display: "grid",
    gridAutoRows: "min-content",
    gridTemplateColumns: { default: null, ":has([data-slot=card-action])": "1fr auto" },
    gridTemplateRows: { default: null, ":has([data-slot=card-description])": "auto auto" },
    alignItems: "start",
    gap: "0.25rem",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingInline: "var(--card-spacing)",
  },
  title: {
    fontSize: {
      default: "1rem",
      [stylex.when.ancestor("[data-size=sm]")]: "0.875rem",
    },
    lineHeight: {
      default: 1.5,
      [stylex.when.ancestor("[data-size=sm]")]: "1.25rem",
    },
    fontWeight: 500,
  },
  description: { fontSize: "0.875rem", lineHeight: "1.25rem", color: colors.mutedForeground },
  action: {
    gridColumnStart: "2",
    gridRow: "span 2 / span 2",
    gridRowStart: "1",
    alignSelf: "start",
    justifySelf: "end",
  },
  content: { display: "flex", flexDirection: "column", gap: "0.75rem", paddingInline: "var(--card-spacing)" },
  footer: {
    display: "flex",
    alignItems: "center",
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingInline: "var(--card-spacing)",
  },
})

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function part(slot: string, style: stylex.StyleXStyles) {
  return function CardPart(props: DivProps) {
    const rest = omit(props, "class", "style", "xstyle")
    const a = () => sxMerge([style, props.xstyle], props.class, props.style)
    return <div data-slot={slot} {...rest} class={a().class} style={a().style} />
  }
}

function Card(props: DivProps & { size?: "default" | "sm" }) {
  const rest = omit(props, "class", "style", "xstyle", "size")
  const a = () => sxMerge([stylex.defaultMarker(), styles.card, props.xstyle], props.class, props.style)
  return <div data-slot="card" data-size={props.size ?? "default"} {...rest} class={a().class} style={a().style} />
}

const CardHeader = part("card-header", styles.header)
const CardTitle = part("card-title", styles.title)
const CardDescription = part("card-description", styles.description)
const CardAction = part("card-action", styles.action)
const CardContent = part("card-content", styles.content)
const CardFooter = part("card-footer", styles.footer)

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
