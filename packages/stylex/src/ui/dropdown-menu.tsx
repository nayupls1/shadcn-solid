import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { Menu as MenuPrimitive } from "base-ui-solidjs/menu"
import { Check, ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `dropdown-menu` (see the Tailwind variant for the source classes).
// tw-animate-css's `animate-in fade-in-0 zoom-in-95 slide-in-from-*-2` / `animate-out fade-out-0
// zoom-out-95` become one keyframe per side, keyed on Base UI's `data-open`/`data-closed`/`data-side`.
const enterFromTop = stylex.keyframes({
  from: { opacity: 0, transform: "translate3d(0, -0.5rem, 0) scale3d(0.95, 0.95, 0.95)" },
})
const enterFromBottom = stylex.keyframes({
  from: { opacity: 0, transform: "translate3d(0, 0.5rem, 0) scale3d(0.95, 0.95, 0.95)" },
})
const enterFromLeft = stylex.keyframes({
  from: { opacity: 0, transform: "translate3d(-0.5rem, 0, 0) scale3d(0.95, 0.95, 0.95)" },
})
const enterFromRight = stylex.keyframes({
  from: { opacity: 0, transform: "translate3d(0.5rem, 0, 0) scale3d(0.95, 0.95, 0.95)" },
})
const exit = stylex.keyframes({
  to: { opacity: 0, transform: "scale3d(0.95, 0.95, 0.95)" },
})

const styles = stylex.create({
  positioner: { isolation: "isolate", zIndex: 50, outline: "none" },
  content: {
    zIndex: 50,
    maxHeight: "var(--available-height)",
    width: "var(--anchor-width)",
    minWidth: "8rem",
    transformOrigin: "var(--transform-origin)",
    overflowX: "hidden",
    overflowY: { default: "auto", ":is([data-closed])": "hidden" },
    borderRadius: radius.md,
    backgroundColor: colors.popover,
    padding: "0.25rem",
    color: colors.popoverForeground,
    // `ring-1 ring-foreground/10` + `shadow-md`
    boxShadow: `0 0 0 1px color-mix(in oklch, ${colors.foreground} 10%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`,
    outline: "none",
    // Portaled to <body>: carry Tailwind's default sans stack like the rest of the page.
    fontFamily:
      'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    animationName: {
      default: null,
      ":is([data-open][data-side=bottom])": enterFromTop,
      ":is([data-open][data-side=top])": enterFromBottom,
      ":is([data-open][data-side=left])": enterFromRight,
      ":is([data-open][data-side=inline-start])": enterFromRight,
      ":is([data-open][data-side=right])": enterFromLeft,
      ":is([data-open][data-side=inline-end])": enterFromLeft,
      ":is([data-closed])": exit,
    },
    animationDuration: "100ms",
    animationTimingFunction: "ease",
    transitionDuration: "100ms",
  },
  subContent: {
    width: "auto",
    minWidth: "96px",
    // `ring-1 ring-foreground/10` + `shadow-lg`
    boxShadow: `0 0 0 1px color-mix(in oklch, ${colors.foreground} 10%, transparent), 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`,
  },
  label: {
    paddingLeft: { default: "0.5rem", ":is([data-inset])": "2rem" },
    paddingRight: "0.5rem",
    paddingBlock: "0.375rem",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    color: colors.mutedForeground,
  },
  item: {
    position: "relative",
    display: "flex",
    cursor: "default",
    alignItems: "center",
    gap: "0.5rem",
    borderRadius: radius.sm,
    paddingLeft: { default: "0.5rem", ":is([data-inset])": "2rem" },
    paddingRight: "0.5rem",
    paddingBlock: "0.375rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    outlineStyle: "none",
    userSelect: "none",
    backgroundColor: { default: null, ":focus": colors.accent },
    color: { default: null, ":focus": colors.accentForeground },
    pointerEvents: { default: null, ":is([data-disabled]:not([data-disabled=false]))": "none" },
    opacity: { default: null, ":is([data-disabled]:not([data-disabled=false]))": 0.5 },
  },
  destructive: {
    color: colors.destructive,
    backgroundColor: {
      default: null,
      ":focus": `light-dark(color-mix(in oklch, ${colors.destructive} 10%, transparent), color-mix(in oklch, ${colors.destructive} 20%, transparent))`,
    },
  },
  subTrigger: {
    backgroundColor: {
      default: null,
      ":focus": colors.accent,
      ":is([data-popup-open])": colors.accent,
      ":is([data-open]:not([data-open=false]))": colors.accent,
    },
    color: {
      default: null,
      ":focus": colors.accentForeground,
      ":is([data-popup-open])": colors.accentForeground,
      ":is([data-open]:not([data-open=false]))": colors.accentForeground,
    },
  },
  chevron: {
    marginLeft: "auto",
    flexShrink: 0,
    transform: { default: null, ":dir(rtl)": "rotate(180deg)" },
  },
  // `py-1.5 pr-8 pl-2`
  indicatorItem: {
    paddingRight: "2rem",
  },
  indicator: {
    pointerEvents: "none",
    position: "absolute",
    right: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    marginInline: "-0.25rem",
    marginBlock: "0.25rem",
    height: "1px",
    backgroundColor: colors.border,
  },
  shortcut: {
    marginLeft: "auto",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    letterSpacing: "0.1em",
    color: {
      default: colors.mutedForeground,
      // `group-focus/dropdown-menu-item:text-accent-foreground`
      [stylex.when.ancestor(":focus")]: colors.accentForeground,
    },
  },
})

type XStyle = {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

type DropdownMenuContentProps = Omit<MenuPrimitive.Popup.Props, "class"> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  XStyle

function DropdownMenuContent(props: DropdownMenuContentProps) {
  const rest = omit(props, "align", "alignOffset", "side", "sideOffset", "class", "xstyle")
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        {...stylex.attrs(styles.positioner)}
        align={props.align ?? "start"}
        alignOffset={props.alignOffset ?? 0}
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 4}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          {...rest}
          class={cx(stylex.attrs(styles.content, props.xstyle).class, props.class)}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

type DropdownMenuLabelProps = Omit<MenuPrimitive.GroupLabel.Props, "class"> & XStyle & { inset?: boolean }

function DropdownMenuLabel(props: DropdownMenuLabelProps) {
  const rest = omit(props, "class", "inset", "xstyle")
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={props.inset}
      {...rest}
      class={cx(stylex.attrs(styles.label, props.xstyle).class, props.class)}
    />
  )
}

type DropdownMenuItemProps = Omit<MenuPrimitive.Item.Props, "class"> &
  XStyle & {
    inset?: boolean
    variant?: "default" | "destructive"
  }

/** Tailwind's `[&_svg]:size-4` is `Icon`'s default size. */
function DropdownMenuItem(props: DropdownMenuItemProps) {
  const rest = omit(props, "class", "inset", "variant", "xstyle")
  const isDestructive = () => props.variant === "destructive"
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={props.inset}
      data-variant={props.variant ?? "default"}
      {...rest}
      class={cx(
        stylex.attrs(stylex.defaultMarker(), styles.item, isDestructive() && styles.destructive, props.xstyle).class,
        props.class,
      )}
    />
  )
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

type DropdownMenuSubTriggerProps = Omit<MenuPrimitive.SubmenuTrigger.Props, "class"> & XStyle & { inset?: boolean }

function DropdownMenuSubTrigger(props: DropdownMenuSubTriggerProps) {
  const rest = omit(props, "class", "inset", "children", "xstyle")
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={props.inset}
      {...rest}
      class={cx(stylex.attrs(styles.item, styles.subTrigger, props.xstyle).class, props.class)}
    >
      {props.children}
      <Icon icon={ChevronRight} {...stylex.attrs(styles.chevron)} />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent(props: DropdownMenuContentProps) {
  const rest = omit(props, "align", "alignOffset", "side", "sideOffset", "xstyle")
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      align={props.align ?? "start"}
      alignOffset={props.alignOffset ?? -3}
      side={props.side ?? "right"}
      sideOffset={props.sideOffset ?? 0}
      {...rest}
      xstyle={[styles.subContent, props.xstyle]}
    />
  )
}

type DropdownMenuCheckboxItemProps = Omit<MenuPrimitive.CheckboxItem.Props, "class"> & XStyle & { inset?: boolean }

function DropdownMenuCheckboxItem(props: DropdownMenuCheckboxItemProps) {
  const rest = omit(props, "class", "inset", "children", "xstyle")
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={props.inset}
      {...rest}
      class={cx(stylex.attrs(styles.item, styles.indicatorItem, props.xstyle).class, props.class)}
    >
      <span data-slot="dropdown-menu-checkbox-item-indicator" {...stylex.attrs(styles.indicator)}>
        <MenuPrimitive.CheckboxItemIndicator>
          <Icon icon={Check} />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {props.children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

type DropdownMenuRadioItemProps = Omit<MenuPrimitive.RadioItem.Props, "class"> & XStyle & { inset?: boolean }

function DropdownMenuRadioItem(props: DropdownMenuRadioItemProps) {
  const rest = omit(props, "class", "inset", "children", "xstyle")
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={props.inset}
      {...rest}
      class={cx(stylex.attrs(styles.item, styles.indicatorItem, props.xstyle).class, props.class)}
    >
      <span data-slot="dropdown-menu-radio-item-indicator" {...stylex.attrs(styles.indicator)}>
        <MenuPrimitive.RadioItemIndicator>
          <Icon icon={Check} />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {props.children}
    </MenuPrimitive.RadioItem>
  )
}

type DropdownMenuSeparatorProps = Omit<MenuPrimitive.Separator.Props, "class"> & XStyle

function DropdownMenuSeparator(props: DropdownMenuSeparatorProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      {...rest}
      class={cx(stylex.attrs(styles.separator, props.xstyle).class, props.class)}
    />
  )
}

type DropdownMenuShortcutProps = Omit<JSX.IntrinsicElements["span"], "class"> & XStyle

function DropdownMenuShortcut(props: DropdownMenuShortcutProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      {...rest}
      class={cx(stylex.attrs(styles.shortcut, props.xstyle).class, props.class)}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
