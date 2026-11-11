import { children, For, omit, Show } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Toast as ToastPrimitive } from "base-ui-solidjs/toast"
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert, X } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { animate } from "../lib/animate"
import { cx } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

const toast = ToastPrimitive.createToastManager()

const shadowLg = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"

// Port of shadcn/ui's base-vega `toast` (see the Tailwind variant for the source classes).
// The stack, expand and swipe transforms are driven by Base UI's CSS variables (`--toast-index`,
// `--toast-offset-y`, `--toast-height`, `--toast-swipe-movement-*` on the root,
// `--toast-frontmost-height` on the viewport) and data attributes, which become attribute
// conditions here. Compound Tailwind variants (`data-expanded:data-ending-style:data-[swipe-direction=left]:`)
// become one `:is([a][b][c])` condition, which keeps the same selector specificity.
const styles = stylex.create({
  viewport: {
    pointerEvents: "none",
    position: "fixed",
    left: { default: "1rem", "@media (min-width: 40rem)": "auto" },
    right: "1rem",
    bottom: "1rem",
    zIndex: 50,
    marginInline: { default: "auto", "@media (min-width: 40rem)": 0 },
    width: { default: "auto", "@media (min-width: 40rem)": "100%" },
    maxWidth: "24rem",
    outline: "none",
  },
  toast: {
    "--gap": "0.75rem",
    "--height": "var(--toast-frontmost-height, var(--toast-height))",
    "--offset-y": "calc(var(--toast-offset-y) * -1 + calc(var(--toast-index) * var(--gap) * -1) + var(--toast-swipe-movement-y))",
    "--peek": "0.75rem",
    "--scale": "calc(max(0, 1 - (var(--toast-index) * 0.1)))",
    "--shrink": "calc(1 - var(--scale))",
    pointerEvents: "auto",
    position: "absolute",
    right: 0,
    bottom: 0,
    zIndex: "calc(1000 - var(--toast-index))",
    width: "100%",
    transformOrigin: "bottom",
    borderRadius: radius["2xl"],
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.border, ":focus-visible": colors.ring },
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    boxShadow: {
      default: shadowLg,
      ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent), ${shadowLg}`,
    },
    willChange: "transform",
    outline: "none",
    userSelect: "none",
    height: {
      default: "var(--height)",
      ":is([data-expanded])": "var(--toast-height)",
    },
    transform: {
      default:
        "translateX(var(--toast-swipe-movement-x)) translateY(calc(var(--toast-swipe-movement-y) - (var(--toast-index) * var(--peek)) - (var(--shrink) * var(--height)))) scale(var(--scale))",
      ":is([data-expanded])": "translateX(var(--toast-swipe-movement-x)) translateY(var(--offset-y))",
      ":is([data-starting-style])": "translateY(150%)",
      ":is([data-ending-style]:not([data-limited]):not([data-swipe-direction]))": "translateY(150%)",
      ":is([data-ending-style][data-swipe-direction=down])": "translateY(calc(var(--toast-swipe-movement-y) + 150%))",
      ":is([data-ending-style][data-swipe-direction=left])":
        "translateX(calc(var(--toast-swipe-movement-x) - 150%)) translateY(var(--offset-y))",
      ":is([data-ending-style][data-swipe-direction=right])":
        "translateX(calc(var(--toast-swipe-movement-x) + 150%)) translateY(var(--offset-y))",
      ":is([data-ending-style][data-swipe-direction=up])": "translateY(calc(var(--toast-swipe-movement-y) - 150%))",
      ":is([data-expanded][data-ending-style][data-swipe-direction=down])":
        "translateY(calc(var(--toast-swipe-movement-y) + 150%))",
      ":is([data-expanded][data-ending-style][data-swipe-direction=left])":
        "translateX(calc(var(--toast-swipe-movement-x) - 150%)) translateY(var(--offset-y))",
      ":is([data-expanded][data-ending-style][data-swipe-direction=right])":
        "translateX(calc(var(--toast-swipe-movement-x) + 150%)) translateY(var(--offset-y))",
      ":is([data-expanded][data-ending-style][data-swipe-direction=up])":
        "translateY(calc(var(--toast-swipe-movement-y) - 150%))",
    },
    opacity: { default: null, ":is([data-limited])": 0 },
    transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms, height 150ms",
    // `after:` fills the gap below the toast so hovering between expanded toasts keeps them expanded.
    "::after": {
      position: "absolute",
      top: "100%",
      left: 0,
      height: "calc(var(--gap) + 1px)",
      width: "100%",
      content: "''",
    },
  },
  content: {
    display: "flex",
    height: "100%",
    alignItems: "center",
    gap: "0.75rem",
    overflow: "hidden",
    padding: "1rem",
    transitionProperty: "opacity",
    transitionDuration: "250ms",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    // `data-behind:opacity-0 data-expanded:opacity-100`: expanded wins when both are set.
    opacity: {
      default: null,
      ":is([data-behind])": 0,
      ":is([data-behind][data-expanded])": 1,
      ":is([data-expanded])": 1,
    },
  },
  text: {
    display: "flex",
    minWidth: 0,
    flex: "1 1 0%",
    flexDirection: "column",
    gap: "0.25rem",
  },
  title: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
  },
  description: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.mutedForeground,
  },
  action: {
    flexShrink: 0,
  },
  close: {
    position: "relative",
    flexShrink: 0,
    color: { default: colors.mutedForeground, ":hover": colors.foreground },
    // `after:absolute after:-inset-2`: a larger hit area around the small close button.
    "::after": {
      position: "absolute",
      inset: "-0.5rem",
      content: "''",
    },
  },
  icon: {
    // `[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4`: `Icon` is 16px already.
    display: "inline-flex",
    flexShrink: 0,
  },
  svg: {
    pointerEvents: "none",
  },
  error: {
    color: colors.destructive,
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

function ToastProvider(props: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal(props: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

type ToastViewportProps = Omit<ToastPrimitive.Viewport.Props, "class"> & XStyle

function ToastViewport(props: ToastViewportProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.viewport, props.xstyle)
  return <ToastPrimitive.Viewport data-slot="toast-viewport" {...rest} class={cx(attrs().class, props.class)} />
}

type ToastProps = Omit<ToastPrimitive.Root.Props, "class"> & XStyle

function Toast(props: ToastProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.toast, props.xstyle)
  return <ToastPrimitive.Root data-slot="toast" {...rest} class={cx(attrs().class, props.class)} />
}

type ToastContentProps = Omit<ToastPrimitive.Content.Props, "class"> & XStyle

function ToastContent(props: ToastContentProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.content, props.xstyle)
  return <ToastPrimitive.Content data-slot="toast-content" {...rest} class={cx(attrs().class, props.class)} />
}

type ToastTitleProps = Omit<ToastPrimitive.Title.Props, "class"> & XStyle

function ToastTitle(props: ToastTitleProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.title, props.xstyle)
  return <ToastPrimitive.Title data-slot="toast-title" {...rest} class={cx(attrs().class, props.class)} />
}

type ToastDescriptionProps = Omit<ToastPrimitive.Description.Props, "class"> & XStyle

function ToastDescription(props: ToastDescriptionProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.description, props.xstyle)
  return (
    <ToastPrimitive.Description data-slot="toast-description" {...rest} class={cx(attrs().class, props.class)} />
  )
}

type ToastActionProps = Omit<ToastPrimitive.Action.Props, "class"> & XStyle

/**
 * The default render is shadcn's `<Button variant="outline" size="sm" />`. Its styles are merged into
 * the Button through `xstyle` (two StyleX class lists on one element would conflict); a custom
 * `render` gets them as a class instead.
 */
function ToastAction(props: ToastActionProps) {
  const rest = omit(props, "class", "xstyle", "render")
  const ownClass = () => cx(stylex.attrs(styles.action, props.xstyle).class, props.class)
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={
        props.render ??
        ((p) => <Button {...(p as ButtonProps)} variant="outline" size="sm" xstyle={[styles.action, props.xstyle]} />)
      }
      {...rest}
      class={props.render ? ownClass() : props.class}
    />
  )
}

type ToastCloseProps = Omit<ToastPrimitive.Close.Props, "class"> & XStyle

/** Like `ToastAction`: the default ghost icon Button receives the close styles through `xstyle`. */
function ToastClose(props: ToastCloseProps) {
  const rest = omit(props, "class", "xstyle", "children", "render")
  const ownClass = () => cx(stylex.attrs(styles.close, props.xstyle).class, props.class)
  // Resolved once: the render function re-reads `children` whenever the toast updates, and fresh
  // icon nodes on every read would retrigger Base UI's height observer in an endless loop.
  const content = children(() => props.children ?? <Icon icon={X} aria-hidden="true" {...stylex.attrs(styles.svg)} />)
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={
        props.render ??
        ((p) => <Button {...(p as ButtonProps)} variant="ghost" size="icon-sm" xstyle={[styles.close, props.xstyle]} />)
      }
      {...rest}
      class={props.render ? ownClass() : props.class}
    >
      {content()}
    </ToastPrimitive.Close>
  )
}

const toastIcons = {
  success: { icon: CircleCheck, style: undefined },
  info: { icon: Info, style: undefined },
  warning: { icon: TriangleAlert, style: undefined },
  error: { icon: OctagonX, style: styles.error },
  loading: { icon: Loader2, style: animate.spin },
} as const

function ToastIcon(props: { type: string | undefined }) {
  const icon = () => toastIcons[props.type as keyof typeof toastIcons]
  return (
    <Show when={icon()}>
      {(i) => (
        <span data-slot="toast-icon" {...stylex.attrs(styles.icon)}>
          <Icon icon={i().icon} aria-hidden="true" {...stylex.attrs(styles.svg, i().style)} />
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
            <div {...stylex.attrs(styles.text)}>
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
