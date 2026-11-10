import { createContext, omit, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors } from "../tokens.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `table` (see the Tailwind variant for the source classes).
// The section rules that target rows (`[&_tr:last-child]:border-0` on the body,
// `[&>tr]:last:border-b-0` on the footer) are applied by the row, which reads its section from context.
type Section = "header" | "body" | "footer" | undefined
const SectionContext = createContext<Section>(undefined)

const styles = stylex.create({
  container: { position: "relative", width: "100%", overflowX: "auto" },
  table: {
    width: "100%",
    captionSide: "bottom",
    borderCollapse: "collapse",
    textIndent: 0,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  footer: {
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: colors.border,
    backgroundColor: `color-mix(in oklch, ${colors.muted} 50%, transparent)`,
    fontWeight: 500,
  },
  row: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: {
      default: null,
      ":hover": `color-mix(in oklch, ${colors.muted} 50%, transparent)`,
      ":has([aria-expanded=true])": `color-mix(in oklch, ${colors.muted} 50%, transparent)`,
      ":is([data-state=selected])": colors.muted,
    },
  },
  lastRowBorderless: {
    borderBottomWidth: { default: "1px", ":last-child": 0 },
  },
  head: {
    height: "2.5rem",
    paddingInline: "0.5rem",
    paddingRight: { default: "0.5rem", ":has([role=checkbox])": 0 },
    textAlign: "left",
    verticalAlign: "middle",
    fontWeight: 500,
    whiteSpace: "nowrap",
    color: colors.foreground,
  },
  cell: {
    padding: "0.5rem",
    paddingRight: { default: "0.5rem", ":has([role=checkbox])": 0 },
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  caption: {
    marginTop: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.mutedForeground,
  },
})

type XStyle = {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}
type Props<T extends keyof JSX.IntrinsicElements> = Omit<JSX.IntrinsicElements[T], "class"> & XStyle

function Table(props: Props<"table">) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div data-slot="table-container" {...stylex.attrs(styles.container)}>
      <table data-slot="table" {...rest} class={cx(stylex.attrs(styles.table, props.xstyle).class, props.class)} />
    </div>
  )
}

function TableHeader(props: Props<"thead">) {
  const rest = omit(props, "class", "xstyle")
  return (
    <SectionContext value="header">
      <thead data-slot="table-header" {...rest} class={cx(stylex.attrs(props.xstyle).class, props.class)} />
    </SectionContext>
  )
}

function TableBody(props: Props<"tbody">) {
  const rest = omit(props, "class", "xstyle")
  return (
    <SectionContext value="body">
      <tbody data-slot="table-body" {...rest} class={cx(stylex.attrs(props.xstyle).class, props.class)} />
    </SectionContext>
  )
}

function TableFooter(props: Props<"tfoot">) {
  const rest = omit(props, "class", "xstyle")
  return (
    <SectionContext value="footer">
      <tfoot data-slot="table-footer" {...rest} class={cx(stylex.attrs(styles.footer, props.xstyle).class, props.class)} />
    </SectionContext>
  )
}

function rowStyles(section: Section) {
  return [styles.row, (section === "body" || section === "footer") && styles.lastRowBorderless]
}

function TableRow(props: Props<"tr">) {
  const rest = omit(props, "class", "xstyle")
  const section = useContext(SectionContext)
  return <tr data-slot="table-row" {...rest} class={cx(stylex.attrs(...rowStyles(section), props.xstyle).class, props.class)} />
}

function TableHead(props: Props<"th">) {
  const rest = omit(props, "class", "xstyle")
  return <th data-slot="table-head" {...rest} class={cx(stylex.attrs(styles.head, props.xstyle).class, props.class)} />
}

function TableCell(props: Props<"td">) {
  const rest = omit(props, "class", "xstyle")
  return <td data-slot="table-cell" {...rest} class={cx(stylex.attrs(styles.cell, props.xstyle).class, props.class)} />
}

function TableCaption(props: Props<"caption">) {
  const rest = omit(props, "class", "xstyle")
  return (
    <caption data-slot="table-caption" {...rest} class={cx(stylex.attrs(styles.caption, props.xstyle).class, props.class)} />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
