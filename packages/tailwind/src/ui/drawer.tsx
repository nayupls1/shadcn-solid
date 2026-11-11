import { createContext, omit, Show, useContext } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import { Drawer as DrawerPrimitive } from "base-ui-solidjs/drawer"
import { cn } from "../lib/utils"

/** shadcn's context holds plain values; here they're getters so readers stay reactive. */
type DrawerContextProps = {
  readonly hasSnapPoints: boolean
  readonly modal: DrawerPrimitive.Root.Props["modal"]
  readonly showSwipeHandle: boolean
  readonly swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>
}

const DrawerContext = createContext<DrawerContextProps | null>(null)

function useDrawer() {
  const context = useContext(DrawerContext)

  if (!context) {
    throw new Error("useDrawer must be used within a Drawer.")
  }

  return context
}

type DrawerProps = DrawerPrimitive.Root.Props & {
  showSwipeHandle?: boolean
}

function Drawer(props: DrawerProps) {
  const rest = omit(props, "modal", "showSwipeHandle", "snapPoints", "swipeDirection")
  const contextValue: DrawerContextProps = {
    get hasSnapPoints() {
      return props.snapPoints != null && props.snapPoints.length > 0
    },
    get modal() {
      return props.modal ?? true
    },
    get showSwipeHandle() {
      return props.showSwipeHandle ?? false
    },
    get swipeDirection() {
      return props.swipeDirection ?? "down"
    },
  }

  return (
    <DrawerContext value={contextValue}>
      <DrawerPrimitive.Root
        data-slot="drawer"
        modal={props.modal ?? true}
        snapPoints={props.snapPoints}
        swipeDirection={props.swipeDirection ?? "down"}
        {...rest}
      />
    </DrawerContext>
  )
}

function DrawerTrigger(props: ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal(props: ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose(props: ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

type DrawerOverlayProps = Omit<DrawerPrimitive.Backdrop.Props, "class"> & { class?: string }

function DrawerOverlay(props: DrawerOverlayProps) {
  const rest = omit(props, "class")
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      class={cn(
        "fixed inset-0 z-50 min-h-dvh bg-black/10 opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] select-none data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-snap-points:[--drawer-overlay-min-opacity:0.5] data-starting-style:opacity-0 data-swiping:duration-0 supports-backdrop-filter:backdrop-blur-xs supports-[-webkit-touch-callout:none]:absolute",
        props.class,
      )}
      {...rest}
    />
  )
}

type DivProps = Omit<ComponentProps<"div">, "class"> & { class?: string }

function DrawerSwipeHandle(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="drawer-swipe-handle"
      aria-hidden="true"
      class={cn(
        "relative z-10 flex shrink-0 cursor-grab transition-opacity duration-200 group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-[swipe-axis=x]/drawer-popup:h-full group-data-[swipe-axis=x]/drawer-popup:w-3 group-data-[swipe-axis=x]/drawer-popup:items-center group-data-[swipe-axis=y]/drawer-popup:h-3 group-data-[swipe-axis=y]/drawer-popup:w-full group-data-[swipe-axis=y]/drawer-popup:justify-center group-data-[swipe-direction=down]/drawer-popup:items-end group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:justify-start group-data-[swipe-direction=right]/drawer-popup:justify-end group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:items-start after:block after:shrink-0 after:rounded-full after:bg-muted group-data-[swipe-axis=x]/drawer-popup:after:h-[100px] group-data-[swipe-axis=x]/drawer-popup:after:w-1.5 group-data-[swipe-axis=y]/drawer-popup:after:h-1.5 group-data-[swipe-axis=y]/drawer-popup:after:w-[100px] active:cursor-grabbing",
        props.class,
      )}
      {...rest}
    />
  )
}

type DrawerContentProps = Omit<DrawerPrimitive.Popup.Props, "class"> & { class?: string }

function DrawerContent(props: DrawerContentProps) {
  const rest = omit(props, "class", "children")
  const drawer = useDrawer()
  const swipeAxis = () => (drawer.swipeDirection === "down" || drawer.swipeDirection === "up" ? "y" : "x")

  return (
    <DrawerPortal data-slot="drawer-portal">
      <Show when={drawer.modal === true}>
        <DrawerOverlay data-snap-points={drawer.hasSnapPoints ? "" : undefined} />
      </Show>
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        data-modal={String(drawer.modal)}
        class="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto"
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-popup"
          data-swipe-axis={swipeAxis()}
          data-snap-points={drawer.hasSnapPoints ? "" : undefined}
          class={cn(
            // Base.
            "group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] flex-col bg-popover text-sm text-popover-foreground transition-[transform,height,opacity,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform outline-none select-none [interpolate-size:allow-keywords] data-[swipe-direction=down]:rounded-t-xl data-[swipe-direction=down]:border-t data-[swipe-direction=left]:rounded-r-xl data-[swipe-direction=left]:border-r data-[swipe-direction=right]:rounded-l-xl data-[swipe-direction=right]:border-l data-[swipe-direction=up]:rounded-b-xl data-[swipe-direction=up]:border-b",
            // Nested.
            "data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95",
            // Bleed.
            "after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-popover)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full",
            // Sizing.
            "[--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem]",
            // Stack.
            "[--bleed:3rem] [--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))] [--stack-step:0.05]",
            // Transitions.
            "data-ending-style:transform-(--closed-transform) data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-nested-drawer-swiping:duration-0 data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:transform-(--closed-transform) data-swiping:duration-0 data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
            // Axis: y.
            "data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:data-nested-drawer-open:h-(--stack-height)",
            // Axis: x.
            "data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row",
            // Direction: down.
            "data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))]",
            // Direction: up.
            "data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))]",
            // Direction: left.
            "data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))]",
            // Direction: right.
            "data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))]",
            props.class,
          )}
          {...rest}
        >
          <Show when={drawer.showSwipeHandle}>
            <DrawerSwipeHandle />
          </Show>
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            class={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-swiping/drawer-popup:select-none",
            )}
          >
            {props.children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  )
}

function DrawerHeader(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="drawer-header"
      class={cn(
        "flex shrink-0 flex-col gap-0.5 p-4 pb-0 group-data-[swipe-axis=y]/drawer-popup:text-center md:gap-1.5 md:text-left",
        props.class,
      )}
      {...rest}
    />
  )
}

function DrawerFooter(props: DivProps) {
  const rest = omit(props, "class")
  return <div data-slot="drawer-footer" class={cn("mt-auto flex shrink-0 flex-col gap-2 p-4 pt-0", props.class)} {...rest} />
}

type DrawerTitleProps = Omit<DrawerPrimitive.Title.Props, "class"> & { class?: string }

function DrawerTitle(props: DrawerTitleProps) {
  const rest = omit(props, "class")
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      class={cn("cn-font-heading font-medium text-foreground", props.class)}
      {...rest}
    />
  )
}

type DrawerDescriptionProps = Omit<DrawerPrimitive.Description.Props, "class"> & { class?: string }

function DrawerDescription(props: DrawerDescriptionProps) {
  const rest = omit(props, "class")
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      class={cn("text-sm text-balance text-muted-foreground", props.class)}
      {...rest}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerSwipeHandle,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
