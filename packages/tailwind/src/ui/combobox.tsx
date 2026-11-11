import { omit, Show } from "solid-js"
import { Combobox as ComboboxPrimitive } from "base-ui-solidjs/combobox"
import { Check, ChevronDown, X } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { Button } from "./button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./input-group"

const Combobox = ComboboxPrimitive.Root

function ComboboxValue(props: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

type ComboboxTriggerProps = Omit<ComboboxPrimitive.Trigger.Props, "class"> & { class?: string }

// No `omit` here: as InputGroupButton's render target it receives Base UI's reactive props proxy,
// and enumerating its keys in the component body is an untracked read.
function ComboboxTrigger(props: ComboboxTriggerProps) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      {...props}
      class={cn("[&_svg:not([class*='size-'])]:size-4", props.class)}
    >
      {props.children}
      <Icon icon={ChevronDown} class="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  )
}

type ComboboxClearProps = Omit<ComboboxPrimitive.Clear.Props, "class"> & { class?: string }

function ComboboxClear(props: ComboboxClearProps) {
  const rest = omit(props, "class")
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={(p) => <InputGroupButton variant="ghost" size="icon-xs" {...(p as object)} />}
      class={cn(props.class)}
      {...rest}
    >
      <Icon icon={X} class="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  )
}

type ComboboxInputProps = Omit<ComboboxPrimitive.Input.Props, "class"> & {
  class?: string
  showTrigger?: boolean
  showClear?: boolean
}

function ComboboxInput(props: ComboboxInputProps) {
  const rest = omit(props, "class", "children", "disabled", "showTrigger", "showClear")
  const disabled = () => props.disabled ?? false
  return (
    <InputGroup class={cn("w-auto", props.class)}>
      {/* Render functions, not `render={<InputGroupInput />}`: Base UI components return accessors,
          not DOM nodes, so an element would be treated as a render function and lose its props. */}
      <ComboboxPrimitive.Input render={(p) => <InputGroupInput {...(p as object)} disabled={disabled()} />} {...rest} />
      <InputGroupAddon align="inline-end">
        <Show when={props.showTrigger ?? true}>
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            render={(p) => <ComboboxTrigger {...(p as object)} />}
            data-slot="input-group-button"
            class="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled()}
          />
        </Show>
        <Show when={props.showClear}>
          <ComboboxClear disabled={disabled()} />
        </Show>
      </InputGroupAddon>
      {props.children}
    </InputGroup>
  )
}

type ComboboxContentProps = Omit<ComboboxPrimitive.Popup.Props, "class"> &
  Pick<ComboboxPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "anchor"> & {
    class?: string
  }

function ComboboxContent(props: ComboboxContentProps) {
  const rest = omit(props, "class", "side", "sideOffset", "align", "alignOffset", "anchor")
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 6}
        align={props.align ?? "start"}
        alignOffset={props.alignOffset ?? 0}
        anchor={props.anchor}
        class="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={String(!!props.anchor)}
          class={cn(
            "cn-menu-target cn-menu-translucent group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            props.class
          )}
          {...rest}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

type ComboboxListProps = Omit<ComboboxPrimitive.List.Props, "class"> & { class?: string }

function ComboboxList(props: ComboboxListProps) {
  const rest = omit(props, "class")
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      class={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        props.class
      )}
      {...rest}
    />
  )
}

type ComboboxItemProps = Omit<ComboboxPrimitive.Item.Props, "class"> & { class?: string }

function ComboboxItem(props: ComboboxItemProps) {
  const rest = omit(props, "class", "children")
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      class={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class
      )}
      {...rest}
    >
      {props.children}
      <ComboboxPrimitive.ItemIndicator
        render={<span class="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />}
      >
        <Icon icon={Check} class="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

type ComboboxGroupProps = Omit<ComboboxPrimitive.Group.Props, "class"> & { class?: string }

function ComboboxGroup(props: ComboboxGroupProps) {
  const rest = omit(props, "class")
  return <ComboboxPrimitive.Group data-slot="combobox-group" class={cn(props.class)} {...rest} />
}

type ComboboxLabelProps = Omit<ComboboxPrimitive.GroupLabel.Props, "class"> & { class?: string }

function ComboboxLabel(props: ComboboxLabelProps) {
  const rest = omit(props, "class")
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      class={cn("px-2 py-1.5 text-xs text-muted-foreground", props.class)}
      {...rest}
    />
  )
}

function ComboboxCollection(props: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
}

type ComboboxEmptyProps = Omit<ComboboxPrimitive.Empty.Props, "class"> & { class?: string }

function ComboboxEmpty(props: ComboboxEmptyProps) {
  const rest = omit(props, "class")
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      class={cn(
        "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex",
        props.class
      )}
      {...rest}
    />
  )
}

type ComboboxSeparatorProps = Omit<ComboboxPrimitive.Separator.Props, "class"> & { class?: string }

function ComboboxSeparator(props: ComboboxSeparatorProps) {
  const rest = omit(props, "class")
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      class={cn("-mx-1 my-1 h-px bg-border", props.class)}
      {...rest}
    />
  )
}

type ComboboxChipsProps = Omit<ComboboxPrimitive.Chips.Props, "class"> & { class?: string }

function ComboboxChips(props: ComboboxChipsProps) {
  const rest = omit(props, "class")
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      class={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1.5 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        props.class
      )}
      {...rest}
    />
  )
}

type ComboboxChipProps = Omit<ComboboxPrimitive.Chip.Props, "class"> & {
  class?: string
  showRemove?: boolean
}

function ComboboxChip(props: ComboboxChipProps) {
  const rest = omit(props, "class", "children", "showRemove")
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      class={cn(
        "flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        props.class
      )}
      {...rest}
    >
      {props.children}
      <Show when={props.showRemove ?? true}>
        <ComboboxPrimitive.ChipRemove
          render={(p) => <Button variant="ghost" size="icon-xs" {...(p as object)} />}
          class="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <Icon icon={X} class="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      </Show>
    </ComboboxPrimitive.Chip>
  )
}

type ComboboxChipsInputProps = Omit<ComboboxPrimitive.Input.Props, "class"> & { class?: string }

function ComboboxChipsInput(props: ComboboxChipsInputProps) {
  const rest = omit(props, "class")
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      class={cn("min-w-16 flex-1 outline-none", props.class)}
      {...rest}
    />
  )
}

/**
 * An anchor for `ComboboxContent`, usually the chips container:
 *
 *   const anchor = useComboboxAnchor()
 *   <ComboboxChips ref={anchor}>…</ComboboxChips>
 *   <ComboboxContent anchor={anchor}>…</ComboboxContent>
 *
 * Solid calls it as a callback ref with the element; Base UI calls it without arguments to read
 * the element. `anchor.current` is the element too (React's ref shape).
 */
type ComboboxAnchor = ((element?: HTMLDivElement | null) => HTMLDivElement | null) & {
  current: HTMLDivElement | null
}

function useComboboxAnchor(): ComboboxAnchor {
  const anchor = ((element?: HTMLDivElement | null) => {
    if (element !== undefined) anchor.current = element
    return anchor.current
  }) as ComboboxAnchor
  anchor.current = null
  return anchor
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
