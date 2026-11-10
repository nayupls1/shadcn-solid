import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import { Popover as PopoverPrimitive } from "base-ui-solidjs/popover"
import { cn } from "../lib/utils"

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = Omit<PopoverPrimitive.Popup.Props, "class"> &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & { class?: string }

function PopoverContent(props: PopoverContentProps) {
  const rest = omit(props, "class", "align", "alignOffset", "side", "sideOffset")
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={props.align ?? "center"}
        alignOffset={props.alignOffset ?? 0}
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 4}
        class="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          class={cn(
            "z-50 flex w-72 origin-(--transform-origin) flex-col gap-4 rounded-md bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            props.class,
          )}
          {...rest}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

type DivProps = Omit<ComponentProps<"div">, "class"> & { class?: string }

function PopoverHeader(props: DivProps) {
  const rest = omit(props, "class")
  return <div data-slot="popover-header" class={cn("flex flex-col gap-1 text-sm", props.class)} {...rest} />
}

type PopoverTitleProps = Omit<PopoverPrimitive.Title.Props, "class"> & { class?: string }

function PopoverTitle(props: PopoverTitleProps) {
  const rest = omit(props, "class")
  return <PopoverPrimitive.Title data-slot="popover-title" class={cn("font-medium", props.class)} {...rest} />
}

type PopoverDescriptionProps = Omit<PopoverPrimitive.Description.Props, "class"> & { class?: string }

function PopoverDescription(props: PopoverDescriptionProps) {
  const rest = omit(props, "class")
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      class={cn("text-muted-foreground", props.class)}
      {...rest}
    />
  )
}

export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger }
