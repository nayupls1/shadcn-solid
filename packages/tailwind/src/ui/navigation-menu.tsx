import { omit } from "solid-js"
import { NavigationMenu as NavigationMenuPrimitive } from "base-ui-solidjs/navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

type NavigationMenuProps = Omit<NavigationMenuPrimitive.Root.Props, "class"> &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align"> & { class?: string }

function NavigationMenu(props: NavigationMenuProps) {
  const rest = omit(props, "align", "class", "children")
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      class={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", props.class)}
      {...rest}
    >
      {props.children}
      <NavigationMenuPositioner align={props.align ?? "start"} />
    </NavigationMenuPrimitive.Root>
  )
}

type NavigationMenuListProps = Omit<NavigationMenuPrimitive.List.Props, "class"> & { class?: string }

function NavigationMenuList(props: NavigationMenuListProps) {
  const rest = omit(props, "class")
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      class={cn("group flex flex-1 list-none items-center justify-center gap-0", props.class)}
      {...rest}
    />
  )
}

type NavigationMenuItemProps = Omit<NavigationMenuPrimitive.Item.Props, "class"> & { class?: string }

function NavigationMenuItem(props: NavigationMenuItemProps) {
  const rest = omit(props, "class")
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" class={cn("relative", props.class)} {...rest} />
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted",
)

type NavigationMenuTriggerProps = Omit<NavigationMenuPrimitive.Trigger.Props, "class"> & { class?: string }

function NavigationMenuTrigger(props: NavigationMenuTriggerProps) {
  const rest = omit(props, "class", "children")
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      class={cn(navigationMenuTriggerStyle(), "group", props.class)}
      {...rest}
    >
      {props.children}{" "}
      <Icon
        icon={ChevronDown}
        class="relative top-px ml-1 size-3 transition duration-300 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

type NavigationMenuContentProps = Omit<NavigationMenuPrimitive.Content.Props, "class"> & { class?: string }

function NavigationMenuContent(props: NavigationMenuContentProps) {
  const rest = omit(props, "class")
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      class={cn(
        "data-ending-style:data-activation-direction=left:translate-x-[50%] data-ending-style:data-activation-direction=right:translate-x-[-50%] data-starting-style:data-activation-direction=left:translate-x-[-50%] data-starting-style:data-activation-direction=right:translate-x-[50%] h-full w-auto p-2 pr-2.5 transition-[opacity,transform,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:ring-foreground/10 group-data-[viewport=false]/navigation-menu:duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none group-data-[viewport=false]/navigation-menu:data-open:animate-in group-data-[viewport=false]/navigation-menu:data-open:fade-in-0 group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-closed:animate-out group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0 group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95",
        props.class,
      )}
      {...rest}
    />
  )
}

type NavigationMenuPositionerProps = Omit<NavigationMenuPrimitive.Positioner.Props, "class"> & { class?: string }

function NavigationMenuPositioner(props: NavigationMenuPositionerProps) {
  const rest = omit(props, "class", "side", "sideOffset", "align", "alignOffset")
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 8}
        align={props.align ?? "start"}
        alignOffset={props.alignOffset ?? 0}
        class={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0",
          props.class,
        )}
        {...rest}
      >
        <NavigationMenuPrimitive.Popup class="data-[ending-style]:easing-[ease] xs:w-(--popup-width) relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg bg-popover text-popover-foreground shadow ring-1 ring-foreground/10 transition-[opacity,transform,width,height,scale,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-90 data-starting-style:opacity-0">
          <NavigationMenuPrimitive.Viewport class="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

type NavigationMenuLinkProps = Omit<NavigationMenuPrimitive.Link.Props, "class"> & { class?: string }

function NavigationMenuLink(props: NavigationMenuLinkProps) {
  const rest = omit(props, "class")
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      class={cn(
        "flex items-center gap-1.5 rounded-md p-2 text-sm transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-sm data-[active=true]:bg-muted/50 data-[active=true]:hover:bg-muted data-[active=true]:focus:bg-muted [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      {...rest}
    />
  )
}

type NavigationMenuIndicatorProps = Omit<NavigationMenuPrimitive.Icon.Props, "class"> & { class?: string }

function NavigationMenuIndicator(props: NavigationMenuIndicatorProps) {
  const rest = omit(props, "class")
  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-indicator"
      class={cn(
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
        props.class,
      )}
      {...rest}
    >
      <div class="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Icon>
  )
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
}
