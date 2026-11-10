import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import { AlertDialog as AlertDialogPrimitive } from "base-ui-solidjs/alert-dialog"
import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal(props: AlertDialogPrimitive.Portal.Props) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

type AlertDialogOverlayProps = Omit<AlertDialogPrimitive.Backdrop.Props, "class"> & { class?: string }

function AlertDialogOverlay(props: AlertDialogOverlayProps) {
  const rest = omit(props, "class")
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      class={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        props.class,
      )}
      {...rest}
    />
  )
}

type AlertDialogContentProps = Omit<AlertDialogPrimitive.Popup.Props, "class"> & {
  class?: string
  size?: "default" | "sm"
}

function AlertDialogContent(props: AlertDialogContentProps) {
  const rest = omit(props, "class", "size")
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={props.size ?? "default"}
        class={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-6 rounded-xl bg-popover p-6 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          props.class,
        )}
        {...rest}
      />
    </AlertDialogPortal>
  )
}

type DivProps = Omit<ComponentProps<"div">, "class"> & { class?: string }

function AlertDialogHeader(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="alert-dialog-header"
      class={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        props.class,
      )}
      {...rest}
    />
  )
}

function AlertDialogFooter(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="alert-dialog-footer"
      class={cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        props.class,
      )}
      {...rest}
    />
  )
}

function AlertDialogMedia(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="alert-dialog-media"
      class={cn(
        "mb-2 inline-flex size-16 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
        props.class,
      )}
      {...rest}
    />
  )
}

type AlertDialogTitleProps = Omit<AlertDialogPrimitive.Title.Props, "class"> & { class?: string }

function AlertDialogTitle(props: AlertDialogTitleProps) {
  const rest = omit(props, "class")
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      class={cn(
        "cn-font-heading text-lg font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        props.class,
      )}
      {...rest}
    />
  )
}

type AlertDialogDescriptionProps = Omit<AlertDialogPrimitive.Description.Props, "class"> & { class?: string }

function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  const rest = omit(props, "class")
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      class={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        props.class,
      )}
      {...rest}
    />
  )
}

function AlertDialogAction(props: ButtonProps) {
  const rest = omit(props, "class")
  return <Button data-slot="alert-dialog-action" class={cn(props.class)} {...rest} />
}

type AlertDialogCancelProps = Omit<AlertDialogPrimitive.Close.Props, "class"> &
  Pick<ButtonProps, "variant" | "size"> & { class?: string }

function AlertDialogCancel(props: AlertDialogCancelProps) {
  const rest = omit(props, "class", "variant", "size")
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      class={cn(props.class)}
      render={(p) => (
        <Button {...(p as ButtonProps)} variant={props.variant ?? "outline"} size={props.size ?? "default"} />
      )}
      {...rest}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
