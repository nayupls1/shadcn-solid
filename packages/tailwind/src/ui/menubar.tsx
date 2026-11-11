import { omit, type ComponentProps } from "solid-js"
import { Menu as MenuPrimitive } from "base-ui-solidjs/menu"
import { Menubar as MenubarPrimitive } from "base-ui-solidjs/menubar"
import { Check } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
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

type MenubarProps = Omit<MenubarPrimitive.Props, "class"> & { class?: string }

function Menubar(props: MenubarProps) {
  const rest = omit(props, "class")
  return (
    <MenubarPrimitive
      data-slot="menubar"
      class={cn("flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs", props.class)}
      {...rest}
    />
  )
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

type MenubarTriggerProps = Omit<ComponentProps<typeof DropdownMenuTrigger>, "class"> & { class?: string }

function MenubarTrigger(props: MenubarTriggerProps) {
  const rest = omit(props, "class")
  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      class={cn(
        "flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none hover:bg-muted aria-expanded:bg-muted",
        props.class,
      )}
      {...rest}
    />
  )
}

function MenubarContent(props: ComponentProps<typeof DropdownMenuContent>) {
  const rest = omit(props, "class", "align", "alignOffset", "sideOffset")
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={props.align ?? "start"}
      alignOffset={props.alignOffset ?? -4}
      sideOffset={props.sideOffset ?? 8}
      class={cn(
        "cn-menu-target cn-menu-translucent min-w-36 rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
        props.class,
      )}
      {...rest}
    />
  )
}

function MenubarItem(props: ComponentProps<typeof DropdownMenuItem>) {
  const rest = omit(props, "class", "inset", "variant")
  return (
    <DropdownMenuItem
      data-slot="menubar-item"
      data-inset={props.inset}
      data-variant={props.variant ?? "default"}
      inset={props.inset}
      variant={props.variant}
      class={cn(
        "group/menubar-item gap-2 rounded-sm px-2 py-1.5 text-sm focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive!",
        props.class,
      )}
      {...rest}
    />
  )
}

type MenubarCheckboxItemProps = Omit<MenuPrimitive.CheckboxItem.Props, "class"> & { class?: string; inset?: boolean }

function MenubarCheckboxItem(props: MenubarCheckboxItemProps) {
  const rest = omit(props, "class", "children", "inset")
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={props.inset}
      class={cn(
        "relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class,
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute left-2 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuPrimitive.CheckboxItemIndicator>
          <Icon icon={Check} />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {props.children}
    </MenuPrimitive.CheckboxItem>
  )
}

function MenubarRadioGroup(props: ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />
}

type MenubarRadioItemProps = Omit<MenuPrimitive.RadioItem.Props, "class"> & { class?: string; inset?: boolean }

function MenubarRadioItem(props: MenubarRadioItemProps) {
  const rest = omit(props, "class", "children", "inset")
  return (
    <MenuPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={props.inset}
      class={cn(
        "relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute left-2 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuPrimitive.RadioItemIndicator>
          <Icon icon={Check} />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {props.children}
    </MenuPrimitive.RadioItem>
  )
}

function MenubarLabel(props: ComponentProps<typeof DropdownMenuLabel>) {
  const rest = omit(props, "class", "inset")
  return (
    <DropdownMenuLabel
      data-slot="menubar-label"
      data-inset={props.inset}
      inset={props.inset}
      class={cn("px-2 py-1.5 text-sm font-medium data-inset:pl-8", props.class)}
      {...rest}
    />
  )
}

function MenubarSeparator(props: ComponentProps<typeof DropdownMenuSeparator>) {
  const rest = omit(props, "class")
  return <DropdownMenuSeparator data-slot="menubar-separator" class={cn("-mx-1 my-1 h-px bg-border", props.class)} {...rest} />
}

function MenubarShortcut(props: ComponentProps<typeof DropdownMenuShortcut>) {
  const rest = omit(props, "class")
  return (
    <DropdownMenuShortcut
      data-slot="menubar-shortcut"
      class={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground",
        props.class,
      )}
      {...rest}
    />
  )
}

function MenubarSub(props: ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger(props: ComponentProps<typeof DropdownMenuSubTrigger>) {
  const rest = omit(props, "class", "inset")
  return (
    <DropdownMenuSubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={props.inset}
      inset={props.inset}
      class={cn(
        "gap-2 rounded-sm px-2 py-1.5 text-sm focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    />
  )
}

function MenubarSubContent(props: ComponentProps<typeof DropdownMenuSubContent>) {
  const rest = omit(props, "class")
  return (
    <DropdownMenuSubContent
      data-slot="menubar-sub-content"
      class={cn(
        "cn-menu-target cn-menu-translucent min-w-32 rounded-md bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        props.class,
      )}
      {...rest}
    />
  )
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
