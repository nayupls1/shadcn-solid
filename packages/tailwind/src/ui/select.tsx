import { omit } from "solid-js"
import { Select as SelectPrimitive } from "base-ui-solidjs/select"
import { Check, ChevronDown, ChevronUp } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

const Select = SelectPrimitive.Root

type SelectGroupProps = Omit<SelectPrimitive.Group.Props, "class"> & { class?: string }

function SelectGroup(props: SelectGroupProps) {
  const rest = omit(props, "class")
  return <SelectPrimitive.Group data-slot="select-group" class={cn("scroll-my-1 p-1", props.class)} {...rest} />
}

type SelectValueProps = Omit<SelectPrimitive.Value.Props, "class"> & { class?: string }

function SelectValue(props: SelectValueProps) {
  const rest = omit(props, "class")
  return <SelectPrimitive.Value data-slot="select-value" class={cn("flex flex-1 text-left", props.class)} {...rest} />
}

type SelectTriggerProps = Omit<SelectPrimitive.Trigger.Props, "class"> & {
  class?: string
  size?: "sm" | "default"
}

function SelectTrigger(props: SelectTriggerProps) {
  const rest = omit(props, "class", "size", "children")
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={props.size ?? "default"}
      class={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class
      )}
      {...rest}
    >
      {props.children}
      <SelectPrimitive.Icon render={<Icon icon={ChevronDown} class="pointer-events-none size-4 text-muted-foreground" />} />
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps = Omit<SelectPrimitive.Popup.Props, "class"> &
  Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"> & {
    class?: string
  }

function SelectContent(props: SelectContentProps) {
  const rest = omit(props, "class", "children", "side", "sideOffset", "align", "alignOffset", "alignItemWithTrigger")
  const alignItemWithTrigger = () => props.alignItemWithTrigger ?? true
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 4}
        align={props.align ?? "center"}
        alignOffset={props.alignOffset ?? 0}
        alignItemWithTrigger={alignItemWithTrigger()}
        class="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={String(alignItemWithTrigger())}
          class={cn(
            "cn-menu-target cn-menu-translucent relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            props.class
          )}
          {...rest}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{props.children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

type SelectLabelProps = Omit<SelectPrimitive.GroupLabel.Props, "class"> & { class?: string }

function SelectLabel(props: SelectLabelProps) {
  const rest = omit(props, "class")
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      class={cn("px-2 py-1.5 text-xs text-muted-foreground", props.class)}
      {...rest}
    />
  )
}

type SelectItemProps = Omit<SelectPrimitive.Item.Props, "class"> & { class?: string }

function SelectItem(props: SelectItemProps) {
  const rest = omit(props, "class", "children")
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      class={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        props.class
      )}
      {...rest}
    >
      <SelectPrimitive.ItemText class="flex flex-1 shrink-0 gap-2 whitespace-nowrap">{props.children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={<span class="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />}
      >
        <Icon icon={Check} class="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

type SelectSeparatorProps = Omit<SelectPrimitive.Separator.Props, "class"> & { class?: string }

function SelectSeparator(props: SelectSeparatorProps) {
  const rest = omit(props, "class")
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      class={cn("pointer-events-none -mx-1 my-1 h-px bg-border", props.class)}
      {...rest}
    />
  )
}

type SelectScrollUpButtonProps = Omit<SelectPrimitive.ScrollUpArrow.Props, "class"> & { class?: string }

function SelectScrollUpButton(props: SelectScrollUpButtonProps) {
  const rest = omit(props, "class")
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      class={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        props.class
      )}
      {...rest}
    >
      <Icon icon={ChevronUp} />
    </SelectPrimitive.ScrollUpArrow>
  )
}

type SelectScrollDownButtonProps = Omit<SelectPrimitive.ScrollDownArrow.Props, "class"> & { class?: string }

function SelectScrollDownButton(props: SelectScrollDownButtonProps) {
  const rest = omit(props, "class")
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      class={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        props.class
      )}
      {...rest}
    >
      <Icon icon={ChevronDown} />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
