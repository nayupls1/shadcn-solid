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
import { ArrowDown } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

// shadcn's message-scroller over @shadcn-solid/primitives/message-scroller, a Solid port of
// @shadcn/react/message-scroller.

function MessageScrollerProvider(props: MessageScrollerProviderProps) {
  return <MessageScrollerPrimitive.Provider {...props} />
}

type WithClass<T> = Omit<T, "class"> & { class?: string }

function MessageScroller(props: WithClass<JSX.HTMLAttributes<HTMLDivElement>>) {
  const rest = omit(props, "class")
  return (
    <MessageScrollerPrimitive.Root
      data-slot="message-scroller"
      class={cn("group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden", props.class)}
      {...rest}
    />
  )
}

function MessageScrollerViewport(props: WithClass<MessageScrollerPrimitiveViewportProps>) {
  const rest = omit(props, "class")
  return (
    <MessageScrollerPrimitive.Viewport
      data-slot="message-scroller-viewport"
      class={cn(
        "size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-thumb-transparent data-autoscrolling:scrollbar-track-transparent data-pending-scroll:invisible",
        props.class,
      )}
      {...rest}
    />
  )
}

function MessageScrollerContent(props: WithClass<MessageScrollerPrimitiveContentProps>) {
  const rest = omit(props, "class")
  return (
    <MessageScrollerPrimitive.Content
      data-slot="message-scroller-content"
      class={cn("flex h-max min-h-full flex-col gap-8", props.class)}
      {...rest}
    />
  )
}

function MessageScrollerItem(props: WithClass<MessageScrollerPrimitiveItemProps>) {
  const rest = omit(props, "class", "scrollAnchor")
  return (
    <MessageScrollerPrimitive.Item
      data-slot="message-scroller-item"
      scrollAnchor={props.scrollAnchor ?? false}
      class={cn("min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]", props.class)}
      {...rest}
    />
  )
}

type MessageScrollerButtonProps = WithClass<MessageScrollerPrimitiveButtonProps> &
  Pick<ButtonProps, "variant" | "size">

function MessageScrollerButton(props: MessageScrollerButtonProps) {
  const rest = omit(props, "direction", "class", "children", "render", "variant", "size")
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
      class={cn(
        "absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
        props.class,
      )}
      // shadcn's `render={<Button variant size />}`; the function form keeps Base UI's props.
      render={props.render ?? ((p) => <Button {...(p as ButtonProps)} variant={variant()} size={size()} />)}
      {...rest}
    >
      <Show
        when={resolved()}
        fallback={
          <>
            <Icon icon={ArrowDown} />
            <span class="sr-only">{direction() === "end" ? "Scroll to end" : "Scroll to start"}</span>
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
