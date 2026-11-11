import { createContext, createSignal, omit, onSettled, useContext } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { AlertDialog as AlertDialogPrimitive } from "base-ui-solidjs/alert-dialog"
import { colors, radius } from "../tokens.stylex"
import { animate } from "../lib/animate"
import { cx } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

// Port of shadcn/ui's base-vega `alert-dialog` (see the Tailwind variant for the source classes).
//
// The Tailwind variant styles the header, footer, media and title from the content's
// `group-data-[size=*]/alert-dialog-content` and `has-data-[slot=alert-dialog-media]` (header) /
// `group-has-data-[slot=alert-dialog-media]/alert-dialog-content` (title). StyleX has no
// ancestor/descendant selectors, so AlertDialogContent provides its `size` through a context, and
// AlertDialogMedia registers itself in that context while mounted (`hasMedia`). The parts pick their
// styles from it.
type Size = "default" | "sm"

type ContentContext = {
  size: () => Size
  hasMedia: () => boolean
  registerMedia: () => () => void
}

// `null` outside AlertDialogContent: the parts then get their base styles only, like the Tailwind variant.
const AlertDialogContentContext = createContext<ContentContext | null>(null)

const sm = "@media (min-width: 40rem)"
const md = "@media (min-width: 48rem)"

const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    isolation: "isolate",
    zIndex: 50,
    backgroundColor: "rgb(0 0 0 / 0.1)",
    backdropFilter: "blur(4px)",
    transitionDuration: "100ms",
    animationDuration: "100ms",
  },
  content: {
    position: "fixed",
    top: "50%",
    left: "50%",
    zIndex: 50,
    display: "grid",
    width: "100%",
    translate: "-50% -50%",
    gap: "1.5rem",
    borderRadius: radius.xl,
    backgroundColor: colors.popover,
    padding: "1.5rem",
    color: colors.popoverForeground,
    boxShadow: `0 0 0 1px color-mix(in oklch, ${colors.foreground} 10%, transparent)`,
    transitionDuration: "100ms",
    animationDuration: "100ms",
    outline: "none",
  },
  // data-[size=default]:max-w-xs data-[size=default]:sm:max-w-lg
  contentDefault: {
    maxWidth: { default: "20rem", [sm]: "32rem" },
  },
  // data-[size=sm]:max-w-xs
  contentSm: {
    maxWidth: "20rem",
  },
  header: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    placeItems: "center",
    gap: "0.375rem",
    textAlign: "center",
  },
  // has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6
  headerMedia: {
    gridTemplateRows: "auto auto 1fr",
    columnGap: "1.5rem",
  },
  // sm:group-data-[size=default]/alert-dialog-content:place-items-start / :text-left
  headerDefault: {
    placeItems: { default: "center", [sm]: "start" },
    textAlign: { default: "center", [sm]: "left" },
  },
  // sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]
  headerDefaultMedia: {
    gridTemplateRows: { default: "auto auto 1fr", [sm]: "auto 1fr" },
  },
  footer: {
    display: "flex",
    flexDirection: { default: "column-reverse", [sm]: "row" },
    justifyContent: { default: null, [sm]: "flex-end" },
    gap: "0.5rem",
  },
  // group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2
  footerSm: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  media: {
    marginBottom: "0.5rem",
    display: "inline-flex",
    width: "4rem",
    height: "4rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },
  // sm:group-data-[size=default]/alert-dialog-content:row-span-2
  mediaDefault: {
    gridRow: { default: null, [sm]: "span 2 / span 2" },
  },
  title: {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    fontWeight: 500,
  },
  // sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2
  titleDefaultMedia: {
    gridColumnStart: { default: null, [sm]: 2 },
  },
  description: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    textWrap: { default: "balance", [md]: "pretty" },
    color: colors.mutedForeground,
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal(props: AlertDialogPrimitive.Portal.Props) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

type AlertDialogOverlayProps = Omit<AlertDialogPrimitive.Backdrop.Props, "class"> & XStyle

function AlertDialogOverlay(props: AlertDialogOverlayProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(animate.openClosed, animate.fadeIn0, animate.fadeOut0, styles.overlay, props.xstyle)
  return <AlertDialogPrimitive.Backdrop data-slot="alert-dialog-overlay" {...rest} class={cx(attrs().class, props.class)} />
}

type AlertDialogContentProps = Omit<AlertDialogPrimitive.Popup.Props, "class"> & XStyle & { size?: Size }

function AlertDialogContent(props: AlertDialogContentProps) {
  const rest = omit(props, "class", "xstyle", "size")
  const [mediaCount, setMediaCount] = createSignal(0)
  const size = () => props.size ?? "default"
  const isSm = () => size() === "sm"
  const ctx: ContentContext = {
    size,
    hasMedia: () => mediaCount() > 0,
    registerMedia: () => {
      setMediaCount((c) => c + 1)
      return () => setMediaCount((c) => c - 1)
    },
  }
  const attrs = () =>
    stylex.attrs(
      animate.openClosed,
      animate.fadeIn0,
      animate.fadeOut0,
      animate.zoomIn95,
      animate.zoomOut95,
      styles.content,
      isSm() ? styles.contentSm : styles.contentDefault,
      props.xstyle,
    )
  return (
    <AlertDialogContentContext value={ctx}>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Popup
          data-slot="alert-dialog-content"
          data-size={size()}
          {...rest}
          class={cx(attrs().class, props.class)}
        />
      </AlertDialogPortal>
    </AlertDialogContentContext>
  )
}

type DivProps = Omit<ComponentProps<"div">, "class"> & XStyle

function AlertDialogHeader(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const ctx = useContext(AlertDialogContentContext)
  const media = () => !!ctx?.hasMedia()
  const sizeDefault = () => ctx?.size() === "default"
  const defaultMedia = () => media() && sizeDefault()
  const attrs = () =>
    stylex.attrs(
      styles.header,
      media() && styles.headerMedia,
      sizeDefault() && styles.headerDefault,
      defaultMedia() && styles.headerDefaultMedia,
      props.xstyle,
    )
  return <div data-slot="alert-dialog-header" {...rest} class={cx(attrs().class, props.class)} />
}

function AlertDialogFooter(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const ctx = useContext(AlertDialogContentContext)
  const sizeSm = () => ctx?.size() === "sm"
  const attrs = () => stylex.attrs(styles.footer, sizeSm() && styles.footerSm, props.xstyle)
  return <div data-slot="alert-dialog-footer" {...rest} class={cx(attrs().class, props.class)} />
}

/**
 * shadcn sizes the icon inside with `*:[svg:not([class*='size-'])]:size-8`; StyleX can't style
 * children, so give the icon its size directly: `<Icon icon={...} size={32} />`.
 */
function AlertDialogMedia(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const ctx = useContext(AlertDialogContentContext)
  onSettled(() => ctx?.registerMedia())
  const sizeDefault = () => ctx?.size() === "default"
  const attrs = () => stylex.attrs(styles.media, sizeDefault() && styles.mediaDefault, props.xstyle)
  return <div data-slot="alert-dialog-media" {...rest} class={cx(attrs().class, props.class)} />
}

type AlertDialogTitleProps = Omit<AlertDialogPrimitive.Title.Props, "class"> & XStyle

function AlertDialogTitle(props: AlertDialogTitleProps) {
  const rest = omit(props, "class", "xstyle")
  const ctx = useContext(AlertDialogContentContext)
  const defaultMedia = () => !!ctx?.hasMedia() && ctx?.size() === "default"
  const attrs = () => stylex.attrs(styles.title, defaultMedia() && styles.titleDefaultMedia, props.xstyle)
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" {...rest} class={cx(attrs().class, props.class)} />
}

type AlertDialogDescriptionProps = Omit<AlertDialogPrimitive.Description.Props, "class"> & XStyle

/** shadcn's `*:[a]:underline` link styling has no StyleX equivalent; style links in the description directly. */
function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.description, props.xstyle)
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      {...rest}
      class={cx(attrs().class, props.class)}
    />
  )
}

function AlertDialogAction(props: ButtonProps) {
  return <Button data-slot="alert-dialog-action" {...props} />
}

type AlertDialogCancelProps = Omit<AlertDialogPrimitive.Close.Props, "class"> &
  Pick<ButtonProps, "variant" | "size"> &
  XStyle

function AlertDialogCancel(props: AlertDialogCancelProps) {
  const rest = omit(props, "class", "xstyle", "variant", "size")
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      class={props.class}
      render={(p) => (
        <Button
          {...(p as ButtonProps)}
          variant={props.variant ?? "outline"}
          size={props.size ?? "default"}
          xstyle={props.xstyle}
        />
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
