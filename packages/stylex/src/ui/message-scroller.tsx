import { children, omit, Show } from "solid-js"
import {
  MessageScroller as MessageScrollerPrimitive,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
  type MessageScrollerButtonProps as MessageScrollerPrimitiveButtonProps,
  type MessageScrollerContentProps as MessageScrollerPrimitiveContentProps,
  type MessageScrollerItemProps as MessageScrollerPrimitiveItemProps,
  type MessageScrollerProviderProps,
  type MessageScrollerViewportProps as MessageScrollerPrimitiveViewportProps,
} from "@shadcn-solid/primitives/message-scroller"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { ArrowDown } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors } from "../tokens.stylex"
import { sxMerge } from "../lib/sx"
import { Button, type ButtonProps } from "./button"

// Port of shadcn/ui's base-vega `message-scroller` (see the Tailwind variant for the source
// classes) over @shadcn-solid/primitives/message-scroller. The viewport's `scroll-fade-b` edge mask
// isn't ported; the button's state comes from its `data-active`/`data-direction` attributes.

const styles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    width: "100%",
    height: "100%",
    minHeight: 0,
    flexDirection: "column",
    overflow: "hidden",
  },
  viewport: {
    width: "100%",
    height: "100%",
    minHeight: 0,
    minWidth: 0,
    scrollbarWidth: "thin",
    scrollbarGutter: "stable",
    scrollbarColor: { default: null, ":is([data-autoscrolling])": "transparent transparent" },
    overflowY: "auto",
    overscrollBehavior: "contain",
    contain: "content",
    visibility: { default: null, ":is([data-pending-scroll])": "hidden" },
  },
  content: { display: "flex", height: "max-content", minHeight: "100%", flexDirection: "column", gap: "2rem" },
  item: { minWidth: 0, flexShrink: 0, containIntrinsicSize: "auto 10rem", contentVisibility: "auto" },
  button: {
    position: "absolute",
    insetInlineStart: "50%",
    borderColor: colors.border,
    backgroundColor: { default: colors.background, ":hover": colors.muted },
    color: { default: colors.foreground, ":hover": colors.foreground },
    transitionProperty: "translate, scale, opacity",
    transitionDuration: { default: "200ms", ":is([data-active=false])": "400ms" },
    transitionTimingFunction: {
      default: "cubic-bezier(0.23, 1, 0.32, 1)",
      ":is([data-active=false])": "cubic-bezier(0.7, 0, 0.84, 0)",
    },
    pointerEvents: { default: null, ":is([data-active=false])": "none" },
    scale: { default: "1", ":is([data-active=false])": "0.95" },
    opacity: { default: 1, ":is([data-active=false])": 0 },
    translate: {
      default: "-50% 0",
      ":is([data-active=false][data-direction=end])": "-50% 100%",
      ":is([data-active=false][data-direction=start])": "-50% -100%",
      ":dir(rtl)": "50% 0",
    },
    bottom: { default: null, ":is([data-direction=end])": "1rem" },
    top: { default: null, ":is([data-direction=start])": "1rem" },
  },
  iconStart: { transform: "rotate(180deg)" },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }
type WithXStyle<T> = Omit<T, "class"> & XStyle

function MessageScrollerProvider(props: MessageScrollerProviderProps) {
  return <MessageScrollerPrimitive.Provider {...props} />
}

function MessageScroller(props: WithXStyle<JSX.HTMLAttributes<HTMLDivElement>>) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.root, props.xstyle], props.class, props.style)
  return <MessageScrollerPrimitive.Root data-slot="message-scroller" {...rest} class={a().class} style={a().style} />
}

function MessageScrollerViewport(props: WithXStyle<MessageScrollerPrimitiveViewportProps>) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.viewport, props.xstyle], props.class, props.style)
  return <MessageScrollerPrimitive.Viewport data-slot="message-scroller-viewport" {...rest} class={a().class} style={a().style} />
}

function MessageScrollerContent(props: WithXStyle<MessageScrollerPrimitiveContentProps>) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.content, props.xstyle], props.class, props.style)
  return <MessageScrollerPrimitive.Content data-slot="message-scroller-content" {...rest} class={a().class} style={a().style} />
}

function MessageScrollerItem(props: WithXStyle<MessageScrollerPrimitiveItemProps>) {
  const rest = omit(props, "class", "style", "xstyle", "scrollAnchor")
  const a = () => sxMerge([styles.item, props.xstyle], props.class, props.style)
  return (
    <MessageScrollerPrimitive.Item
      data-slot="message-scroller-item"
      scrollAnchor={props.scrollAnchor ?? false}
      {...rest}
      class={a().class}
      style={a().style}
    />
  )
}

type MessageScrollerButtonProps = WithXStyle<MessageScrollerPrimitiveButtonProps> & Pick<ButtonProps, "variant" | "size">

function MessageScrollerButton(props: MessageScrollerButtonProps) {
  const rest = omit(props, "direction", "class", "xstyle", "children", "render", "variant", "size")
  const direction = () => props.direction ?? "end"
  const variant = () => props.variant ?? "secondary"
  const size = () => props.size ?? "icon-sm"
  const resolved = children(() => props.children)
  return (
    <MessageScrollerPrimitive.Button
      data-slot="message-scroller-button"
      data-direction={direction()}
      data-variant={variant()}
      data-size={size()}
      direction={direction()}
      class={props.class}
      // shadcn's `render={<Button variant size />}`; the function form keeps Base UI's props.
      render={
        props.render ??
        ((p) => (
          <Button {...(p as ButtonProps)} variant={variant()} size={size()} xstyle={[styles.button, props.xstyle]} />
        ))
      }
      {...rest}
    >
      <Show
        when={resolved()}
        fallback={
          <>
            <Icon icon={ArrowDown} class={sxMerge([direction() === "start" && styles.iconStart]).class} />
            <span {...stylex.attrs(styles.srOnly)}>{direction() === "end" ? "Scroll to end" : "Scroll to start"}</span>
          </>
        }
      >
        {resolved()}
      </Show>
    </MessageScrollerPrimitive.Button>
  )
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
}
