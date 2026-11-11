import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { NavigationMenu as NavigationMenuPrimitive } from "base-ui-solidjs/navigation-menu"
import { ChevronDown } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { navigationMenuTriggerMarker } from "../lib/markers/navigation-menu.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `navigation-menu` (see the Tailwind variant for the source classes).
//
// Several of shadcn's classes compile to nothing or never match under Base UI, so they have no
// StyleX counterpart (the Tailwind variant keeps them verbatim):
// - `data-ending-style:data-activation-direction=left:translate-x-[50%]` (and the other three):
//   not valid Tailwind v4 syntax, so Tailwind generates no CSS for them.
// - `data-[motion=*]:*` and the indicator's `data-[state=*]:*`: Radix attributes Base UI doesn't set.
// - `group-data-[viewport=false]/navigation-menu:*`: Base UI's root has no `data-viewport`.
// - The positioner's `before:*` (no `position`, so it has no effect), the popup's
//   `xs:w-(--popup-width)` (no `xs` breakpoint) and `data-[ending-style]:easing-[ease]` (no such utility).
// `**:data-[slot=navigation-menu-link]:focus:ring-0` on the content becomes a condition on the link.

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const TW_EASE = "cubic-bezier(0.4, 0, 0.2, 1)"
const ring = `0 0 0 1px color-mix(in oklch, ${colors.foreground} 10%, transparent)`
const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const muted50 = `color-mix(in oklch, ${colors.muted} 50%, transparent)`

const styles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    maxWidth: "max-content",
    flex: "1 1 0%",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    display: "flex",
    flex: "1 1 0%",
    listStyleType: "none",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  item: {
    position: "relative",
  },
  trigger: {
    display: "inline-flex",
    height: "2.25rem",
    width: "max-content",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    paddingInline: "1rem",
    paddingBlock: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: TW_EASE,
    outlineStyle: "none",
    backgroundColor: {
      default: null,
      ":hover": colors.muted,
      ":focus:not([data-popup-open])": colors.muted,
      ":is([data-popup-open])": { default: muted50, ":hover": colors.muted },
    },
    boxShadow: { default: null, ":focus-visible": focusRing },
    pointerEvents: { default: null, ":disabled": "none" },
    opacity: { default: null, ":disabled": 0.5 },
  },
  chevron: {
    position: "relative",
    top: "1px",
    marginLeft: "0.25rem",
    width: "0.75rem",
    height: "0.75rem",
    transitionProperty: "color, background-color, border-color, opacity, box-shadow, transform, translate, scale, rotate",
    transitionDuration: "300ms",
    transitionTimingFunction: TW_EASE,
    rotate: {
      default: null,
      [stylex.when.ancestor(":is([data-popup-open])", navigationMenuTriggerMarker)]: "180deg",
    },
  },
  content: {
    height: "100%",
    width: "auto",
    paddingBlock: "0.5rem",
    paddingLeft: "0.5rem",
    paddingRight: "0.625rem",
    transitionProperty: "opacity, transform, translate",
    transitionDuration: "0.35s",
    transitionTimingFunction: EASE,
    opacity: {
      default: null,
      ":is([data-starting-style])": 0,
      ":is([data-ending-style])": 0,
    },
  },
  positioner: {
    isolation: "isolate",
    zIndex: 50,
    height: "var(--positioner-height)",
    width: "var(--positioner-width)",
    maxWidth: "var(--available-width)",
    transitionProperty: { default: "top, left, right, bottom", ":is([data-instant])": "none" },
    transitionDuration: "0.35s",
    transitionTimingFunction: EASE,
  },
  popup: {
    position: "relative",
    height: "var(--popup-height)",
    width: "var(--popup-width)",
    transformOrigin: "var(--transform-origin)",
    borderRadius: radius.lg,
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    boxShadow: `${ring}, 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`,
    transitionProperty: "opacity, transform, width, height, scale, translate",
    transitionDuration: { default: "0.35s", ":is([data-ending-style])": "150ms" },
    transitionTimingFunction: EASE,
    outlineStyle: "none",
    scale: {
      default: null,
      ":is([data-starting-style])": "90% 90%",
      ":is([data-ending-style])": "90% 90%",
    },
    opacity: {
      default: null,
      ":is([data-starting-style])": 0,
      ":is([data-ending-style])": 0,
    },
  },
  viewport: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    borderRadius: {
      default: radius.md,
      ":is([data-slot=navigation-menu-content] *)": radius.sm,
    },
    padding: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: TW_EASE,
    outlineStyle: "none",
    backgroundColor: {
      default: null,
      ":hover": colors.muted,
      ":focus": colors.muted,
      ":is([data-active=true])": { default: muted50, ":hover": colors.muted, ":focus": colors.muted },
    },
    boxShadow: {
      default: null,
      // `**:data-[slot=navigation-menu-link]:focus:ring-0` on the content: no ring inside it.
      ":focus-visible:not(:is([data-slot=navigation-menu-content] *))": focusRing,
    },
  },
  indicator: {
    top: "100%",
    zIndex: 1,
    display: "flex",
    height: "0.375rem",
    alignItems: "flex-end",
    justifyContent: "center",
    overflow: "hidden",
  },
  indicatorArrow: {
    position: "relative",
    top: "60%",
    height: "0.5rem",
    width: "0.5rem",
    rotate: "45deg",
    borderTopLeftRadius: radius.sm,
    backgroundColor: colors.border,
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type NavigationMenuProps = Omit<NavigationMenuPrimitive.Root.Props, "class"> &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align"> &
  XStyle

function NavigationMenu(props: NavigationMenuProps) {
  const rest = omit(props, "align", "class", "xstyle", "children")
  const attrs = () => stylex.attrs(styles.root, props.xstyle)
  return (
    <NavigationMenuPrimitive.Root data-slot="navigation-menu" {...rest} class={cx(attrs().class, props.class)}>
      {props.children}
      <NavigationMenuPositioner align={props.align ?? "start"} />
    </NavigationMenuPrimitive.Root>
  )
}

type NavigationMenuListProps = Omit<NavigationMenuPrimitive.List.Props, "class"> & XStyle

function NavigationMenuList(props: NavigationMenuListProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.list, props.xstyle)
  return <NavigationMenuPrimitive.List data-slot="navigation-menu-list" {...rest} class={cx(attrs().class, props.class)} />
}

type NavigationMenuItemProps = Omit<NavigationMenuPrimitive.Item.Props, "class"> & XStyle

function NavigationMenuItem(props: NavigationMenuItemProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.item, props.xstyle)
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" {...rest} class={cx(attrs().class, props.class)} />
}

/** The StyleX counterpart of shadcn's `navigationMenuTriggerStyle()` cva: pass it as `xstyle`. */
function navigationMenuTriggerStyle(): stylex.StyleXStyles {
  return styles.trigger
}

type NavigationMenuTriggerProps = Omit<NavigationMenuPrimitive.Trigger.Props, "class"> & XStyle

function NavigationMenuTrigger(props: NavigationMenuTriggerProps) {
  const rest = omit(props, "class", "xstyle", "children")
  const attrs = () => stylex.attrs(navigationMenuTriggerMarker, styles.trigger, props.xstyle)
  return (
    <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" {...rest} class={cx(attrs().class, props.class)}>
      {props.children}{" "}
      <Icon icon={ChevronDown} size={12} {...stylex.attrs(styles.chevron)} aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  )
}

type NavigationMenuContentProps = Omit<NavigationMenuPrimitive.Content.Props, "class"> & XStyle

function NavigationMenuContent(props: NavigationMenuContentProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.content, props.xstyle)
  return (
    <NavigationMenuPrimitive.Content data-slot="navigation-menu-content" {...rest} class={cx(attrs().class, props.class)} />
  )
}

type NavigationMenuPositionerProps = Omit<NavigationMenuPrimitive.Positioner.Props, "class"> & XStyle

function NavigationMenuPositioner(props: NavigationMenuPositionerProps) {
  const rest = omit(props, "class", "xstyle", "side", "sideOffset", "align", "alignOffset")
  const attrs = () => stylex.attrs(styles.positioner, props.xstyle)
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 8}
        align={props.align ?? "start"}
        alignOffset={props.alignOffset ?? 0}
        {...rest}
        class={cx(attrs().class, props.class)}
      >
        <NavigationMenuPrimitive.Popup class={stylex.attrs(styles.popup).class}>
          <NavigationMenuPrimitive.Viewport class={stylex.attrs(styles.viewport).class} />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

type NavigationMenuLinkProps = Omit<NavigationMenuPrimitive.Link.Props, "class"> & XStyle

function NavigationMenuLink(props: NavigationMenuLinkProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.link, props.xstyle)
  return <NavigationMenuPrimitive.Link data-slot="navigation-menu-link" {...rest} class={cx(attrs().class, props.class)} />
}

type NavigationMenuIndicatorProps = Omit<NavigationMenuPrimitive.Icon.Props, "class"> & XStyle

function NavigationMenuIndicator(props: NavigationMenuIndicatorProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.indicator, props.xstyle)
  return (
    <NavigationMenuPrimitive.Icon data-slot="navigation-menu-indicator" {...rest} class={cx(attrs().class, props.class)}>
      <div {...stylex.attrs(styles.indicatorArrow)} />
    </NavigationMenuPrimitive.Icon>
  )
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
}
