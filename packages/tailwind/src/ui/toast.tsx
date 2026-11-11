import { children, For, omit, Show } from "solid-js"
import { Toast as ToastPrimitive } from "base-ui-solidjs/toast"
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert, X } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

const toast = ToastPrimitive.createToastManager()

function ToastProvider(props: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal(props: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

type ToastViewportProps = Omit<ToastPrimitive.Viewport.Props, "class"> & { class?: string }

function ToastViewport(props: ToastViewportProps) {
  const rest = omit(props, "class")
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      class={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        props.class,
      )}
      {...rest}
    />
  )
}

type ToastProps = Omit<ToastPrimitive.Root.Props, "class"> & { class?: string }

function Toast(props: ToastProps) {
  const rest = omit(props, "class")
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      class={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        props.class,
      )}
      {...rest}
    />
  )
}

type ToastContentProps = Omit<ToastPrimitive.Content.Props, "class"> & { class?: string }

function ToastContent(props: ToastContentProps) {
  const rest = omit(props, "class")
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      class={cn(
        "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        props.class,
      )}
      {...rest}
    />
  )
}

type ToastTitleProps = Omit<ToastPrimitive.Title.Props, "class"> & { class?: string }

function ToastTitle(props: ToastTitleProps) {
  const rest = omit(props, "class")
  return <ToastPrimitive.Title data-slot="toast-title" class={cn("text-sm font-medium", props.class)} {...rest} />
}

type ToastDescriptionProps = Omit<ToastPrimitive.Description.Props, "class"> & { class?: string }

function ToastDescription(props: ToastDescriptionProps) {
  const rest = omit(props, "class")
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      class={cn("text-sm text-muted-foreground", props.class)}
      {...rest}
    />
  )
}

type ToastActionProps = Omit<ToastPrimitive.Action.Props, "class"> & { class?: string }

function ToastAction(props: ToastActionProps) {
  const rest = omit(props, "class", "render")
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={props.render ?? ((p) => <Button {...(p as ButtonProps)} variant="outline" size="sm" />)}
      class={cn("shrink-0", props.class)}
      {...rest}
    />
  )
}

type ToastCloseProps = Omit<ToastPrimitive.Close.Props, "class"> & { class?: string }

function ToastClose(props: ToastCloseProps) {
  const rest = omit(props, "class", "children", "render")
  // Resolved once: the render function re-reads `children` whenever the toast updates, and fresh
  // icon nodes on every read would retrigger Base UI's height observer in an endless loop.
  const content = children(() => props.children ?? <Icon icon={X} aria-hidden="true" />)
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={props.render ?? ((p) => <Button {...(p as ButtonProps)} variant="ghost" size="icon-sm" />)}
      class={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        props.class,
      )}
      {...rest}
    >
      {content()}
    </ToastPrimitive.Close>
  )
}

const toastIcons = {
  success: { icon: CircleCheck, class: undefined },
  info: { icon: Info, class: undefined },
  warning: { icon: TriangleAlert, class: undefined },
  error: { icon: OctagonX, class: "text-destructive" },
  loading: { icon: Loader2, class: "animate-spin" },
} as const

function ToastIcon(props: { type: string | undefined }) {
  const icon = () => toastIcons[props.type as keyof typeof toastIcons]
  return (
    <Show when={icon()}>
      {(i) => (
        <span
          data-slot="toast-icon"
          class="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
        >
          <Icon icon={i().icon} class={i().class} aria-hidden="true" />
        </span>
      )}
    </Show>
  )
}

function ToastList() {
  const manager = ToastPrimitive.useToastManager()

  return (
    <For each={manager.toasts} keyed={(toastItem) => toastItem.id}>
      {(toastItem) => (
        <Toast toast={toastItem()}>
          <ToastContent>
            <ToastIcon type={toastItem().type} />
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <ToastTitle />
              <ToastDescription />
            </div>
            <ToastAction />
            <ToastClose />
          </ToastContent>
        </Toast>
      )}
    </For>
  )
}

function Toaster(props: ToastPrimitive.Provider.Props) {
  const rest = omit(props, "children", "toastManager")
  return (
    <ToastProvider toastManager={props.toastManager ?? toast} {...rest}>
      {props.children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
