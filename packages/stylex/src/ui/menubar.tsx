import { omit, type ComponentProps } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Menu as MenuPrimitive } from "base-ui-solidjs/menu"
import { Menubar as MenubarPrimitive } from "base-ui-solidjs/menubar"
import { Check } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu"

// Port of shadcn/ui's base-vega `menubar` (see the Tailwind variant for the source classes).
// Like shadcn, the menu parts are the dropdown-menu ones; the menubar classes that only repeat
// dropdown-menu's (items, separator, shortcut, sub-trigger) need no extra StyleX, and the ones
// that differ after tailwind-merge (content/sub-content min-width, label size) are passed as `xstyle`.

const styles = stylex.create({
  root: {
    display: "flex",
    height: "2.25rem",
    alignItems: "center",
    gap: "0.25rem",
    borderRadius: radius.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    padding: "0.25rem",
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
  trigger: {
    display: "flex",
    alignItems: "center",
    borderRadius: radius.sm,
    paddingInline: "0.5rem",
    paddingBlock: "0.25rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    outlineStyle: { default: "none", "@media (forced-colors: active)": "solid" },
    outlineWidth: { default: null, "@media (forced-colors: active)": "2px" },
    outlineColor: { default: null, "@media (forced-colors: active)": "transparent" },
    outlineOffset: { default: null, "@media (forced-colors: active)": "2px" },
    userSelect: "none",
    backgroundColor: {
      default: null,
      ":hover": colors.muted,
      ":is([aria-expanded=true])": colors.muted,
    },
  },
  content: {
    minWidth: "9rem",
  },
  subContent: {
    minWidth: "8rem",
  },
  label: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  // MenubarCheckboxItem / MenubarRadioItem (indicator on the left, unlike dropdown-menu's).
  checkItem: {
    position: "relative",
    display: "flex",
    cursor: "default",
    alignItems: "center",
    gap: "0.5rem",
    borderRadius: radius.md,
    paddingBlock: "0.375rem",
    paddingRight: "0.5rem",
    paddingLeft: "2rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    outlineStyle: { default: "none", "@media (forced-colors: active)": "solid" },
    outlineWidth: { default: null, "@media (forced-colors: active)": "2px" },
    outlineColor: { default: null, "@media (forced-colors: active)": "transparent" },
    outlineOffset: { default: null, "@media (forced-colors: active)": "2px" },
    userSelect: "none",
    backgroundColor: { default: null, ":is([data-highlighted])": colors.accent },
    color: { default: null, ":is([data-highlighted])": colors.accentForeground },
    pointerEvents: { default: null, ":is([data-disabled])": "none" },
    opacity: { default: null, ":is([data-disabled])": 0.5 },
  },
  indicator: {
    pointerEvents: "none",
    position: "absolute",
    left: "0.5rem",
    display: "flex",
    width: "1rem",
    height: "1rem",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    pointerEvents: "none",
    flexShrink: 0,
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type MenubarProps = Omit<MenubarPrimitive.Props, "class"> & XStyle

function Menubar(props: MenubarProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.root, props.xstyle)
  return <MenubarPrimitive data-slot="menubar" {...rest} class={cx(attrs().class, props.class)} />
}

function MenubarMenu(props: ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu data-slot="menubar-menu" {...props} />
}

function MenubarGroup(props: ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />
}

function MenubarPortal(props: ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />
}

type MenubarTriggerProps = Omit<ComponentProps<typeof DropdownMenuTrigger>, "class"> & XStyle

function MenubarTrigger(props: MenubarTriggerProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.trigger, props.xstyle)
  return <DropdownMenuTrigger data-slot="menubar-trigger" {...rest} class={cx(attrs().class, props.class)} />
}

function MenubarContent(props: ComponentProps<typeof DropdownMenuContent>) {
  const rest = omit(props, "xstyle", "align", "alignOffset", "sideOffset")
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={props.align ?? "start"}
      alignOffset={props.alignOffset ?? -4}
      sideOffset={props.sideOffset ?? 8}
      xstyle={[styles.content, props.xstyle]}
      {...rest}
    />
  )
}

function MenubarItem(props: ComponentProps<typeof DropdownMenuItem>) {
  return <DropdownMenuItem data-slot="menubar-item" {...props} />
}

type MenubarCheckboxItemProps = Omit<MenuPrimitive.CheckboxItem.Props, "class"> & XStyle & { inset?: boolean }

function MenubarCheckboxItem(props: MenubarCheckboxItemProps) {
  const rest = omit(props, "class", "xstyle", "children", "inset")
  const attrs = () => stylex.attrs(styles.checkItem, props.xstyle)
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={props.inset}
      {...rest}
      class={cx(attrs().class, props.class)}
    >
      <span {...stylex.attrs(styles.indicator)}>
        <MenuPrimitive.CheckboxItemIndicator>
          <Icon icon={Check} {...stylex.attrs(styles.icon)} />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {props.children}
    </MenuPrimitive.CheckboxItem>
  )
}

function MenubarRadioGroup(props: ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />
}

type MenubarRadioItemProps = Omit<MenuPrimitive.RadioItem.Props, "class"> & XStyle & { inset?: boolean }

function MenubarRadioItem(props: MenubarRadioItemProps) {
  const rest = omit(props, "class", "xstyle", "children", "inset")
  const attrs = () => stylex.attrs(styles.checkItem, props.xstyle)
  return (
    <MenuPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={props.inset}
      {...rest}
      class={cx(attrs().class, props.class)}
    >
      <span {...stylex.attrs(styles.indicator)}>
        <MenuPrimitive.RadioItemIndicator>
          <Icon icon={Check} {...stylex.attrs(styles.icon)} />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {props.children}
    </MenuPrimitive.RadioItem>
  )
}

function MenubarLabel(props: ComponentProps<typeof DropdownMenuLabel>) {
  const rest = omit(props, "xstyle")
  return <DropdownMenuLabel data-slot="menubar-label" {...rest} xstyle={[styles.label, props.xstyle]} />
}

function MenubarSeparator(props: ComponentProps<typeof DropdownMenuSeparator>) {
  return <DropdownMenuSeparator data-slot="menubar-separator" {...props} />
}

function MenubarShortcut(props: ComponentProps<typeof DropdownMenuShortcut>) {
  return <DropdownMenuShortcut data-slot="menubar-shortcut" {...props} />
}

function MenubarSub(props: ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger(props: ComponentProps<typeof DropdownMenuSubTrigger>) {
  return <DropdownMenuSubTrigger data-slot="menubar-sub-trigger" {...props} />
}

function MenubarSubContent(props: ComponentProps<typeof DropdownMenuSubContent>) {
  const rest = omit(props, "xstyle")
  return <DropdownMenuSubContent data-slot="menubar-sub-content" {...rest} xstyle={[styles.subContent, props.xstyle]} />
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
