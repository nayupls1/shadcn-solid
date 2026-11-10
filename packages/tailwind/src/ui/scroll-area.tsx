import { omit } from "solid-js"
import { ScrollArea as ScrollAreaPrimitive } from "base-ui-solidjs/scroll-area"
import { cn } from "../lib/utils"

type ScrollAreaProps = Omit<ScrollAreaPrimitive.Root.Props, "class"> & { class?: string }

function ScrollArea(props: ScrollAreaProps) {
  const rest = omit(props, "class", "children")
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" class={cn("relative", props.class)} {...rest}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        class="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {props.children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

type ScrollBarProps = Omit<ScrollAreaPrimitive.Scrollbar.Props, "class"> & { class?: string }

function ScrollBar(props: ScrollBarProps) {
  const rest = omit(props, "class", "orientation")
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={props.orientation ?? "vertical"}
      orientation={props.orientation ?? "vertical"}
      class={cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        props.class,
      )}
      {...rest}
    >
      <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" class="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar, type ScrollAreaProps, type ScrollBarProps }
