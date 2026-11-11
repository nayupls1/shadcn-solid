import { createContext, omit, Show, useContext } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { Drawer as DrawerPrimitive } from "base-ui-solidjs/drawer"
import { colors, radius } from "../tokens.stylex"
import { drawerPopupMarker } from "../lib/markers/drawer.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `drawer` (see the Tailwind variant for the source classes).
// - `data-[swipe-direction=*]:*` / `data-[swipe-axis=*]:*` / `data-snap-points:*` on the popup are picked in
//   JS from the drawer context (the popup carries the same attributes), including the `after:` bleed.
// - `group-data-*/drawer-popup:*` on the swipe handle, content and header → `drawerPopupMarker`
//   ancestor conditions (or the context for direction/axis).
// - Compound states are spelled out so they don't depend on condition order, e.g. Tailwind's
//   `data-swiping:duration-0 data-ending-style:data-swiping:duration-[...]` →
//   `:is([data-swiping]:not([data-ending-style]))`.

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const SWIPE_DURATION = "calc(var(--drawer-swipe-strength) * 400ms)"
const MD = "@media (min-width: 48rem)"

const styles = stylex.create({
  overlay: {
    position: { default: "fixed", "@supports (-webkit-touch-callout: none)": "absolute" },
    inset: 0,
    zIndex: 50,
    minHeight: "100dvh",
    backgroundColor: "rgb(0 0 0 / 0.1)",
    opacity: {
      default: "max(var(--drawer-overlay-min-opacity, 0), calc(1 - var(--drawer-swipe-progress)))",
      ":is([data-starting-style])": 0,
      ":is([data-ending-style])": 0,
    },
    transitionProperty: "opacity",
    transitionDuration: {
      default: "450ms",
      ":is([data-swiping]:not([data-ending-style]))": "0s",
      ":is([data-ending-style])": SWIPE_DURATION,
    },
    transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
    userSelect: "none",
    pointerEvents: { default: null, ":is([data-ending-style])": "none" },
    "--drawer-overlay-min-opacity": { default: null, ":is([data-snap-points])": "0.5" },
    backdropFilter: "blur(4px)",
  },
  viewport: {
    pointerEvents: { default: "none", ":is([data-modal=true])": "auto" },
    position: "fixed",
    inset: 0,
    zIndex: 50,
    userSelect: "none",
  },
  popup: {
    pointerEvents: "auto",
    position: "fixed",
    zIndex: 50,
    margin: "var(--drawer-inset, 0px)",
    display: "flex",
    height: "var(--drawer-content-height)",
    maxHeight: "var(--drawer-content-max-height, none)",
    minHeight: 0,
    width: "var(--drawer-content-width, auto)",
    transform: {
      default: "translate3d(var(--translate-x, 0px), var(--translate-y, 0px), 0) scale(var(--stack-scale))",
      ":is([data-starting-style])": "var(--closed-transform)",
      ":is([data-ending-style])": "var(--closed-transform)",
    },
    flexDirection: "column",
    backgroundColor: colors.popover,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.popoverForeground,
    transitionProperty: "transform, height, opacity, filter",
    transitionDuration: {
      default: "450ms",
      ":is([data-swiping]:not([data-ending-style]))": "0s",
      ":is([data-nested-drawer-swiping]:not([data-ending-style]))": "0s",
      ":is([data-ending-style])": SWIPE_DURATION,
    },
    transitionTimingFunction: EASE,
    willChange: "transform",
    outlineStyle: "none",
    userSelect: "none",
    opacity: { default: null, ":is([data-ending-style])": 0.9999 },
    overflow: { default: null, ":is([data-nested-drawer-open])": "hidden" },
    filter: { default: null, ":is([data-nested-drawer-open])": "brightness(0.95)" },
    // Sizing and stack variables.
    "--drawer-content-height": "var(--drawer-height, auto)",
    "--bleed": "3rem",
    "--peek": "1rem",
    "--stack-height": "var(--drawer-frontmost-height, var(--drawer-height, 0px))",
    "--stack-peek-offset": "max(0px, calc((var(--nested-drawers) - var(--stack-progress)) * var(--peek)))",
    "--stack-progress": "clamp(0, var(--drawer-swipe-progress), 1)",
    "--stack-scale-base": "max(0, calc(1 - (var(--nested-drawers) * var(--stack-step))))",
    "--stack-scale": "clamp(0, calc(var(--stack-scale-base) + (var(--stack-step) * var(--stack-progress))), 1)",
    "--stack-shrink": "calc(1 - var(--stack-scale))",
    "--stack-step": "0.05",
    "::after": {
      content: '""',
      pointerEvents: "none",
      position: "absolute",
      backgroundColor: `var(--drawer-bleed-background, ${colors.popover})`,
    },
  },
  axisY: {
    left: 0,
    right: 0,
    height: { default: "var(--drawer-content-height)", ":is([data-nested-drawer-open])": "var(--stack-height)" },
    "--drawer-content-max-height": "calc(100dvh - 6rem)",
    "::after": { left: 0, right: 0, height: "var(--bleed)" },
  },
  axisYSnapPoints: {
    "--drawer-content-height": "100dvh",
  },
  axisX: {
    top: 0,
    bottom: 0,
    flexDirection: "row",
    "--drawer-content-width": { default: "75%", "@media (min-width: 40rem)": "24rem" },
    "::after": { top: 0, bottom: 0, width: "var(--bleed)" },
  },
  down: {
    bottom: 0,
    transformOrigin: "bottom",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: colors.border,
    "--closed-transform": "translate3d(0, calc(100% + var(--drawer-inset, 0px) + 2px), 0)",
    "--translate-y":
      "calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y) - var(--stack-peek-offset) - (var(--stack-shrink) * var(--stack-height)))",
    "::after": { top: "100%" },
  },
  up: {
    top: 0,
    transformOrigin: "top",
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    "--closed-transform": "translate3d(0, calc(-100% - var(--drawer-inset, 0px) - 2px), 0)",
    "--translate-y":
      "calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y) + var(--stack-peek-offset) + (var(--stack-shrink) * var(--stack-height)))",
    "::after": { bottom: "100%" },
  },
  left: {
    left: 0,
    transformOrigin: "left",
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: colors.border,
    "--closed-transform": "translate3d(calc(-100% - var(--drawer-inset, 0px) - 2px), 0, 0)",
    "--translate-x": "calc(var(--drawer-swipe-movement-x) + var(--stack-peek-offset) + (var(--stack-shrink) * 100%))",
    "::after": { right: "100%" },
  },
  right: {
    right: 0,
    transformOrigin: "right",
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    borderLeftColor: colors.border,
    "--closed-transform": "translate3d(calc(100% + var(--drawer-inset, 0px) + 2px), 0, 0)",
    "--translate-x": "calc(var(--drawer-swipe-movement-x) - var(--stack-peek-offset) - (var(--stack-shrink) * 100%))",
    "::after": { left: "100%" },
  },
  handle: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexShrink: 0,
    cursor: { default: "grab", ":active": "grabbing" },
    transitionProperty: "opacity",
    transitionDuration: "200ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: {
      default: null,
      [stylex.when.ancestor(":is([data-nested-drawer-open]:not([data-nested-drawer-swiping]))", drawerPopupMarker)]: 0,
    },
    "::after": {
      content: '""',
      display: "block",
      flexShrink: 0,
      borderRadius: "9999px",
      backgroundColor: colors.muted,
    },
  },
  handleAxisX: {
    height: "100%",
    width: "0.75rem",
    alignItems: "center",
    "::after": { height: "100px", width: "0.375rem" },
  },
  handleAxisY: {
    height: "0.75rem",
    width: "100%",
    justifyContent: "center",
    "::after": { height: "0.375rem", width: "100px" },
  },
  handleDown: { alignItems: "flex-end" },
  handleUp: { order: 9999, alignItems: "flex-start" },
  handleLeft: { order: 9999, justifyContent: "flex-start" },
  handleRight: { justifyContent: "flex-end" },
  content: {
    display: "flex",
    minHeight: 0,
    flex: "1 1 0%",
    flexDirection: "column",
    overflow: "hidden",
    overscrollBehavior: "contain",
    borderRadius: "inherit",
    transitionProperty: "opacity",
    transitionDuration: "300ms",
    transitionTimingFunction: "cubic-bezier(0.45, 1.005, 0, 1.005)",
    userSelect: {
      default: "text",
      [stylex.when.ancestor(":is([data-swiping])", drawerPopupMarker)]: "none",
    },
    opacity: {
      default: null,
      [stylex.when.ancestor(":is([data-nested-drawer-open]:not([data-nested-drawer-swiping]))", drawerPopupMarker)]: 0,
    },
  },
  header: {
    display: "flex",
    flexShrink: 0,
    flexDirection: "column",
    gap: { default: "0.125rem", [MD]: "0.375rem" },
    paddingTop: "1rem",
    paddingInline: "1rem",
    paddingBottom: 0,
    textAlign: {
      default: null,
      [stylex.when.ancestor(":is([data-swipe-axis=y])", drawerPopupMarker)]: "center",
      [MD]: "left",
    },
  },
  footer: {
    marginTop: "auto",
    display: "flex",
    flexShrink: 0,
    flexDirection: "column",
    gap: "0.5rem",
    paddingBottom: "1rem",
    paddingInline: "1rem",
    paddingTop: 0,
  },
  title: {
    fontWeight: 500,
    color: colors.foreground,
  },
  description: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    textWrap: "balance",
    color: colors.mutedForeground,
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }
type SwipeDirection = NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>

/** shadcn's context holds plain values; here they're getters so readers stay reactive. */
type DrawerContextProps = {
  readonly hasSnapPoints: boolean
  readonly modal: DrawerPrimitive.Root.Props["modal"]
  readonly showSwipeHandle: boolean
  readonly swipeDirection: SwipeDirection
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

type DrawerOverlayProps = Omit<DrawerPrimitive.Backdrop.Props, "class"> & XStyle

function DrawerOverlay(props: DrawerOverlayProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.overlay, props.xstyle)
  return <DrawerPrimitive.Backdrop data-slot="drawer-overlay" {...rest} class={cx(attrs().class, props.class)} />
}

const directionStyles = { down: styles.down, up: styles.up, left: styles.left, right: styles.right }
const handleDirectionStyles = {
  down: styles.handleDown,
  up: styles.handleUp,
  left: styles.handleLeft,
  right: styles.handleRight,
}

const isAxisY = (direction: SwipeDirection) => direction === "down" || direction === "up"

type DivProps = Omit<ComponentProps<"div">, "class"> & XStyle

function DrawerSwipeHandle(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const drawer = useDrawer()
  const attrs = () =>
    stylex.attrs(
      styles.handle,
      isAxisY(drawer.swipeDirection) ? styles.handleAxisY : styles.handleAxisX,
      handleDirectionStyles[drawer.swipeDirection],
      props.xstyle,
    )
  return <div data-slot="drawer-swipe-handle" aria-hidden="true" {...rest} class={cx(attrs().class, props.class)} />
}

type DrawerContentProps = Omit<DrawerPrimitive.Popup.Props, "class"> & XStyle

function DrawerContent(props: DrawerContentProps) {
  const rest = omit(props, "class", "xstyle", "children")
  const drawer = useDrawer()
  const swipeAxis = () => (isAxisY(drawer.swipeDirection) ? "y" : "x")
  const popupStyles = () => [
    drawerPopupMarker,
    styles.popup,
    swipeAxis() === "y" ? styles.axisY : styles.axisX,
    swipeAxis() === "y" && drawer.hasSnapPoints ? styles.axisYSnapPoints : null,
    directionStyles[drawer.swipeDirection],
    props.xstyle,
  ]

  return (
    <DrawerPortal data-slot="drawer-portal">
      <Show when={drawer.modal === true}>
        <DrawerOverlay data-snap-points={drawer.hasSnapPoints ? "" : undefined} />
      </Show>
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        data-modal={String(drawer.modal)}
        class={stylex.attrs(styles.viewport).class}
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-popup"
          data-swipe-axis={swipeAxis()}
          data-snap-points={drawer.hasSnapPoints ? "" : undefined}
          {...rest}
          class={cx(stylex.attrs(popupStyles()).class, props.class)}
        >
          <Show when={drawer.showSwipeHandle}>
            <DrawerSwipeHandle />
          </Show>
          <DrawerPrimitive.Content data-slot="drawer-content" class={stylex.attrs(styles.content).class}>
            {props.children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  )
}

function DrawerHeader(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.header, props.xstyle)
  return <div data-slot="drawer-header" {...rest} class={cx(attrs().class, props.class)} />
}

function DrawerFooter(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.footer, props.xstyle)
  return <div data-slot="drawer-footer" {...rest} class={cx(attrs().class, props.class)} />
}

type DrawerTitleProps = Omit<DrawerPrimitive.Title.Props, "class"> & XStyle

function DrawerTitle(props: DrawerTitleProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.title, props.xstyle)
  return <DrawerPrimitive.Title data-slot="drawer-title" {...rest} class={cx(attrs().class, props.class)} />
}

type DrawerDescriptionProps = Omit<DrawerPrimitive.Description.Props, "class"> & XStyle

function DrawerDescription(props: DrawerDescriptionProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.description, props.xstyle)
  return <DrawerPrimitive.Description data-slot="drawer-description" {...rest} class={cx(attrs().class, props.class)} />
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
