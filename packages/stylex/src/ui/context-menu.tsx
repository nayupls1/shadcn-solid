import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { ContextMenu as ContextMenuPrimitive } from "base-ui-solidjs/context-menu"
import { Check, ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { menuItem } from "../lib/menu.stylex"
import { animate } from "../lib/animate"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `context-menu` (see the Tailwind variant for the source classes).
//
// StyleX has no descendant selectors, so shadcn's child styling is done on the parts themselves:
// - `focus:*` → `:is([data-highlighted])` on the item (Base UI moves focus with the highlight).
// - `not-data-[variant=destructive]:focus:**:text-accent-foreground` / `group-focus/context-menu-item:*`
//   → the shortcut reacts to its item through the `menuItem` marker (`stylex.when.ancestor`).
// - `[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4` → the icons
//   these parts render (chevron, check) are styled directly; `Icon` defaults to 16px. Icons you put
//   in an item inherit its color (`currentColor`), which covers `data-[variant=destructive]:*:[svg]:text-destructive`.
const ring = `0 0 0 1px color-mix(in oklch, ${colors.foreground} 10%, transparent)`

const styles = stylex.create({
  positioner: {
    isolation: "isolate",
    zIndex: 50,
    outlineStyle: "none",
  },
  content: {
    zIndex: 50,
    maxHeight: "var(--available-height)",
    minWidth: "9rem",
    transformOrigin: "var(--transform-origin)",
    overflowX: "hidden",
    overflowY: "auto",
    borderRadius: radius.md,
    backgroundColor: colors.popover,
    padding: "0.25rem",
    color: colors.popoverForeground,
    boxShadow: `${ring}, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`,
    transitionDuration: "100ms",
    animationDuration: "100ms",
    outlineStyle: "none",
  },
  subContent: {
    boxShadow: `${ring}, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`,
  },
  label: {
    paddingTop: "0.375rem",
    paddingBottom: "0.375rem",
    paddingRight: "0.5rem",
    paddingLeft: {
      default: "0.5rem",
      ":is([data-inset])": "2rem",
    },
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    color: colors.mutedForeground,
  },
  // Shared by item, sub-trigger, checkbox and radio items.
  itemBase: {
    display: "flex",
    cursor: "default",
    alignItems: "center",
    gap: "0.5rem",
    borderRadius: radius.sm,
    paddingTop: "0.375rem",
    paddingBottom: "0.375rem",
    paddingRight: "0.5rem",
    paddingLeft: {
      default: "0.5rem",
      ":is([data-inset])": "2rem",
    },
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    // `outline-hidden`: no outline, but a transparent one in forced-colors mode.
    outlineStyle: { default: "none", "@media (forced-colors: active)": "solid" },
    outlineWidth: { default: null, "@media (forced-colors: active)": "2px" },
    outlineColor: { default: null, "@media (forced-colors: active)": "transparent" },
    outlineOffset: { default: null, "@media (forced-colors: active)": "2px" },
    userSelect: "none",
    backgroundColor: {
      default: null,
      ":is([data-highlighted])": colors.accent,
    },
    color: {
      default: null,
      ":is([data-highlighted])": colors.accentForeground,
    },
    pointerEvents: {
      default: null,
      ":is([data-disabled])": "none",
    },
    opacity: {
      default: null,
      ":is([data-disabled])": 0.5,
    },
  },
  item: {
    position: "relative",
    backgroundColor: {
      default: null,
      ":is([data-highlighted]:not([data-variant=destructive]))": colors.accent,
      ":is([data-highlighted][data-variant=destructive])": `light-dark(color-mix(in oklch, ${colors.destructive} 10%, transparent), color-mix(in oklch, ${colors.destructive} 20%, transparent))`,
    },
    color: {
      default: null,
      ":is([data-highlighted]:not([data-variant=destructive]))": colors.accentForeground,
      ":is([data-variant=destructive])": colors.destructive,
    },
  },
  subTrigger: {
    // Sub-triggers have no gap and no disabled styles in shadcn's context menu.
    gap: null,
    pointerEvents: null,
    opacity: null,
    backgroundColor: {
      default: null,
      ":is([data-highlighted], [data-open])": colors.accent,
    },
    color: {
      default: null,
      ":is([data-highlighted], [data-open])": colors.accentForeground,
    },
  },
  trigger: {
    userSelect: "none",
  },
  indicatorPlain: {
    pointerEvents: "none",
    position: "absolute",
    right: "0.5rem",
  },
  checkItem: {
    position: "relative",
    paddingRight: "2rem",
  },
  icon: {
    pointerEvents: "none",
    flexShrink: 0,
  },
  chevron: {
    marginLeft: "auto",
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
      [stylex.when.ancestor(":is([data-highlighted])", menuItem)]: colors.accentForeground,
    },
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuPortal(props: ContextMenuPrimitive.Portal.Props) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
}

type ContextMenuTriggerProps = Omit<ContextMenuPrimitive.Trigger.Props, "class"> & XStyle

function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.trigger, props.xstyle)
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...rest} class={cx(attrs().class, props.class)} />
}

type ContextMenuContentProps = Omit<ContextMenuPrimitive.Popup.Props, "class"> &
  Pick<ContextMenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  XStyle

function ContextMenuContent(props: ContextMenuContentProps) {
  const rest = omit(props, "align", "alignOffset", "side", "sideOffset", "class", "xstyle")
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
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        class={stylex.attrs(styles.positioner).class}
        align={props.align ?? "start"}
        alignOffset={props.alignOffset ?? 4}
        side={props.side ?? "right"}
        sideOffset={props.sideOffset ?? 0}
      >
        <ContextMenuPrimitive.Popup data-slot="context-menu-content" {...rest} class={cx(attrs().class, props.class)} />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuGroup(props: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
}

type ContextMenuLabelProps = Omit<ContextMenuPrimitive.GroupLabel.Props, "class"> & XStyle & { inset?: boolean }

function ContextMenuLabel(props: ContextMenuLabelProps) {
  const rest = omit(props, "class", "xstyle", "inset")
  const attrs = () => stylex.attrs(styles.label, props.xstyle)
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      data-inset={props.inset}
      {...rest}
      class={cx(attrs().class, props.class)}
    />
  )
}

type ContextMenuItemProps = Omit<ContextMenuPrimitive.Item.Props, "class"> &
  XStyle & {
    inset?: boolean
    variant?: "default" | "destructive"
  }

function ContextMenuItem(props: ContextMenuItemProps) {
  const rest = omit(props, "class", "xstyle", "inset", "variant")
  const attrs = () => stylex.attrs(menuItem, styles.itemBase, styles.item, props.xstyle)
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={props.inset}
      data-variant={props.variant ?? "default"}
      {...rest}
      class={cx(attrs().class, props.class)}
    />
  )
}

function ContextMenuSub(props: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
}

type ContextMenuSubTriggerProps = Omit<ContextMenuPrimitive.SubmenuTrigger.Props, "class"> & XStyle & { inset?: boolean }

function ContextMenuSubTrigger(props: ContextMenuSubTriggerProps) {
  const rest = omit(props, "class", "xstyle", "inset", "children")
  const attrs = () => stylex.attrs(menuItem, styles.itemBase, styles.subTrigger, props.xstyle)
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={props.inset}
      {...rest}
      class={cx(attrs().class, props.class)}
    >
      {props.children}
      <Icon icon={ChevronRight} {...stylex.attrs(styles.icon, styles.chevron)} />
    </ContextMenuPrimitive.SubmenuTrigger>
  )
}

function ContextMenuSubContent(props: ContextMenuContentProps) {
  const rest = omit(props, "xstyle", "side")
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      // Like shadcn, whose `className="... shadow-lg"` is replaced by a consumer's className.
      xstyle={props.xstyle ?? styles.subContent}
      side={props.side ?? "right"}
      {...rest}
    />
  )
}

type ContextMenuCheckboxItemProps = Omit<ContextMenuPrimitive.CheckboxItem.Props, "class"> & XStyle & { inset?: boolean }

function ContextMenuCheckboxItem(props: ContextMenuCheckboxItemProps) {
  const rest = omit(props, "class", "xstyle", "children", "inset")
  const attrs = () => stylex.attrs(menuItem, styles.itemBase, styles.checkItem, props.xstyle)
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={props.inset}
      {...rest}
      class={cx(attrs().class, props.class)}
    >
      <span {...stylex.attrs(styles.indicatorPlain)}>
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <Icon icon={Check} {...stylex.attrs(styles.icon)} />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {props.children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioGroup(props: ContextMenuPrimitive.RadioGroup.Props) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

type ContextMenuRadioItemProps = Omit<ContextMenuPrimitive.RadioItem.Props, "class"> & XStyle & { inset?: boolean }

function ContextMenuRadioItem(props: ContextMenuRadioItemProps) {
  const rest = omit(props, "class", "xstyle", "children", "inset")
  const attrs = () => stylex.attrs(menuItem, styles.itemBase, styles.checkItem, props.xstyle)
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={props.inset}
      {...rest}
      class={cx(attrs().class, props.class)}
    >
      <span {...stylex.attrs(styles.indicatorPlain)}>
        <ContextMenuPrimitive.RadioItemIndicator>
          <Icon icon={Check} {...stylex.attrs(styles.icon)} />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {props.children}
    </ContextMenuPrimitive.RadioItem>
  )
}

type ContextMenuSeparatorProps = Omit<ContextMenuPrimitive.Separator.Props, "class"> & XStyle

function ContextMenuSeparator(props: ContextMenuSeparatorProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.separator, props.xstyle)
  return <ContextMenuPrimitive.Separator data-slot="context-menu-separator" {...rest} class={cx(attrs().class, props.class)} />
}

type ContextMenuShortcutProps = Omit<ComponentProps<"span">, "class"> & XStyle

function ContextMenuShortcut(props: ContextMenuShortcutProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.shortcut, props.xstyle)
  return <span data-slot="context-menu-shortcut" {...rest} class={cx(attrs().class, props.class)} />
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
