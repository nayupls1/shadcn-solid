import { omit, Show } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import { Dialog as SheetPrimitive } from "base-ui-solidjs/dialog"
import { X } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(props: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

type SheetOverlayProps = Omit<SheetPrimitive.Backdrop.Props, "class"> & { class?: string }

function SheetOverlay(props: SheetOverlayProps) {
  const rest = omit(props, "class")
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      class={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        props.class,
      )}
      {...rest}
    />
  )
}

type SheetContentProps = Omit<SheetPrimitive.Popup.Props, "class"> & {
  class?: string
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}

function SheetContent(props: SheetContentProps) {
  const rest = omit(props, "class", "children", "side", "showCloseButton")
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={props.side ?? "right"}
        class={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          props.class,
        )}
        {...rest}
      >
        {props.children}
        <Show when={props.showCloseButton ?? true}>
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={(p) => (
              <Button
                {...(p as ButtonProps)}
                variant="ghost"
                class={cn("absolute top-4 right-4", p.class as string)}
                size="icon-sm"
              />
            )}
          >
            <Icon icon={X} />
            <span class="sr-only">Close</span>
          </SheetPrimitive.Close>
        </Show>
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

type DivProps = Omit<ComponentProps<"div">, "class"> & { class?: string }

function SheetHeader(props: DivProps) {
  const rest = omit(props, "class")
  return <div data-slot="sheet-header" class={cn("flex flex-col gap-1.5 p-4", props.class)} {...rest} />
}

function SheetFooter(props: DivProps) {
  const rest = omit(props, "class")
  return <div data-slot="sheet-footer" class={cn("mt-auto flex flex-col gap-2 p-4", props.class)} {...rest} />
}

type SheetTitleProps = Omit<SheetPrimitive.Title.Props, "class"> & { class?: string }

function SheetTitle(props: SheetTitleProps) {
  const rest = omit(props, "class")
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      class={cn("cn-font-heading font-medium text-foreground", props.class)}
      {...rest}
    />
  )
}

type SheetDescriptionProps = Omit<SheetPrimitive.Description.Props, "class"> & { class?: string }

function SheetDescription(props: SheetDescriptionProps) {
  const rest = omit(props, "class")
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      class={cn("text-sm text-muted-foreground", props.class)}
      {...rest}
    />
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
