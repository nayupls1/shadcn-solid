import { omit, Show } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import { Dialog as DialogPrimitive } from "base-ui-solidjs/dialog"
import { X } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

type DialogOverlayProps = Omit<DialogPrimitive.Backdrop.Props, "class"> & { class?: string }

function DialogOverlay(props: DialogOverlayProps) {
  const rest = omit(props, "class")
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      class={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        props.class,
      )}
      {...rest}
    />
  )
}

type DialogContentProps = Omit<DialogPrimitive.Popup.Props, "class"> & {
  class?: string
  showCloseButton?: boolean
}

function DialogContent(props: DialogContentProps) {
  const rest = omit(props, "class", "children", "showCloseButton")
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        class={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-xl bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          props.class,
        )}
        {...rest}
      >
        {props.children}
        <Show when={props.showCloseButton ?? true}>
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={(p) => <Button {...(p as ButtonProps)} variant="ghost" class={cn("absolute top-4 right-4", p.class as string)} size="icon-sm" />}
          >
            <Icon icon={X} />
            <span class="sr-only">Close</span>
          </DialogPrimitive.Close>
        </Show>
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

type DivProps = Omit<ComponentProps<"div">, "class"> & { class?: string }

function DialogHeader(props: DivProps) {
  const rest = omit(props, "class")
  return <div data-slot="dialog-header" class={cn("flex flex-col gap-2", props.class)} {...rest} />
}

function DialogFooter(props: DivProps & { showCloseButton?: boolean }) {
  const rest = omit(props, "class", "showCloseButton", "children")
  return (
    <div
      data-slot="dialog-footer"
      class={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", props.class)}
      {...rest}
    >
      {props.children}
      <Show when={props.showCloseButton}>
        <DialogPrimitive.Close render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Close</DialogPrimitive.Close>
      </Show>
    </div>
  )
}

type DialogTitleProps = Omit<DialogPrimitive.Title.Props, "class"> & { class?: string }

function DialogTitle(props: DialogTitleProps) {
  const rest = omit(props, "class")
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      class={cn("cn-font-heading leading-none font-medium", props.class)}
      {...rest}
    />
  )
}

type DialogDescriptionProps = Omit<DialogPrimitive.Description.Props, "class"> & { class?: string }

function DialogDescription(props: DialogDescriptionProps) {
  const rest = omit(props, "class")
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      class={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        props.class,
      )}
      {...rest}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
