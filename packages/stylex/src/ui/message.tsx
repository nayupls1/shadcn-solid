import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors } from "../tokens.stylex"
import { messageMarker } from "../lib/markers.stylex"
import { sxMerge } from "../lib/sx"

// Port of shadcn/ui's base-vega `message` (see the Tailwind variant for the source classes).
// `group/message` is a named marker. `group-data-[align=end]/message:*:data-slot:self-end` (the
// content's children) is applied by the children instead: the header, the footer and `Bubble`
// align themselves to the end inside an end-aligned message.


const meta = {
  display: "flex",
  maxWidth: "100%",
  minWidth: 0,
  alignItems: "center",
  fontSize: "0.75rem",
  lineHeight: "1rem",
  fontWeight: 500,
  color: colors.mutedForeground,
} as const

const styles = stylex.create({
  group: { display: "flex", minWidth: 0, flexDirection: "column", gap: "0.5rem" },
  message: {
    position: "relative",
    display: "flex",
    width: "100%",
    minWidth: 0,
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    flexDirection: { default: "row", ":is([data-align=end])": "row-reverse" },
  },
  avatar: {
    display: "flex",
    width: "fit-content",
    minWidth: "2rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    overflow: "hidden",
    borderRadius: "9999px",
    backgroundColor: colors.muted,
    transform: { default: null, [stylex.when.ancestor(":has([data-slot=message-footer])", messageMarker)]: "translateY(-2rem)" },
  },
  content: {
    display: "flex",
    width: "100%",
    minWidth: 0,
    flexDirection: "column",
    gap: "0.625rem",
    overflowWrap: "break-word",
  },
  header: {
    ...meta,
    paddingInline: { default: "0.75rem", [stylex.when.ancestor(":has([data-variant=ghost])", messageMarker)]: 0 },
    alignSelf: { default: null, [stylex.when.ancestor("[data-align=end]", messageMarker)]: "flex-end" },
  },
  footer: {
    ...meta,
    paddingInline: { default: "0.75rem", [stylex.when.ancestor(":has([data-variant=ghost])", messageMarker)]: 0 },
    justifyContent: { default: null, [stylex.when.ancestor("[data-align=end]", messageMarker)]: "flex-end" },
    alignSelf: { default: null, [stylex.when.ancestor("[data-align=end]", messageMarker)]: "flex-end" },
  },
})

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function part(slot: string, style: stylex.StyleXStyles) {
  return function MessagePart(props: DivProps) {
    const rest = omit(props, "class", "style", "xstyle")
    const a = () => sxMerge([style, props.xstyle], props.class, props.style)
    return <div data-slot={slot} {...rest} class={a().class} style={a().style} />
  }
}

type MessageProps = DivProps & { align?: "start" | "end" }

function Message(props: MessageProps) {
  const rest = omit(props, "class", "style", "align", "xstyle")
  const a = () => sxMerge([messageMarker, styles.message, props.xstyle], props.class, props.style)
  return <div data-slot="message" data-align={props.align ?? "start"} {...rest} class={a().class} style={a().style} />
}

const MessageGroup = part("message-group", styles.group)
const MessageAvatar = part("message-avatar", styles.avatar)
const MessageContent = part("message-content", styles.content)
const MessageHeader = part("message-header", styles.header)
const MessageFooter = part("message-footer", styles.footer)

export { MessageGroup, Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader, type MessageProps }
