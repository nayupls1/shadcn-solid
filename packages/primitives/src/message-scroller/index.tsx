import { createContext, createEffect, createSignal, omit, onSettled, untrack, useContext, type Accessor } from "solid-js"
import type { JSX } from "@solidjs/web"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { createMessageScrollerController, type MessageScrollerController } from "./controller"
import {
  EMPTY_MESSAGE_SCROLLER_SCROLLABLE,
  EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE,
  USER_SCROLL_KEYS,
  type MessageScrollerButtonDirection,
  type MessageScrollerDefaultScrollPosition,
  type MessageScrollerScrollable,
  type MessageScrollerScrollOptions,
  type MessageScrollerVisibilityState,
} from "./types"
import { renderProps } from "../render-props"

/**
 * Solid port of `@shadcn/react/message-scroller` (MIT): a headless scroll container for chat
 * transcripts that owns scroll position, turn anchoring, auto-follow and visibility tracking.
 * Same parts, props and data attributes. The hooks return objects with reactive getters.
 */

type MessageScrollerContextValue = {
  controller: MessageScrollerController
  scrollable: Accessor<MessageScrollerScrollable>
  visibility: Accessor<MessageScrollerVisibilityState>
  pendingDefaultScroll: Accessor<boolean>
}

const MessageScrollerContext = createContext<MessageScrollerContextValue | null>(null)

function useMessageScrollerContext() {
  const context = useContext(MessageScrollerContext)
  if (!context) throw new Error("useMessageScroller must be used within a MessageScroller.")
  return context
}

function useMessageScroller() {
  const { controller } = useMessageScrollerContext()
  return {
    scrollToEnd: controller.scrollToEnd,
    scrollToMessage: controller.scrollToMessage,
    scrollToStart: controller.scrollToStart,
  }
}

/** The edges the viewport can still scroll toward, as reactive getters. */
function useMessageScrollerScrollable(): MessageScrollerScrollable {
  const { scrollable } = useMessageScrollerContext()
  return {
    get start() {
      return scrollable().start
    },
    get end() {
      return scrollable().end
    },
  }
}

/** Visible messages and the current anchor, as reactive getters. Tracking starts on first use. */
function useMessageScrollerVisibility(): MessageScrollerVisibilityState {
  const { controller, visibility } = useMessageScrollerContext()
  onSettled(() => controller.subscribeVisibility())
  return {
    get currentAnchorId() {
      return visibility().currentAnchorId
    },
    get visibleMessageIds() {
      return visibility().visibleMessageIds
    },
  }
}

type MessageScrollerProviderProps = {
  children?: JSX.Element
  autoScroll?: boolean
  defaultScrollPosition?: MessageScrollerDefaultScrollPosition
  scrollEdgeThreshold?: number
  scrollPreviousItemPeek?: number
  scrollMargin?: number
}

function MessageScrollerProvider(props: MessageScrollerProviderProps) {
  const [scrollable, setScrollable] = createSignal<MessageScrollerScrollable>(EMPTY_MESSAGE_SCROLLER_SCROLLABLE, {
    ownedWrite: true,
  })
  const [visibility, setVisibility] = createSignal<MessageScrollerVisibilityState>(
    EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE,
    { ownedWrite: true },
  )
  const controller = createMessageScrollerController({
    autoScroll: () => props.autoScroll ?? false,
    defaultScrollPosition: () => props.defaultScrollPosition ?? "end",
    scrollEdgeThreshold: () => props.scrollEdgeThreshold,
    scrollPreviousItemPeek: () => props.scrollPreviousItemPeek,
    scrollMargin: () => props.scrollMargin,
    onScrollable: (state) => setScrollable(state),
    onVisibility: (state) => setVisibility(state),
    onPendingDefaultScroll: (pending) => setPendingDefaultScroll(pending),
  })
  const [pendingDefaultScroll, setPendingDefaultScroll] = createSignal(controller.initialPendingDefaultScroll, {
    ownedWrite: true,
  })

  onSettled(() => {
    controller.mount()
    return () => controller.dispose()
  })

  createEffect(
    () => props.autoScroll ?? false,
    () => {
      controller.syncAutoScroll()
    },
    { defer: true },
  )

  createEffect(
    () => props.defaultScrollPosition ?? "end",
    () => {
      controller.resetDefaultScrollPosition()
    },
    { defer: true },
  )

  return (
    <MessageScrollerContext value={{ controller, scrollable, visibility, pendingDefaultScroll }}>
      {props.children}
    </MessageScrollerContext>
  )
}

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

function callRef<T>(ref: unknown, element: T) {
  if (typeof ref === "function") (ref as (el: T) => void)(element)
}

function callHandler<E extends Event>(handler: unknown, event: E) {
  if (typeof handler === "function") (handler as (event: E) => void)(event)
}

function MessageScrollerRoot(props: DivProps) {
  const rest = omit(props, "ref", "children")
  const { controller, pendingDefaultScroll } = useMessageScrollerContext()
  return (
    <div
      ref={(element: HTMLDivElement) => {
        controller.setRootElement(element)
        callRef(
          untrack(() => props.ref),
          element,
        )
      }}
      {...rest}
      data-pending-scroll={pendingDefaultScroll() ? "" : undefined}
    >
      {props.children}
    </div>
  )
}

type MessageScrollerViewportProps = DivProps & { preserveScrollOnPrepend?: boolean }

function MessageScrollerViewport(props: MessageScrollerViewportProps) {
  const rest = omit(
    props,
    "aria-label",
    "children",
    "onKeyDown",
    "onScroll",
    "onTouchMove",
    "onWheel",
    "preserveScrollOnPrepend",
    "ref",
    "role",
    "tabindex",
  )
  const { controller, pendingDefaultScroll } = useMessageScrollerContext()
  let viewport: HTMLDivElement | undefined

  createEffect(
    () => props.preserveScrollOnPrepend ?? true,
    (value) => {
      controller.setPreserveScrollOnPrepend(value)
    },
  )

  onSettled(() => {
    if (!viewport || typeof ResizeObserver === "undefined") return
    // Coalesce into rAF: handleResize mutates the spacer inside the observed content.
    let frame = 0
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(controller.handleResize)
    })
    observer.observe(viewport)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  })

  return (
    <div
      ref={(element: HTMLDivElement) => {
        viewport = element
        controller.setViewportElement(element)
        callRef(
          untrack(() => props.ref),
          element,
        )
      }}
      role={props.role ?? "region"}
      aria-label={props["aria-label"] ?? "Messages"}
      tabindex={props.tabindex ?? 0}
      onKeyDown={(event) => {
        if (USER_SCROLL_KEYS.has(event.key)) controller.userScrollIntent()
        callHandler(props.onKeyDown, event)
      }}
      onScroll={(event) => {
        controller.syncAfterScroll()
        callHandler(props.onScroll, event)
      }}
      onTouchMove={(event) => {
        controller.userScrollIntent()
        callHandler(props.onTouchMove, event)
      }}
      onWheel={(event) => {
        controller.userScrollIntent()
        callHandler(props.onWheel, event)
      }}
      {...rest}
      data-pending-scroll={pendingDefaultScroll() ? "" : undefined}
    >
      {props.children}
    </div>
  )
}

type MessageScrollerContentProps = DivProps & {
  /** Class for the internal tail spacer used when anchoring turns near the top. */
  spacerClass?: string
}

function MessageScrollerContent(props: MessageScrollerContentProps) {
  const rest = omit(props, "aria-relevant", "children", "ref", "role", "spacerClass")
  const { controller } = useMessageScrollerContext()
  let content: HTMLDivElement | undefined

  onSettled(() => {
    if (!content) return
    controller.handleContentChange()
    const cleanups: Array<() => void> = []
    if (typeof MutationObserver !== "undefined") {
      const mutations = new MutationObserver(() => controller.handleContentChange())
      mutations.observe(content, { childList: true })
      cleanups.push(() => mutations.disconnect())
    }
    if (typeof ResizeObserver !== "undefined") {
      let frame = 0
      const resizes = new ResizeObserver(() => {
        window.cancelAnimationFrame(frame)
        frame = window.requestAnimationFrame(controller.handleResize)
      })
      resizes.observe(content)
      cleanups.push(() => {
        window.cancelAnimationFrame(frame)
        resizes.disconnect()
      })
    }
    return () => cleanups.forEach((cleanup) => cleanup())
  })

  return (
    <div
      ref={(element: HTMLDivElement) => {
        content = element
        controller.setContentElement(element)
        callRef(
          untrack(() => props.ref),
          element,
        )
      }}
      role={props.role ?? "log"}
      aria-relevant={props["aria-relevant"] ?? "additions"}
      {...rest}
    >
      {props.children}
      <div
        ref={(element: HTMLDivElement) => controller.setSpacerElement(element)}
        aria-hidden="true"
        data-message-scroller-spacer=""
        hidden
        class={props.spacerClass}
      />
    </div>
  )
}

type MessageScrollerItemProps = DivProps & {
  /** Stable row id for scrollToMessage, visibility, and prepend preservation. */
  messageId?: string
  /** Marks a turn boundary that newly appended anchors and last-anchor restore use. */
  scrollAnchor?: boolean
}

function MessageScrollerItem(props: MessageScrollerItemProps) {
  const rest = omit(props, "messageId", "ref", "scrollAnchor")
  const { controller } = useMessageScrollerContext()
  let element: HTMLDivElement | undefined
  let registeredId: string | undefined

  onSettled(() => () => {
    if (registeredId && element) controller.registerMessage(registeredId, null, element)
  })

  return (
    <div
      ref={(node: HTMLDivElement) => {
        element = node
        registeredId = untrack(() => props.messageId)
        if (registeredId) controller.registerMessage(registeredId, node)
        callRef(
          untrack(() => props.ref),
          node,
        )
      }}
      data-message-id={props.messageId}
      data-scroll-anchor={props.scrollAnchor ? "true" : "false"}
      {...rest}
    />
  )
}

type MessageScrollerButtonState = { active: boolean; direction: MessageScrollerButtonDirection }

type MessageScrollerButtonProps = useRender.ComponentProps<"button", MessageScrollerButtonState> & {
  /** Native scroll behavior when clicked. Defaults to "smooth". */
  behavior?: ScrollBehavior
  /** Transcript edge to scroll toward. Defaults to "end". */
  direction?: MessageScrollerButtonDirection
}

function MessageScrollerButton(props: MessageScrollerButtonProps) {
  const rest = omit(props, "behavior", "children", "direction", "onClick", "render", "tabindex", "type")
  const { controller, scrollable } = useMessageScrollerContext()
  const direction = () => props.direction ?? "end"
  const active = () => (direction() === "start" ? scrollable().start : scrollable().end)

  const handleClick = (event: MouseEvent & { currentTarget: HTMLButtonElement }) => {
    if (!active()) return
    callHandler(props.onClick, event)
    if (!event.defaultPrevented) {
      event.currentTarget.blur()
      if (direction() === "start") controller.scrollToStart({ behavior: props.behavior ?? "smooth" })
      else controller.scrollToEnd({ behavior: props.behavior ?? "smooth" })
    }
  }

  return useRender({
    defaultTagName: "button",
    get render() {
      return props.render
    },
    get children() {
      return props.children ?? <span>Scroll to {direction()}</span>
    },
    state: () => ({ active: active(), direction: direction() }),
    stateAttributesMapping: {
      active: (value) => ({ "data-active": value ? "true" : "false" }),
    },
    props: renderProps(() => {
      return mergeProps<Record<string, unknown>>(
        {
          type: props.type ?? "button",
          inert: active() ? undefined : "",
          tabindex: active() ? props.tabindex : -1,
          onClick: handleClick,
        },
        rest,
      )
    }),
  })
}

const MessageScroller = {
  Provider: MessageScrollerProvider,
  Root: MessageScrollerRoot,
  Viewport: MessageScrollerViewport,
  Content: MessageScrollerContent,
  Item: MessageScrollerItem,
  Button: MessageScrollerButton,
}

export {
  MessageScroller,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
  type MessageScrollerButtonProps,
  type MessageScrollerButtonState,
  type MessageScrollerContentProps,
  type MessageScrollerItemProps,
  type MessageScrollerProviderProps,
  type MessageScrollerViewportProps,
  type MessageScrollerScrollOptions,
  type MessageScrollerScrollable,
  type MessageScrollerVisibilityState,
  type MessageScrollerDefaultScrollPosition,
}
