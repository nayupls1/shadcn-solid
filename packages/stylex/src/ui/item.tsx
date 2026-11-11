import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"
import { Separator, type SeparatorProps } from "./separator"

// Port of shadcn/ui's base-vega `item` (see the Tailwind variant for the source classes).
// `group-data-[size=*]/item:` and `group-has-*/item:` become `:is([data-slot=item]… *)`
// conditions on the part itself. Tailwind's child selectors (`[&_img]`, `[&>a]`) can't be expressed
// in StyleX: style images inside `ItemMedia variant="image"` and links inside `ItemDescription`
// yourself (`Icon` already defaults to the 16px of `[&_svg]:size-4`).
const styles = stylex.create({
  group: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    gap: {
      default: "1rem",
      ":has([data-size=sm])": "0.625rem",
      ":has([data-size=xs])": "0.5rem",
    },
  },
  separator: { marginBlock: "0.5rem" },
  item: {
    display: "flex",
    width: "100%",
    flexWrap: "wrap",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: { default: "transparent", ":focus-visible": colors.ring },
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: "inherit",
    textDecoration: "none",
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to",
    transitionDuration: "100ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
    },
    backgroundColor: { default: null, ":is(a):hover": colors.muted },
  },
  // variants
  default: {},
  outline: {
    borderColor: { default: colors.border, ":focus-visible": colors.ring },
  },
  muted: {
    backgroundColor: {
      default: `color-mix(in oklch, ${colors.muted} 50%, transparent)`,
      ":is(a):hover": colors.muted,
    },
  },
  // sizes
  sizeDefault: { gap: "0.875rem", paddingInline: "1rem", paddingBlock: "0.875rem" },
  sizeSm: { gap: "0.625rem", paddingInline: "0.75rem", paddingBlock: "0.625rem" },
  sizeXs: {
    gap: "0.5rem",
    paddingInline: { default: "0.625rem", ":is([data-slot=dropdown-menu-content] *)": 0 },
    paddingBlock: { default: "0.5rem", ":is([data-slot=dropdown-menu-content] *)": 0 },
  },
  media: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    translate: { default: null, ":is([data-slot=item]:has([data-slot=item-description]) *)": "0 0.125rem" },
    alignSelf: { default: null, ":is([data-slot=item]:has([data-slot=item-description]) *)": "flex-start" },
  },
  mediaDefault: { backgroundColor: "transparent" },
  mediaIcon: {},
  mediaImage: {
    width: {
      default: "2.5rem",
      ":is([data-slot=item][data-size=sm] *)": "2rem",
      ":is([data-slot=item][data-size=xs] *)": "1.5rem",
    },
    height: {
      default: "2.5rem",
      ":is([data-slot=item][data-size=sm] *)": "2rem",
      ":is([data-slot=item][data-size=xs] *)": "1.5rem",
    },
    overflow: "hidden",
    borderRadius: radius.sm,
  },
  content: {
    display: "flex",
    flexGrow: { default: 1, ":is([data-slot=item-content] + *)": 0 },
    flexShrink: { default: 1, ":is([data-slot=item-content] + *)": 0 },
    flexBasis: { default: "0%", ":is([data-slot=item-content] + *)": "auto" },
    flexDirection: "column",
    gap: { default: "0.25rem", ":is([data-slot=item][data-size=xs] *)": 0 },
  },
  title: {
    overflow: "hidden",
    display: "flex",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 1,
    width: "fit-content",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: 1.375,
    fontWeight: 500,
    textUnderlineOffset: "4px",
  },
  description: {
    overflow: "hidden",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    margin: 0,
    textAlign: "left",
    fontSize: { default: "0.875rem", ":is([data-slot=item][data-size=xs] *)": "0.75rem" },
    lineHeight: 1.5,
    fontWeight: 400,
    color: colors.mutedForeground,
  },
  actions: { display: "flex", alignItems: "center", gap: "0.5rem" },
  headerFooter: {
    display: "flex",
    flexBasis: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
})

const variantStyles = { default: styles.default, outline: styles.outline, muted: styles.muted }
const sizeStyles = { default: styles.sizeDefault, sm: styles.sizeSm, xs: styles.sizeXs }
const mediaVariantStyles = { default: styles.mediaDefault, icon: styles.mediaIcon, image: styles.mediaImage }

type ItemVariant = keyof typeof variantStyles
type ItemSize = keyof typeof sizeStyles
type ItemMediaVariant = keyof typeof mediaVariantStyles

function itemStyles(opts: { variant?: ItemVariant | null; size?: ItemSize | null } = {}) {
  return [styles.item, variantStyles[opts.variant ?? "default"], sizeStyles[opts.size ?? "default"]]
}

function itemMediaStyles(opts: { variant?: ItemMediaVariant | null } = {}) {
  return [styles.media, mediaVariantStyles[opts.variant ?? "default"]]
}

type XProps = {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}
type DivProps = Omit<JSX.IntrinsicElements["div"], "class"> & XProps

function ItemGroup(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div
      role="list"
      data-slot="item-group"
      {...rest}
      class={cx(stylex.attrs(styles.group, props.xstyle).class, props.class)}
    />
  )
}

function ItemSeparator(props: SeparatorProps) {
  const rest = omit(props, "xstyle")
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      {...rest}
      xstyle={[styles.separator, props.xstyle]}
    />
  )
}

type ItemProps = Omit<useRender.ComponentProps<"div">, "class"> &
  XProps & {
    variant?: ItemVariant | null
    size?: ItemSize | null
  }

function Item(props: ItemProps) {
  const rest = omit(props, "class", "variant", "size", "render", "children", "xstyle")
  return useRender({
    defaultTagName: "div",
    get props() {
      return mergeProps<Record<string, unknown>>(
        {
          class: cx(
            stylex.attrs(...itemStyles({ variant: props.variant, size: props.size }), props.xstyle).class,
            props.class,
          ),
        },
        rest,
      )
    },
    get render() {
      return props.render
    },
    // Passed on their own: `mergeProps` reads every getter, and reading `children` there would
    // create the child components inside the props memo.
    get children() {
      return props.children
    },
    state: () => ({
      slot: "item",
      variant: props.variant ?? "default",
      size: props.size ?? "default",
    }),
  })
}

type ItemMediaProps = DivProps & { variant?: ItemMediaVariant | null }

function ItemMedia(props: ItemMediaProps) {
  const rest = omit(props, "class", "variant", "xstyle")
  return (
    <div
      data-slot="item-media"
      data-variant={props.variant ?? "default"}
      {...rest}
      class={cx(stylex.attrs(...itemMediaStyles({ variant: props.variant }), props.xstyle).class, props.class)}
    />
  )
}

function ItemContent(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div data-slot="item-content" {...rest} class={cx(stylex.attrs(styles.content, props.xstyle).class, props.class)} />
  )
}

function ItemTitle(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div data-slot="item-title" {...rest} class={cx(stylex.attrs(styles.title, props.xstyle).class, props.class)} />
  )
}

type ItemDescriptionProps = Omit<JSX.IntrinsicElements["p"], "class"> & XProps

function ItemDescription(props: ItemDescriptionProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <p
      data-slot="item-description"
      {...rest}
      class={cx(stylex.attrs(styles.description, props.xstyle).class, props.class)}
    />
  )
}

function ItemActions(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div data-slot="item-actions" {...rest} class={cx(stylex.attrs(styles.actions, props.xstyle).class, props.class)} />
  )
}

function ItemHeader(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div
      data-slot="item-header"
      {...rest}
      class={cx(stylex.attrs(styles.headerFooter, props.xstyle).class, props.class)}
    />
  )
}

function ItemFooter(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <div
      data-slot="item-footer"
      {...rest}
      class={cx(stylex.attrs(styles.headerFooter, props.xstyle).class, props.class)}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
  itemStyles,
  itemMediaStyles,
  type ItemProps,
  type ItemMediaProps,
  type ItemVariant,
  type ItemSize,
  type ItemMediaVariant,
}
