import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `empty` (see the Tailwind variant for the source classes).
// Child selectors can't be expressed in StyleX: give icons in `EmptyMedia variant="icon"`
// `size={24}` (`[&_svg]:size-6`) and style links inside `EmptyDescription` yourself.
const styles = stylex.create({
  empty: {
    display: "flex",
    width: "100%",
    minWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    borderRadius: radius.lg,
    borderStyle: "dashed",
    padding: "3rem",
    textAlign: "center",
    textWrap: "balance",
  },
  header: {
    display: "flex",
    maxWidth: "24rem",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
  },
  media: {
    marginBottom: "0.5rem",
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaDefault: { backgroundColor: "transparent" },
  mediaIcon: {
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    color: colors.foreground,
  },
  title: {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    fontWeight: 500,
    letterSpacing: "-0.025em",
  },
  description: {
    fontSize: "0.875rem",
    lineHeight: 1.625,
    color: colors.mutedForeground,
  },
  content: {
    display: "flex",
    width: "100%",
    maxWidth: "24rem",
    minWidth: 0,
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    textWrap: "balance",
  },
})

const mediaVariantStyles = { default: styles.mediaDefault, icon: styles.mediaIcon }
type EmptyMediaVariant = keyof typeof mediaVariantStyles

function emptyMediaStyles(opts: { variant?: EmptyMediaVariant | null } = {}) {
  return [styles.media, mediaVariantStyles[opts.variant ?? "default"]]
}

type XProps = {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}
type DivProps = Omit<JSX.IntrinsicElements["div"], "class"> & XProps

function Empty(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return <div data-slot="empty" {...rest} class={cx(stylex.attrs(styles.empty, props.xstyle).class, props.class)} />
}

function EmptyHeader(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div data-slot="empty-header" {...rest} class={cx(stylex.attrs(styles.header, props.xstyle).class, props.class)} />
  )
}

type EmptyMediaProps = DivProps & { variant?: EmptyMediaVariant | null }

function EmptyMedia(props: EmptyMediaProps) {
  const rest = omit(props, "class", "variant", "xstyle")
  return (
    <div
      data-slot="empty-icon"
      data-variant={props.variant ?? "default"}
      {...rest}
      class={cx(stylex.attrs(...emptyMediaStyles({ variant: props.variant }), props.xstyle).class, props.class)}
    />
  )
}

function EmptyTitle(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div data-slot="empty-title" {...rest} class={cx(stylex.attrs(styles.title, props.xstyle).class, props.class)} />
  )
}

type EmptyDescriptionProps = Omit<JSX.IntrinsicElements["p"], "class"> & XProps

function EmptyDescription(props: EmptyDescriptionProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div
      data-slot="empty-description"
      {...(rest as JSX.IntrinsicElements["div"])}
      class={cx(stylex.attrs(styles.description, props.xstyle).class, props.class)}
    />
  )
}

function EmptyContent(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div
      data-slot="empty-content"
      {...rest}
      class={cx(stylex.attrs(styles.content, props.xstyle).class, props.class)}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  emptyMediaStyles,
  type EmptyMediaProps,
  type EmptyMediaVariant,
}
