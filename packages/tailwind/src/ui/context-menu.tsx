import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import { ContextMenu as ContextMenuPrimitive } from "base-ui-solidjs/context-menu"
import { Check, ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuPortal(props: ContextMenuPrimitive.Portal.Props) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
}

type ContextMenuTriggerProps = Omit<ContextMenuPrimitive.Trigger.Props, "class"> & { class?: string }

function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  const rest = omit(props, "class")
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" class={cn("select-none", props.class)} {...rest} />
}

type ContextMenuContentProps = Omit<ContextMenuPrimitive.Popup.Props, "class"> &
  Pick<ContextMenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & { class?: string }

function ContextMenuContent(props: ContextMenuContentProps) {
  const rest = omit(props, "align", "alignOffset", "side", "sideOffset", "class")
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        class="isolate z-50 outline-none"
        align={props.align ?? "start"}
        alignOffset={props.alignOffset ?? 4}
        side={props.side ?? "right"}
        sideOffset={props.sideOffset ?? 0}
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          class={cn(
            "cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            props.class,
          )}
          {...rest}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuGroup(props: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
}

type ContextMenuLabelProps = Omit<ContextMenuPrimitive.GroupLabel.Props, "class"> & { class?: string; inset?: boolean }

function ContextMenuLabel(props: ContextMenuLabelProps) {
  const rest = omit(props, "class", "inset")
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      data-inset={props.inset}
      class={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8", props.class)}
      {...rest}
    />
  )
}

type ContextMenuItemProps = Omit<ContextMenuPrimitive.Item.Props, "class"> & {
  class?: string
  inset?: boolean
  variant?: "default" | "destructive"
}

function ContextMenuItem(props: ContextMenuItemProps) {
  const rest = omit(props, "class", "inset", "variant")
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={props.inset}
      data-variant={props.variant ?? "default"}
      class={cn(
        "group/context-menu-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",
        props.class,
      )}
      {...rest}
    />
  )
}

function ContextMenuSub(props: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
}

type ContextMenuSubTriggerProps = Omit<ContextMenuPrimitive.SubmenuTrigger.Props, "class"> & {
  class?: string
  inset?: boolean
}

function ContextMenuSubTrigger(props: ContextMenuSubTriggerProps) {
  const rest = omit(props, "class", "inset", "children")
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={props.inset}
      class={cn(
        "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      {props.children}
      <Icon icon={ChevronRight} class="cn-rtl-flip ml-auto" />
    </ContextMenuPrimitive.SubmenuTrigger>
  )
}

function ContextMenuSubContent(props: ContextMenuContentProps) {
  const rest = omit(props, "class", "side")
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      class={props.class ?? "cn-menu-target cn-menu-translucent shadow-lg"}
      side={props.side ?? "right"}
      {...rest}
    />
  )
}

type ContextMenuCheckboxItemProps = Omit<ContextMenuPrimitive.CheckboxItem.Props, "class"> & {
  class?: string
  inset?: boolean
}

function ContextMenuCheckboxItem(props: ContextMenuCheckboxItemProps) {
  const rest = omit(props, "class", "children", "inset")
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={props.inset}
      class={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <Icon icon={Check} />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {props.children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioGroup(props: ContextMenuPrimitive.RadioGroup.Props) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

type ContextMenuRadioItemProps = Omit<ContextMenuPrimitive.RadioItem.Props, "class"> & {
  class?: string
  inset?: boolean
}

function ContextMenuRadioItem(props: ContextMenuRadioItemProps) {
  const rest = omit(props, "class", "children", "inset")
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={props.inset}
      class={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.RadioItemIndicator>
          <Icon icon={Check} />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {props.children}
    </ContextMenuPrimitive.RadioItem>
  )
}

type ContextMenuSeparatorProps = Omit<ContextMenuPrimitive.Separator.Props, "class"> & { class?: string }

function ContextMenuSeparator(props: ContextMenuSeparatorProps) {
  const rest = omit(props, "class")
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      class={cn("-mx-1 my-1 h-px bg-border", props.class)}
      {...rest}
    />
  )
}

type ContextMenuShortcutProps = Omit<ComponentProps<"span">, "class"> & { class?: string }

function ContextMenuShortcut(props: ContextMenuShortcutProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="context-menu-shortcut"
      class={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/context-menu-item:text-accent-foreground",
        props.class,
      )}
      {...rest}
    />
  )
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
