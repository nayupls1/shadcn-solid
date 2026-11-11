import { createContext, createMemo, createSignal, merge, omit, onSettled, Show, useContext, type Accessor } from "solid-js"
import type { ComponentProps, JSX } from "@solidjs/web"
import { useRender } from "base-ui-solidjs/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { useIsMobile } from "../hooks/use-mobile"
import { Button, type ButtonProps } from "./button"
import { Input } from "./input"
import { Separator } from "./separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet"
import { Skeleton } from "./skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

/**
 * shadcn's context holds plain values; in Solid they're getters so readers stay reactive
 * (`const sidebar = useSidebar(); sidebar.open` tracks, don't destructure).
 */
type SidebarContextProps = {
  readonly state: "expanded" | "collapsed"
  readonly open: boolean
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void
  readonly openMobile: boolean
  setOpenMobile: (open: boolean | ((open: boolean) => boolean)) => void
  readonly isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

type DivProps = Omit<ComponentProps<"div">, "class"> & { class?: string }

type SidebarProviderProps = Omit<DivProps, "style"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  style?: JSX.CSSProperties
}

function SidebarProvider(props: SidebarProviderProps) {
  const rest = omit(props, "defaultOpen", "open", "onOpenChange", "class", "style", "children")
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = createSignal(false)

  // This is the internal state of the sidebar.
  // We use props.open and props.onOpenChange for control from outside the component.
  const [_open, _setOpen] = createSignal(props.defaultOpen ?? true)
  const open: Accessor<boolean> = () => props.open ?? _open()
  const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open()) : value
    if (props.onOpenChange) {
      props.onOpenChange(openState)
    } else {
      _setOpen(openState)
    }

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }

  // Helper to toggle the sidebar.
  const toggleSidebar = () => (isMobile() ? setOpenMobile((open) => !open) : setOpen((open) => !open))

  // Adds a keyboard shortcut to toggle the sidebar.
  onSettled(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = createMemo(() => (open() ? "expanded" : "collapsed"))

  const contextValue: SidebarContextProps = {
    get state() {
      return state()
    },
    get open() {
      return open()
    },
    setOpen,
    get isMobile() {
      return isMobile()
    },
    get openMobile() {
      return openMobile()
    },
    setOpenMobile,
    toggleSidebar,
  }

  return (
    <SidebarContext value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...props.style,
        }}
        class={cn("group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar", props.class)}
        {...rest}
      >
        {props.children}
      </div>
    </SidebarContext>
  )
}

type SidebarProps = DivProps & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

function Sidebar(props: SidebarProps) {
  const rest = omit(props, "side", "variant", "collapsible", "class", "children", "dir")
  const sidebar = useSidebar()
  const side = () => props.side ?? "left"
  const variant = () => props.variant ?? "sidebar"
  const collapsible = () => props.collapsible ?? "offcanvas"
  const floatingOrInset = () => variant() === "floating" || variant() === "inset"

  return (
    <Show
      when={collapsible() !== "none"}
      fallback={
        <div
          data-slot="sidebar"
          class={cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", props.class)}
          {...rest}
        >
          {props.children}
        </div>
      }
    >
      <Show
        when={!sidebar.isMobile}
        fallback={
          <Sheet open={sidebar.openMobile} onOpenChange={(open) => sidebar.setOpenMobile(open)}>
            <SheetContent
              dir={props.dir}
              data-sidebar="sidebar"
              data-slot="sidebar"
              data-mobile="true"
              class="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
              style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE }}
              side={side()}
            >
              <SheetHeader class="sr-only">
                <SheetTitle>Sidebar</SheetTitle>
                <SheetDescription>Displays the mobile sidebar.</SheetDescription>
              </SheetHeader>
              <div class="flex h-full w-full flex-col">{props.children}</div>
            </SheetContent>
          </Sheet>
        }
      >
        <div
          class="group peer hidden text-sidebar-foreground md:block"
          data-state={sidebar.state}
          data-collapsible={sidebar.state === "collapsed" ? collapsible() : ""}
          data-variant={variant()}
          data-side={side()}
          data-slot="sidebar"
        >
          {/* This is what handles the sidebar gap on desktop */}
          <div
            data-slot="sidebar-gap"
            class={cn(
              "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              floatingOrInset()
                ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
            )}
          />
          <div
            data-slot="sidebar-container"
            data-side={side()}
            class={cn(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
              // Adjust the padding for floating and inset variants.
              floatingOrInset()
                ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              props.class,
            )}
            {...rest}
          >
            <div
              data-sidebar="sidebar"
              data-slot="sidebar-inner"
              class="flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
            >
              {props.children}
            </div>
          </div>
        </div>
      </Show>
    </Show>
  )
}

function SidebarTrigger(props: ButtonProps) {
  const rest = omit(props, "class", "onClick")
  const sidebar = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      class={cn(props.class)}
      onClick={(event: MouseEvent) => {
        const onClick = props.onClick
        if (typeof onClick === "function") (onClick as (event: MouseEvent) => void)(event)
        sidebar.toggleSidebar()
      }}
      {...rest}
    >
      <Icon icon={PanelLeft} class="cn-rtl-flip" />
      <span class="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail(props: Omit<ComponentProps<"button">, "class"> & { class?: string }) {
  const rest = omit(props, "class")
  const sidebar = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabindex={-1}
      onClick={() => sidebar.toggleSidebar()}
      title="Toggle Sidebar"
      class={cn(
        "absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        props.class,
      )}
      {...rest}
    />
  )
}

function SidebarInset(props: Omit<ComponentProps<"main">, "class"> & { class?: string }) {
  const rest = omit(props, "class")
  return (
    <main
      data-slot="sidebar-inset"
      class={cn(
        "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        props.class,
      )}
      {...rest}
    />
  )
}

function SidebarInput(props: ComponentProps<typeof Input>) {
  const rest = omit(props, "class")
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      class={cn("h-8 w-full bg-background shadow-none", props.class as string)}
      {...rest}
    />
  )
}

function SidebarHeader(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div data-slot="sidebar-header" data-sidebar="header" class={cn("flex flex-col gap-2 p-2", props.class)} {...rest} />
  )
}

function SidebarFooter(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div data-slot="sidebar-footer" data-sidebar="footer" class={cn("flex flex-col gap-2 p-2", props.class)} {...rest} />
  )
}

function SidebarSeparator(props: ComponentProps<typeof Separator>) {
  const rest = omit(props, "class")
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      class={cn("mx-2 w-auto bg-sidebar-border", props.class as string)}
      {...rest}
    />
  )
}

function SidebarContent(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      class={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        props.class,
      )}
      {...rest}
    />
  )
}

function SidebarGroup(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      class={cn("relative flex w-full min-w-0 flex-col p-2", props.class)}
      {...rest}
    />
  )
}

type RenderProps<T extends keyof JSX.IntrinsicElements> = Omit<useRender.ComponentProps<T>, "class"> & {
  class?: string
}

function SidebarGroupLabel(props: RenderProps<"div">) {
  const rest = omit(props, "class", "render")
  return useRender({
    defaultTagName: "div",
    props: merge(rest, {
      get class() {
        return cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          props.class,
        )
      },
    }),
    get render() {
      return props.render
    },
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label",
    },
  })
}

function SidebarGroupAction(props: RenderProps<"button">) {
  const rest = omit(props, "class", "render")
  return useRender({
    defaultTagName: "button",
    props: merge(rest, {
      get class() {
        return cn(
          "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          props.class,
        )
      },
    }),
    get render() {
      return props.render
    },
    state: {
      slot: "sidebar-group-action",
      sidebar: "group-action",
    },
  })
}

function SidebarGroupContent(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      class={cn("w-full text-sm", props.class)}
      {...rest}
    />
  )
}

function SidebarMenu(props: Omit<ComponentProps<"ul">, "class"> & { class?: string }) {
  const rest = omit(props, "class")
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      class={cn("flex w-full min-w-0 flex-col gap-1", props.class)}
      {...rest}
    />
  )
}

function SidebarMenuItem(props: Omit<ComponentProps<"li">, "class"> & { class?: string }) {
  const rest = omit(props, "class")
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      class={cn("group/menu-item relative", props.class)}
      {...rest}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

type TooltipTriggerProps = ComponentProps<typeof TooltipTrigger>

type SidebarMenuButtonProps = RenderProps<"button"> & {
  isActive?: boolean
  tooltip?: string | ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>

function SidebarMenuButton(props: SidebarMenuButtonProps) {
  const rest = omit(props, "render", "isActive", "variant", "size", "tooltip", "class")
  const sidebar = useSidebar()
  const comp = (render: RenderProps<"button">["render"]) =>
    useRender({
      defaultTagName: "button",
      props: merge(rest, {
        get class() {
          return cn(sidebarMenuButtonVariants({ variant: props.variant, size: props.size }), props.class)
        },
      }),
      render,
      state: () => ({
        slot: "sidebar-menu-button",
        sidebar: "menu-button",
        size: props.size ?? "default",
        active: props.isActive ?? false,
      }),
    })

  const tooltipProps = (): ComponentProps<typeof TooltipContent> => {
    const tooltip = props.tooltip
    return typeof tooltip === "string" ? { children: tooltip } : (tooltip ?? {})
  }

  return (
    <Show when={props.tooltip} fallback={comp(props.render)}>
      <Tooltip>
        {/* shadcn: `render: <TooltipTrigger render={render} />`. The function form keeps Base UI's
            props (a component JSX element can't be used as `render` in Solid 2). */}
        {comp((p) => <TooltipTrigger {...(p as TooltipTriggerProps)} render={props.render} />)}
        <TooltipContent
          side="right"
          align="center"
          hidden={sidebar.state !== "collapsed" || sidebar.isMobile}
          {...tooltipProps()}
        />
      </Tooltip>
    </Show>
  )
}

type SidebarMenuActionProps = RenderProps<"button"> & {
  showOnHover?: boolean
}

function SidebarMenuAction(props: SidebarMenuActionProps) {
  const rest = omit(props, "class", "render", "showOnHover")
  return useRender({
    defaultTagName: "button",
    props: merge(rest, {
      get class() {
        return cn(
          "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          props.showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
          props.class,
        )
      },
    }),
    get render() {
      return props.render
    },
    state: {
      slot: "sidebar-menu-action",
      sidebar: "menu-action",
    },
  })
}

function SidebarMenuBadge(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      class={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:text-sidebar-accent-foreground",
        props.class,
      )}
      {...rest}
    />
  )
}

function SidebarMenuSkeleton(props: DivProps & { showIcon?: boolean }) {
  const rest = omit(props, "class", "showIcon")
  // Random width between 50 to 90%.
  const width = `${Math.floor(Math.random() * 40) + 50}%`

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      class={cn("flex h-8 items-center gap-2 rounded-md px-2", props.class)}
      {...rest}
    >
      <Show when={props.showIcon}>
        <Skeleton class="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />
      </Show>
      <Skeleton
        class="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={{ "--skeleton-width": width }}
      />
    </div>
  )
}

function SidebarMenuSub(props: Omit<ComponentProps<"ul">, "class"> & { class?: string }) {
  const rest = omit(props, "class")
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      class={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        props.class,
      )}
      {...rest}
    />
  )
}

function SidebarMenuSubItem(props: Omit<ComponentProps<"li">, "class"> & { class?: string }) {
  const rest = omit(props, "class")
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      class={cn("group/menu-sub-item relative", props.class)}
      {...rest}
    />
  )
}

type SidebarMenuSubButtonProps = RenderProps<"a"> & {
  size?: "sm" | "md"
  isActive?: boolean
}

function SidebarMenuSubButton(props: SidebarMenuSubButtonProps) {
  const rest = omit(props, "class", "render", "size", "isActive")
  return useRender({
    defaultTagName: "a",
    props: merge(rest, {
      get class() {
        return cn(
          "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
          props.class,
        )
      },
    }),
    get render() {
      return props.render
    },
    state: () => ({
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size: props.size ?? "md",
      active: props.isActive ?? false,
    }),
  })
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
