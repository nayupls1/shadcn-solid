import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import { Menu as MenuPrimitive } from "base-ui-solidjs/menu"
import { Check, ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

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
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & { class?: string }

function DropdownMenuContent(props: DropdownMenuContentProps) {
  const rest = omit(props, "align", "alignOffset", "side", "sideOffset", "class")
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        class="isolate z-50 outline-none"
        align={props.align ?? "start"}
        alignOffset={props.alignOffset ?? 0}
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 4}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          class={cn(
            "cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
            props.class,
          )}
          {...rest}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

type DropdownMenuLabelProps = Omit<MenuPrimitive.GroupLabel.Props, "class"> & { class?: string; inset?: boolean }

function DropdownMenuLabel(props: DropdownMenuLabelProps) {
  const rest = omit(props, "class", "inset")
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={props.inset}
      class={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8", props.class)}
      {...rest}
    />
  )
}

type DropdownMenuItemProps = Omit<MenuPrimitive.Item.Props, "class"> & {
  class?: string
  inset?: boolean
  variant?: "default" | "destructive"
}

function DropdownMenuItem(props: DropdownMenuItemProps) {
  const rest = omit(props, "class", "inset", "variant")
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={props.inset}
      data-variant={props.variant ?? "default"}
      class={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        props.class,
      )}
      {...rest}
    />
  )
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

type DropdownMenuSubTriggerProps = Omit<MenuPrimitive.SubmenuTrigger.Props, "class"> & {
  class?: string
  inset?: boolean
}

function DropdownMenuSubTrigger(props: DropdownMenuSubTriggerProps) {
  const rest = omit(props, "class", "inset", "children")
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={props.inset}
      class={cn(
        "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-8 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      {props.children}
      <Icon icon={ChevronRight} class="cn-rtl-flip ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent(props: DropdownMenuContentProps) {
  const rest = omit(props, "class", "align", "alignOffset", "side", "sideOffset")
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      class={cn(
        "cn-menu-target cn-menu-translucent w-auto min-w-[96px] rounded-md bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        props.class,
      )}
      align={props.align ?? "start"}
      alignOffset={props.alignOffset ?? -3}
      side={props.side ?? "right"}
      sideOffset={props.sideOffset ?? 0}
      {...rest}
    />
  )
}

type DropdownMenuCheckboxItemProps = Omit<MenuPrimitive.CheckboxItem.Props, "class"> & {
  class?: string
  inset?: boolean
}

function DropdownMenuCheckboxItem(props: DropdownMenuCheckboxItemProps) {
  const rest = omit(props, "class", "children", "inset")
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={props.inset}
      class={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      <span
        class="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
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

type DropdownMenuRadioItemProps = Omit<MenuPrimitive.RadioItem.Props, "class"> & {
  class?: string
  inset?: boolean
}

function DropdownMenuRadioItem(props: DropdownMenuRadioItemProps) {
  const rest = omit(props, "class", "children", "inset")
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={props.inset}
      class={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      <span
        class="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <Icon icon={Check} />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {props.children}
    </MenuPrimitive.RadioItem>
  )
}

type DropdownMenuSeparatorProps = Omit<MenuPrimitive.Separator.Props, "class"> & { class?: string }

function DropdownMenuSeparator(props: DropdownMenuSeparatorProps) {
  const rest = omit(props, "class")
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      class={cn("-mx-1 my-1 h-px bg-border", props.class)}
      {...rest}
    />
  )
}

type DropdownMenuShortcutProps = Omit<ComponentProps<"span">, "class"> & { class?: string }

function DropdownMenuShortcut(props: DropdownMenuShortcutProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      class={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        props.class,
      )}
      {...rest}
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
