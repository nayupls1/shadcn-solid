import { createContext, omit, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { colors, radius } from "../tokens.stylex"
import { sxMerge } from "../lib/sx"
import { shimmerStyles } from "../lib/shimmer"
import { Button, type ButtonProps } from "./button"
import { renderProps } from "@shadcn-solid/primitives/render-props"

// Port of shadcn/ui's base-vega `attachment` (see the Tailwind variant for the source classes).
// The parts read the attachment's state, size and orientation from context instead of
// `group-data-*/attachment`. Rules for arbitrary children have no StyleX equivalent: give the
// `<img>` in an image `AttachmentMedia` `aspect-ratio: 1; width: 100%; object-fit: cover` and size
// icons with `Icon`'s `size`. `AttachmentGroup`'s `scroll-fade-x` edge mask isn't ported.

type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done"
type AttachmentSize = "default" | "sm" | "xs"
type AttachmentOrientation = "horizontal" | "vertical"

type AttachmentContextValue = {
  state: () => AttachmentState
  size: () => AttachmentSize
  orientation: () => AttachmentOrientation
}

const AttachmentContext = createContext<AttachmentContextValue>({
  state: () => "done",
  size: () => "default",
  orientation: () => "horizontal",
})
const InGroupContext = createContext(false)

// In Tailwind's output the media padding (`has-data-[slot=attachment-media]:p-*`) comes after the
// content padding, so it wins when both are present.
const HAS_CONTENT = ":has([data-slot=attachment-content])"
const CONTENT_ONLY = ":not(:has([data-slot=attachment-media])):has([data-slot=attachment-content])"
const HAS_MEDIA = ":has([data-slot=attachment-media])"

const styles = stylex.create({
  attachment: {
    position: "relative",
    display: "flex",
    width: "fit-content",
    maxWidth: "100%",
    minWidth: 0,
    flexShrink: 0,
    flexWrap: "wrap",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: { default: "solid", ":is([data-state=idle])": "dashed" },
    borderColor: {
      default: colors.border,
      ":is([data-state=error])": `color-mix(in oklch, ${colors.destructive} 30%, transparent)`,
    },
    backgroundColor: {
      default: colors.card,
      ":has(> a, > button):hover": `color-mix(in oklch, ${colors.muted} 50%, transparent)`,
    },
    color: colors.cardForeground,
    transitionProperty: "color, background-color, border-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: {
      default: null,
      ":focus-within": `0 0 0 1px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
    },
  },
  inGroup: { flex: "none", scrollSnapAlign: "start" },
  sizeDefault: {
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    paddingInline: { default: null, [CONTENT_ONLY]: "0.625rem", [HAS_MEDIA]: "0.5rem" },
    paddingBlock: { default: null, [CONTENT_ONLY]: "0.5rem", [HAS_MEDIA]: "0.5rem" },
  },
  sizeSm: {
    gap: "0.625rem",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    paddingInline: { default: null, [CONTENT_ONLY]: "0.5rem", [HAS_MEDIA]: "0.375rem" },
    paddingBlock: { default: null, [CONTENT_ONLY]: "0.375rem", [HAS_MEDIA]: "0.375rem" },
  },
  sizeXs: {
    gap: "0.375rem",
    borderRadius: radius.lg,
    fontSize: "0.75rem",
    lineHeight: "1rem",
    paddingInline: { default: null, [CONTENT_ONLY]: "0.375rem", [HAS_MEDIA]: "0.25rem" },
    paddingBlock: { default: null, [CONTENT_ONLY]: "0.25rem", [HAS_MEDIA]: "0.25rem" },
  },
  horizontal: { minWidth: "10rem", alignItems: "center" },
  vertical: {
    width: { default: "6rem", [HAS_CONTENT]: "7.5rem" },
    flexDirection: "column",
  },
  media: {
    position: "relative",
    display: "flex",
    aspectRatio: "1 / 1",
    width: "2.5rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    color: colors.foreground,
  },
  mediaVertical: { width: "100%" },
  mediaSm: { width: "2rem" },
  mediaXs: { width: "1.75rem", borderRadius: radius.md },
  mediaError: {
    backgroundColor: `color-mix(in oklch, ${colors.destructive} 10%, transparent)`,
    color: colors.destructive,
  },
  mediaImage: { opacity: 0.6 },
  mediaImageSettled: { opacity: 1 },
  content: { maxWidth: "100%", minWidth: 0, flex: "1 1 0%", lineHeight: 1.25 },
  contentVertical: { paddingInline: "0.25rem" },
  title: {
    display: "block",
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 500,
  },
  description: {
    marginTop: "0.125rem",
    display: "block",
    minWidth: 0,
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    color: colors.mutedForeground,
  },
  descriptionError: { color: `color-mix(in oklch, ${colors.destructive} 80%, transparent)` },
  actions: { position: "relative", zIndex: 20, display: "flex", flexShrink: 0, alignItems: "center" },
  actionsVertical: { position: "absolute", top: "0.75rem", right: "0.75rem", gap: "0.25rem" },
  trigger: {
    position: "absolute",
    inset: 0,
    zIndex: 10,
    outline: "none",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  group: {
    display: "flex",
    minWidth: 0,
    scrollSnapType: "x mandatory",
    scrollPaddingInline: "0.25rem",
    scrollbarWidth: "none",
    gap: "0.75rem",
    overflowX: "auto",
    overscrollBehaviorX: "contain",
    paddingBlock: "0.25rem",
  },
})

const sizeStyles = { default: styles.sizeDefault, sm: styles.sizeSm, xs: styles.sizeXs }

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }
type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & XStyle
type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & XStyle

type AttachmentProps = DivProps & {
  state?: AttachmentState
  size?: AttachmentSize | null
  orientation?: AttachmentOrientation | null
}

function Attachment(props: AttachmentProps) {
  const rest = omit(props, "class", "style", "state", "size", "orientation", "xstyle")
  const inGroup = useContext(InGroupContext)
  const ctx: AttachmentContextValue = {
    state: () => props.state ?? "done",
    size: () => props.size ?? "default",
    orientation: () => props.orientation ?? "horizontal",
  }
  const a = () =>
    sxMerge(
      [
        styles.attachment,
        sizeStyles[ctx.size()],
        ctx.orientation() === "vertical" ? styles.vertical : styles.horizontal,
        inGroup && styles.inGroup,
        props.xstyle,
      ],
      props.class,
      props.style,
    )
  return (
    <AttachmentContext value={ctx}>
      <div
        data-slot="attachment"
        data-state={ctx.state()}
        data-size={ctx.size()}
        data-orientation={ctx.orientation()}
        {...rest}
        class={a().class}
        style={a().style}
      />
    </AttachmentContext>
  )
}

type AttachmentMediaProps = DivProps & { variant?: "icon" | "image" | null }

function AttachmentMedia(props: AttachmentMediaProps) {
  const rest = omit(props, "class", "style", "variant", "xstyle")
  const ctx = useContext(AttachmentContext)
  const settled = () => ctx.state() === "done" || ctx.state() === "idle"
  const a = () =>
    sxMerge(
      [
        styles.media,
        ctx.orientation() === "vertical" && styles.mediaVertical,
        ctx.size() === "sm" && styles.mediaSm,
        ctx.size() === "xs" && styles.mediaXs,
        ctx.state() === "error" && styles.mediaError,
        props.variant === "image" && (settled() ? styles.mediaImageSettled : styles.mediaImage),
        props.xstyle,
      ],
      props.class,
      props.style,
    )
  return (
    <div data-slot="attachment-media" data-variant={props.variant ?? "icon"} {...rest} class={a().class} style={a().style} />
  )
}

function AttachmentContent(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const ctx = useContext(AttachmentContext)
  const a = () =>
    sxMerge(
      [styles.content, ctx.orientation() === "vertical" && styles.contentVertical, props.xstyle],
      props.class,
      props.style,
    )
  return <div data-slot="attachment-content" {...rest} class={a().class} style={a().style} />
}

function AttachmentTitle(props: SpanProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const ctx = useContext(AttachmentContext)
  const busy = () => ctx.state() === "processing" || ctx.state() === "uploading"
  const a = () => sxMerge([styles.title, busy() && shimmerStyles.shimmer, props.xstyle], props.class, props.style)
  return <span data-slot="attachment-title" {...rest} class={a().class} style={a().style} />
}

function AttachmentDescription(props: SpanProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const ctx = useContext(AttachmentContext)
  const a = () =>
    sxMerge(
      [styles.description, ctx.state() === "error" && styles.descriptionError, props.xstyle],
      props.class,
      props.style,
    )
  return <span data-slot="attachment-description" {...rest} class={a().class} style={a().style} />
}

function AttachmentActions(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const ctx = useContext(AttachmentContext)
  const a = () =>
    sxMerge(
      [styles.actions, ctx.orientation() === "vertical" && styles.actionsVertical, props.xstyle],
      props.class,
      props.style,
    )
  return <div data-slot="attachment-actions" {...rest} class={a().class} style={a().style} />
}

function AttachmentAction(props: ButtonProps) {
  const rest = omit(props, "variant", "size")
  return <Button data-slot="attachment-action" variant={props.variant ?? "ghost"} size={props.size ?? "icon-xs"} {...rest} />
}

type AttachmentTriggerProps = Omit<useRender.ComponentProps<"button">, "class"> & XStyle

function AttachmentTrigger(props: AttachmentTriggerProps) {
  const rest = omit(props, "class", "style", "render", "type", "children", "xstyle")
  return useRender({
    defaultTagName: "button",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    state: { slot: "attachment-trigger" },
    props: renderProps(() => {
      const a = sxMerge([styles.trigger, props.xstyle], props.class, props.style)
      return mergeProps<Record<string, unknown>>(
        { type: props.render ? props.type : (props.type ?? "button"), class: a.class, style: a.style },
        rest,
      )
    }),
  })
}

function AttachmentGroup(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.group, props.xstyle], props.class, props.style)
  return (
    <InGroupContext value={true}>
      <div data-slot="attachment-group" {...rest} class={a().class} style={a().style} />
    </InGroupContext>
  )
}

export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
  type AttachmentProps,
  type AttachmentState,
  type AttachmentMediaProps,
  type AttachmentTriggerProps,
}
