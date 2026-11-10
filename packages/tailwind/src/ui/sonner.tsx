import { createSignal, For, omit, onSettled, Show, untrack, type Accessor } from "solid-js"
import type { JSX } from "@solidjs/web"
import { Toast as ToastPrimitive } from "base-ui-solidjs/toast"
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert, X } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

// shadcn's `sonner` wraps the React-only `sonner` package. This is sonner's API (`toast()`,
// `<Toaster />`) and look, built on base-ui-solidjs's toast manager, with shadcn's overrides
// (popover colors, `--radius`, lucide icons). Base UI provides the stacking data (`--toast-index`,
// `--toast-offset-y`, `--toast-frontmost-height`, `data-expanded`, `data-limited`) and swipe-to-dismiss.

// ---------------------------------------------------------------------------------------------
// toast()

type ToastTypes = "normal" | "action" | "success" | "info" | "warning" | "error" | "loading" | "default"

type Action = {
  label: JSX.Element
  onClick: (event: MouseEvent) => void
  actionButtonStyle?: JSX.CSSProperties
}

type ToastClassnames = {
  toast?: string
  title?: string
  description?: string
  loader?: string
  closeButton?: string
  cancelButton?: string
  actionButton?: string
  success?: string
  error?: string
  info?: string
  warning?: string
  loading?: string
  default?: string
  content?: string
  icon?: string
}

type ExternalToast = {
  id?: string | number
  description?: JSX.Element | (() => JSX.Element)
  duration?: number
  icon?: JSX.Element
  action?: Action | JSX.Element
  cancel?: Action | JSX.Element
  closeButton?: boolean
  richColors?: boolean
  invert?: boolean
  dismissible?: boolean
  important?: boolean
  unstyled?: boolean
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
  class?: string
  classNames?: ToastClassnames
  descriptionClassName?: string
  style?: JSX.CSSProperties
  actionButtonStyle?: JSX.CSSProperties
  cancelButtonStyle?: JSX.CSSProperties
  testId?: string
}

type ToastT = ExternalToast & {
  id: string
  title?: JSX.Element | (() => JSX.Element)
  type: ToastTypes
  jsx?: JSX.Element
  promise?: boolean
}

type SonnerData = { toast: ToastT; dismissedByUser?: boolean }

type PromiseState<Value> = JSX.Element | ((value: Value) => JSX.Element | Promise<JSX.Element>)

type PromiseData<Value> = ExternalToast & {
  loading?: JSX.Element
  success?: PromiseState<Value> | ((value: Value) => ExternalToast & { message?: JSX.Element })
  error?: PromiseState<unknown>
  description?: PromiseState<unknown>
  finally?: () => void | Promise<void>
}

const manager = ToastPrimitive.createToastManager<SonnerData>()
let counter = 0

const resolve = (value: JSX.Element | (() => JSX.Element)) => (typeof value === "function" ? (value as () => JSX.Element)() : value)

function create(type: ToastTypes, title: JSX.Element | (() => JSX.Element) | undefined, data?: ExternalToast): string {
  const id = data?.id != null ? String(data.id) : `sonner-${++counter}`
  const t: ToastT = { ...data, id, title, type }
  const options = {
    id,
    type,
    title: resolve(title),
    description: data?.description != null ? resolve(data.description) : undefined,
    timeout: type === "loading" ? 0 : data?.duration,
    priority: data?.important ? ("high" as const) : ("low" as const),
    data: { toast: t },
    onClose: () => {
      if (closedByUser.delete(id)) t.onDismiss?.(t)
      else t.onAutoClose?.(t)
    },
    onRemove: () => {
      liveIds.delete(id)
    },
  }
  if (liveIds.has(id)) {
    manager.update(id, options)
  } else {
    liveIds.add(id)
    manager.add(options)
  }
  return id
}

/** Ids of toasts that haven't been removed yet (re-using one updates that toast, like sonner). */
const liveIds = new Set<string>()
/** Ids closed by the user (close/action/cancel button, `toast.dismiss`) → `onDismiss`, else `onAutoClose`. */
const closedByUser = new Set<string>()

function dismissByUser(id: string) {
  closedByUser.add(id)
  manager.close(id)
}

function toastFunction(message: JSX.Element | (() => JSX.Element), data?: ExternalToast) {
  return create("default", message, data)
}

/**
 * sonner's `toast()`: `toast("Saved")`, `toast.success(...)`, `toast.promise(...)`, `toast.dismiss(id)`.
 * Each package has its own toast manager: render this package's `<Toaster />` once.
 */
const toast = Object.assign(toastFunction, {
  success: (message: JSX.Element | (() => JSX.Element), data?: ExternalToast) => create("success", message, data),
  info: (message: JSX.Element | (() => JSX.Element), data?: ExternalToast) => create("info", message, data),
  warning: (message: JSX.Element | (() => JSX.Element), data?: ExternalToast) => create("warning", message, data),
  error: (message: JSX.Element | (() => JSX.Element), data?: ExternalToast) => create("error", message, data),
  message: (message: JSX.Element | (() => JSX.Element), data?: ExternalToast) => create("default", message, data),
  loading: (message: JSX.Element | (() => JSX.Element), data?: ExternalToast) => create("loading", message, data),
  custom: (jsx: (id: string) => JSX.Element, data?: ExternalToast) => {
    const id = data?.id != null ? String(data.id) : `sonner-${++counter}`
    return create("default", () => jsx(id), { ...data, id, unstyled: data?.unstyled ?? true })
  },
  dismiss: (id?: string | number) => {
    if (id == null) {
      for (const live of [...liveIds]) dismissByUser(live)
    } else {
      dismissByUser(String(id))
    }
    return id
  },
  promise: <Value,>(promise: Promise<Value> | (() => Promise<Value>), data?: PromiseData<Value>) => {
    const p = typeof promise === "function" ? promise() : promise
    if (!data) return { unwrap: () => p }
    const id = create("loading", data.loading, { ...data, description: undefined, duration: undefined })
    const settle = async (type: "success" | "error", state: unknown, value: unknown) => {
      const resolved = typeof state === "function" ? await (state as (v: unknown) => unknown)(value) : state
      if (resolved == null) {
        manager.close(id)
        return
      }
      const isOptions = typeof resolved === "object" && !(resolved instanceof Node) && "message" in (resolved as object)
      const options = isOptions ? (resolved as ExternalToast & { message?: JSX.Element }) : undefined
      const description = typeof data.description === "function" ? await data.description(value) : data.description
      create(type, options ? options.message : (resolved as JSX.Element), {
        ...data,
        ...options,
        id,
        description: options?.description ?? description,
        duration: options?.duration ?? data.duration,
      })
    }
    p.then(
      (value) => settle("success", data.success, value),
      (error) => settle("error", data.error, error),
    ).finally(() => data.finally?.())
    return Object.assign(id, { unwrap: () => p })
  },
  getToasts: () => [...liveIds],
})

// ---------------------------------------------------------------------------------------------
// <Toaster />

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
type Offset = string | number | { top?: string | number; right?: string | number; bottom?: string | number; left?: string | number }

type ToastIcons = {
  success?: JSX.Element
  info?: JSX.Element
  warning?: JSX.Element
  error?: JSX.Element
  loading?: JSX.Element
  close?: JSX.Element
}

type ToasterProps = {
  id?: string
  invert?: boolean
  theme?: "light" | "dark" | "system"
  position?: Position
  hotkey?: string[]
  richColors?: boolean
  expand?: boolean
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  toastOptions?: {
    class?: string
    closeButton?: boolean
    descriptionClassName?: string
    style?: JSX.CSSProperties
    cancelButtonStyle?: JSX.CSSProperties
    actionButtonStyle?: JSX.CSSProperties
    duration?: number
    unstyled?: boolean
    classNames?: ToastClassnames
    closeButtonAriaLabel?: string
  }
  class?: string
  style?: JSX.CSSProperties
  offset?: Offset
  mobileOffset?: Offset
  dir?: "rtl" | "ltr" | "auto"
  icons?: ToastIcons
  containerAriaLabel?: string
}

const VIEWPORT_OFFSET = "24px"
const MOBILE_VIEWPORT_OFFSET = "16px"

function offsetVars(offset: Offset | undefined, fallback: string, prefix: string): JSX.CSSProperties {
  const px = (v: string | number) => (typeof v === "number" ? `${v}px` : v)
  const sides = ["top", "right", "bottom", "left"] as const
  const vars: Record<string, string> = {}
  for (const side of sides) {
    const value = offset == null ? fallback : typeof offset === "object" ? (offset[side] ?? fallback) : offset
    vars[`--${prefix}-${side}`] = px(value)
  }
  return vars as JSX.CSSProperties
}

/** Tracks the page's theme: the `dark` class on <html> (shadcn's convention), else the OS preference. */
function useSystemTheme(): Accessor<"light" | "dark"> {
  const read = (): "light" | "dark" => {
    if (typeof document === "undefined") return "light"
    const root = document.documentElement
    if (root.classList.contains("dark")) return "dark"
    if (root.classList.contains("light") || root.style.colorScheme === "light") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  const [theme, setTheme] = createSignal<"light" | "dark">(read())
  onSettled(() => {
    const observer = new MutationObserver(() => setTheme(read()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] })
    return () => observer.disconnect()
  })
  return theme
}

const defaultIcons = {
  success: () => <Icon icon={CircleCheck} class="size-4" />,
  info: () => <Icon icon={Info} class="size-4" />,
  warning: () => <Icon icon={TriangleAlert} class="size-4" />,
  error: () => <Icon icon={OctagonX} class="size-4" />,
  loading: () => <Icon icon={Loader2} class="size-4 animate-spin" />,
}

function Toaster(props: ToasterProps) {
  const systemTheme = useSystemTheme()
  const theme = () => (props.theme === "light" || props.theme === "dark" ? props.theme : systemTheme())
  const position = () => props.position ?? "bottom-right"
  const yPosition = () => position().split("-")[0] as "top" | "bottom"
  const xPosition = () => position().split("-")[1] as "left" | "right" | "center"
  const swipeDirection = (): Array<"up" | "down" | "left" | "right"> => {
    const directions: Array<"up" | "down" | "left" | "right"> = [yPosition() === "top" ? "up" : "down"]
    if (xPosition() !== "center") directions.push(xPosition() as "left" | "right")
    return directions
  }

  onSettled(() => {
    const hotkey = props.hotkey ?? ["altKey", "KeyT"]
    const onKeyDown = (event: KeyboardEvent) => {
      const pressed = hotkey.every((key) => (event as unknown as Record<string, unknown>)[key] || event.code === key)
      if (pressed) document.querySelector<HTMLElement>(`[data-sonner-toaster][data-y-position]`)?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  })

  return (
    <ToastPrimitive.Provider
      toastManager={manager}
      limit={props.visibleToasts ?? 3}
      timeout={props.toastOptions?.duration ?? props.duration ?? 4000}
    >
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          aria-label={props.containerAriaLabel ?? `Notifications ${(props.hotkey ?? ["altKey", "KeyT"]).join("+").replace(/Key/g, "").replace(/Digit/g, "")}`}
          data-sonner-toaster=""
          data-sonner-theme={theme()}
          data-y-position={yPosition()}
          data-x-position={xPosition()}
          dir={props.dir === "auto" ? undefined : (props.dir ?? "ltr")}
          id={props.id}
          class={cn(
            "toaster group group/sonner fixed z-[999999999] m-0 box-border w-(--width) list-none p-0 font-[ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe_UI,Roboto,Helvetica_Neue,Arial,Noto_Sans,sans-serif,Apple_Color_Emoji,Segoe_UI_Emoji,Segoe_UI_Symbol,Noto_Color_Emoji] outline-none",
            "data-[x-position=right]:right-(--offset-right) data-[x-position=left]:left-(--offset-left) data-[x-position=center]:left-1/2 data-[x-position=center]:-translate-x-1/2 data-[y-position=top]:top-(--offset-top) data-[y-position=bottom]:bottom-(--offset-bottom)",
            "max-[600px]:right-(--mobile-offset-right)! max-[600px]:left-(--mobile-offset-left)! max-[600px]:w-auto max-[600px]:translate-x-0 max-[600px]:data-[y-position=bottom]:bottom-(--mobile-offset-bottom) max-[600px]:data-[y-position=top]:top-(--mobile-offset-top)",
            // sonner's palette (`--normal-*` are replaced by shadcn's tokens below).
            "[--gray2:hsl(0,0%,97.3%)] [--gray5:hsl(0,0%,90.9%)] data-[sonner-theme=dark]:[--normal-bg-hover:hsl(0,0%,12%)] data-[sonner-theme=dark]:[--normal-border-hover:hsl(0,0%,25%)]",
            "[--success-bg:hsl(143,85%,96%)] [--success-border:hsl(145,92%,87%)] [--success-text:hsl(140,100%,27%)] [--info-bg:hsl(208,100%,97%)] [--info-border:hsl(221,91%,93%)] [--info-text:hsl(210,92%,45%)] [--warning-bg:hsl(49,100%,97%)] [--warning-border:hsl(49,91%,84%)] [--warning-text:hsl(31,92%,45%)] [--error-bg:hsl(359,100%,97%)] [--error-border:hsl(359,100%,94%)] [--error-text:hsl(360,100%,45%)]",
            "data-[sonner-theme=dark]:[--success-bg:hsl(150,100%,6%)] data-[sonner-theme=dark]:[--success-border:hsl(147,100%,12%)] data-[sonner-theme=dark]:[--success-text:hsl(150,86%,65%)] data-[sonner-theme=dark]:[--info-bg:hsl(215,100%,6%)] data-[sonner-theme=dark]:[--info-border:hsl(223,43%,17%)] data-[sonner-theme=dark]:[--info-text:hsl(216,87%,65%)] data-[sonner-theme=dark]:[--warning-bg:hsl(64,100%,6%)] data-[sonner-theme=dark]:[--warning-border:hsl(60,100%,9%)] data-[sonner-theme=dark]:[--warning-text:hsl(46,87%,65%)] data-[sonner-theme=dark]:[--error-bg:hsl(358,76%,10%)] data-[sonner-theme=dark]:[--error-border:hsl(357,89%,16%)] data-[sonner-theme=dark]:[--error-text:hsl(358,100%,81%)]",
            props.class,
          )}
          style={{
            "--width": "356px",
            "--gap": `${props.gap ?? 14}px`,
            ...offsetVars(props.offset, VIEWPORT_OFFSET, "offset"),
            ...offsetVars(props.mobileOffset, MOBILE_VIEWPORT_OFFSET, "mobile-offset"),
            // shadcn's overrides.
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
            ...props.style,
          }}
        >
          <ToastList toaster={props} theme={theme()} yPosition={yPosition()} xPosition={xPosition()} swipeDirection={swipeDirection()} />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

function isAction(value: unknown): value is Action {
  return typeof value === "object" && value !== null && "label" in value && "onClick" in value
}

function ToastList(props: {
  toaster: ToasterProps
  theme: "light" | "dark"
  yPosition: "top" | "bottom"
  xPosition: "left" | "right" | "center"
  swipeDirection: Array<"up" | "down" | "left" | "right">
}) {
  const toastManager = ToastPrimitive.useToastManager<SonnerData>()
  return (
    <For each={toastManager.toasts} keyed={(item) => item.id}>
      {(item) => (
        <SonnerToast
          item={item()}
          toaster={props.toaster}
          theme={props.theme}
          yPosition={props.yPosition}
          xPosition={props.xPosition}
          swipeDirection={props.swipeDirection}
        />
      )}
    </For>
  )
}

function SonnerToast(props: {
  item: ToastPrimitive.Root.Props["toast"]
  toaster: ToasterProps
  theme: "light" | "dark"
  yPosition: "top" | "bottom"
  xPosition: "left" | "right" | "center"
  swipeDirection: Array<"up" | "down" | "left" | "right">
}) {
  const t = () => (props.item.data as SonnerData | undefined)?.toast
  const type = () => (props.item.type ?? "default") as ToastTypes
  const options = () => props.toaster.toastOptions
  const classNames = () => ({ ...options()?.classNames, ...t()?.classNames })
  const unstyled = () => t()?.unstyled ?? options()?.unstyled ?? false
  const richColors = () => t()?.richColors ?? props.toaster.richColors ?? false
  const closeButton = () => t()?.closeButton ?? options()?.closeButton ?? props.toaster.closeButton ?? false
  const icon = () => {
    if (t()?.icon !== undefined) return t()?.icon
    const kind = type()
    if (kind === "default" || kind === "normal" || kind === "action") return undefined
    return props.toaster.icons?.[kind] ?? defaultIcons[kind as keyof typeof defaultIcons]?.()
  }
  const action = () => t()?.action
  const cancel = () => t()?.cancel

  return (
    <ToastPrimitive.Root
      toast={props.item}
      swipeDirection={props.swipeDirection}
      data-sonner-toast=""
      data-styled={unstyled() ? "false" : "true"}
      data-type={type()}
      data-rich-colors={richColors() ? "true" : "false"}
      data-invert={(t()?.invert ?? props.toaster.invert) ? "true" : "false"}
      data-y-position={props.yPosition}
      data-x-position={props.xPosition}
      data-expand={props.toaster.expand ? "true" : undefined}
      data-testid={t()?.testId}
      class={cn(
        "cn-toast group/sonner-toast pointer-events-auto absolute z-[calc(1000-var(--toast-index))] box-border outline-none [overflow-wrap:anywhere] select-none [--lift-amount:calc(var(--lift)*var(--gap))]",
        "[transition:transform_400ms,opacity_400ms,height_400ms,box-shadow_200ms]",
        // Position.
        "data-[y-position=bottom]:bottom-0 data-[y-position=bottom]:[--lift:-1] data-[y-position=top]:top-0 data-[y-position=top]:[--lift:1] data-[x-position=right]:right-0 data-[x-position=left]:left-0 data-[x-position=center]:inset-x-0 data-[x-position=center]:mx-auto max-[600px]:inset-x-0 max-[600px]:w-full!",
        // Collapsed stack: the toasts behind peek out by `--gap`, 5% smaller each, at the front toast's height.
        "h-(--toast-frontmost-height,var(--toast-height)) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--lift-amount)*var(--toast-index)))_scale(calc(1-var(--toast-index)*0.05))]",
        // Expanded (hover/focus, or `expand`): stacked by height with `--gap` between them.
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--lift)*(var(--toast-offset-y)+var(--toast-index)*var(--gap))))]",
        "data-[expand=true]:h-(--toast-height) data-[expand=true]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--lift)*(var(--toast-offset-y)+var(--toast-index)*var(--gap))))]",
        "after:absolute after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-[y-position=bottom]:after:bottom-full data-[y-position=top]:after:top-full",
        // Enter / exit.
        "data-starting-style:opacity-0 data-starting-style:[transform:translateY(calc(var(--lift)*-100%))]",
        "data-ending-style:opacity-0 data-ending-style:not-data-swipe-direction:[transform:translateY(calc(var(--lift)*-100%))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+100%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-100%))] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+100%))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-100%))]",
        "data-limited:pointer-events-none data-limited:opacity-0",
        // Content fades while collapsed behind the front toast.
        "*:transition-opacity *:duration-400 data-behind:not-data-expanded:not-data-[expand=true]:*:opacity-0",
        // Styled toast.
        "data-[styled=true]:flex data-[styled=true]:w-(--width) data-[styled=true]:items-center data-[styled=true]:gap-1.5 data-[styled=true]:rounded-(--border-radius) data-[styled=true]:border data-[styled=true]:border-(--normal-border) data-[styled=true]:bg-(--normal-bg) data-[styled=true]:p-4 data-[styled=true]:text-[13px] data-[styled=true]:text-(--normal-text) data-[styled=true]:shadow-[0px_4px_12px_rgba(0,0,0,0.1)] focus-visible:shadow-[0px_4px_12px_rgba(0,0,0,0.1),0_0_0_2px_rgba(0,0,0,0.2)]",
        "data-[invert=true]:[--normal-bg:#000] data-[invert=true]:[--normal-border:hsl(0,0%,20%)] data-[invert=true]:[--normal-text:hsl(0,0%,99%)] group-data-[sonner-theme=dark]/sonner:data-[invert=true]:[--normal-bg:#fff] group-data-[sonner-theme=dark]/sonner:data-[invert=true]:[--normal-border:hsl(0,0%,95.1%)] group-data-[sonner-theme=dark]/sonner:data-[invert=true]:[--normal-text:hsl(0,0%,9%)]",
        "data-[rich-colors=true]:data-[type=success]:border-(--success-border) data-[rich-colors=true]:data-[type=success]:bg-(--success-bg) data-[rich-colors=true]:data-[type=success]:text-(--success-text) data-[rich-colors=true]:data-[type=info]:border-(--info-border) data-[rich-colors=true]:data-[type=info]:bg-(--info-bg) data-[rich-colors=true]:data-[type=info]:text-(--info-text) data-[rich-colors=true]:data-[type=warning]:border-(--warning-border) data-[rich-colors=true]:data-[type=warning]:bg-(--warning-bg) data-[rich-colors=true]:data-[type=warning]:text-(--warning-text) data-[rich-colors=true]:data-[type=error]:border-(--error-border) data-[rich-colors=true]:data-[type=error]:bg-(--error-bg) data-[rich-colors=true]:data-[type=error]:text-(--error-text)",
        options()?.class,
        t()?.class,
        classNames().toast,
        classNames()[type() as keyof ToastClassnames],
      )}
      style={{ ...options()?.style, ...t()?.style }}
    >
      <Show when={closeButton() && !t()?.jsx}>
        <ToastPrimitive.Close
          aria-label={options()?.closeButtonAriaLabel ?? "Close toast"}
          data-close-button=""
          onClick={(event: MouseEvent) => {
            event.preventDefault()
            dismissByUser(props.item.id)
          }}
          class={cn(
            "absolute start-0 top-0 z-1 flex size-5 cursor-pointer items-center justify-center rounded-full border border-(--normal-border) bg-(--normal-bg) p-0 text-(--normal-text) [transform:translate(-35%,-35%)] transition-[opacity,background,border-color] duration-[100ms,200ms,200ms] rtl:[transform:translate(35%,-35%)] hover:border-(--gray5) hover:bg-(--gray2) focus-visible:shadow-[0px_4px_12px_rgba(0,0,0,0.1),0_0_0_2px_rgba(0,0,0,0.2)] group-data-[sonner-theme=dark]/sonner:hover:border-(--normal-border-hover) group-data-[sonner-theme=dark]/sonner:hover:bg-(--normal-bg-hover)",
            "group-data-[rich-colors=true]/sonner-toast:group-data-[type=success]/sonner-toast:border-(--success-border) group-data-[rich-colors=true]/sonner-toast:group-data-[type=success]/sonner-toast:bg-(--success-bg) group-data-[rich-colors=true]/sonner-toast:group-data-[type=success]/sonner-toast:text-(--success-text) group-data-[rich-colors=true]/sonner-toast:group-data-[type=info]/sonner-toast:border-(--info-border) group-data-[rich-colors=true]/sonner-toast:group-data-[type=info]/sonner-toast:bg-(--info-bg) group-data-[rich-colors=true]/sonner-toast:group-data-[type=info]/sonner-toast:text-(--info-text) group-data-[rich-colors=true]/sonner-toast:group-data-[type=warning]/sonner-toast:border-(--warning-border) group-data-[rich-colors=true]/sonner-toast:group-data-[type=warning]/sonner-toast:bg-(--warning-bg) group-data-[rich-colors=true]/sonner-toast:group-data-[type=warning]/sonner-toast:text-(--warning-text) group-data-[rich-colors=true]/sonner-toast:group-data-[type=error]/sonner-toast:border-(--error-border) group-data-[rich-colors=true]/sonner-toast:group-data-[type=error]/sonner-toast:bg-(--error-bg) group-data-[rich-colors=true]/sonner-toast:group-data-[type=error]/sonner-toast:text-(--error-text)",
            classNames().closeButton,
          )}
        >
          {props.toaster.icons?.close ?? <Icon icon={X} size={12} />}
        </ToastPrimitive.Close>
      </Show>
      <Show when={icon()}>
        <div data-icon="" class={cn("relative ms-[-3px] me-1 flex size-4 shrink-0 items-center justify-start *:shrink-0 [&_svg]:ms-[-1px]", classNames().icon)}>
          {icon()}
        </div>
      </Show>
      <div data-content="" class={cn("flex min-w-0 flex-1 flex-col gap-0.5", classNames().content)}>
        <ToastPrimitive.Title data-title="" class={cn("leading-normal font-medium text-inherit", classNames().title)} />
        <ToastPrimitive.Description
          data-description=""
          class={cn(
            "leading-[1.4] font-normal text-[#3f3f3f] group-data-[sonner-theme=dark]/sonner:text-[hsl(0,0%,91%)] group-data-[rich-colors=true]/sonner-toast:text-inherit",
            options()?.descriptionClassName,
            t()?.descriptionClassName,
            classNames().description,
          )}
        />
      </div>
      <Show when={cancel()}>
        {(c) => (
          <Show when={isAction(c())} fallback={c() as JSX.Element}>
            <button
              type="button"
              data-button=""
              data-cancel=""
              style={{ ...options()?.cancelButtonStyle, ...t()?.cancelButtonStyle }}
              onClick={(event) => {
                const value = untrack(c) as Action
                if (t()?.dismissible === false) return
                value.onClick(event)
                dismissByUser(props.item.id)
              }}
              class={cn(
                "ms-auto flex h-6 shrink-0 cursor-pointer items-center rounded-[4px] border-none bg-black/8 px-2 text-xs font-medium text-(--normal-text) outline-none [transition:opacity_400ms,box-shadow_200ms] focus-visible:shadow-[0_0_0_2px_rgba(0,0,0,0.4)] group-data-[sonner-theme=dark]/sonner:bg-white/30",
                classNames().cancelButton,
              )}
            >
              {(c() as Action).label}
            </button>
          </Show>
        )}
      </Show>
      <Show when={action()}>
        {(a) => (
          <Show when={isAction(a())} fallback={a() as JSX.Element}>
            <button
              type="button"
              data-button=""
              data-action=""
              style={{ ...options()?.actionButtonStyle, ...t()?.actionButtonStyle }}
              onClick={(event) => {
                const value = untrack(a) as Action
                value.onClick(event)
                if (event.defaultPrevented) return
                dismissByUser(props.item.id)
              }}
              class={cn(
                "ms-auto flex h-6 shrink-0 cursor-pointer items-center rounded-[4px] border-none bg-(--normal-text) px-2 text-xs font-medium text-(--normal-bg) outline-none [transition:opacity_400ms,box-shadow_200ms] focus-visible:shadow-[0_0_0_2px_rgba(0,0,0,0.4)] [[data-cancel]+&]:ms-0",
                classNames().actionButton,
              )}
            >
              {(a() as Action).label}
            </button>
          </Show>
        )}
      </Show>
    </ToastPrimitive.Root>
  )
}

export { Toaster, toast, type ToasterProps, type ExternalToast, type ToastT }
