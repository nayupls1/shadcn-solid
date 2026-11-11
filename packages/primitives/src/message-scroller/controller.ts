// Port of @shadcn/react's message-scroller controller, commands and refs (MIT) as one
// framework-agnostic closure: the React refs are plain variables, and the external stores are
// callbacks that the Solid components turn into signals. The scroll logic and its ordering are
// unchanged; see the upstream comments for the reasoning behind each branch.

import {
  getContentBottom,
  getElementScrollTop,
  getElementTop,
  getElementViewportTop,
  getFirstVisibleMessageItem,
  getFlexGap,
  getLastScrollAnchor,
  getMaxScrollTop,
  getMessageScrollerItems,
  getMessageScrollerScrollable,
  getMessageScrollerVisibilityState,
  getNewScrollAnchor,
  getTailSpacerHeight,
  getUnanchoredScrollAnchor,
  hasMultipleNewScrollAnchors,
} from "./geometry"
import {
  AUTOSCROLLING_CLEAR_DELAY,
  DEFAULT_SCROLL_EDGE_THRESHOLD,
  DEFAULT_SCROLL_MARGIN,
  DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK,
  EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE,
  SCROLL_POSITION_EPSILON,
} from "./types"
import type {
  MessageScrollerDefaultScrollPosition,
  MessageScrollerMode,
  MessageScrollerScrollable,
  MessageScrollerScrollOptions,
  MessageScrollerVisibilityState,
} from "./types"

export type MessageScrollerOptions = {
  autoScroll: () => boolean
  defaultScrollPosition: () => MessageScrollerDefaultScrollPosition
  scrollEdgeThreshold: () => number | undefined
  scrollPreviousItemPeek: () => number | undefined
  scrollMargin: () => number | undefined
  /** Publishes the scrollable snapshot (only called on change). */
  onScrollable: (state: MessageScrollerScrollable) => void
  /** Publishes the visibility snapshot (only called on change). */
  onVisibility: (state: MessageScrollerVisibilityState) => void
  /** Publishes whether the opening position is still pending. */
  onPendingDefaultScroll: (pending: boolean) => void
}

function scrollStatesEqual(a: MessageScrollerScrollable, b: MessageScrollerScrollable) {
  return a.start === b.start && a.end === b.end
}

function visibilityStatesEqual(a: MessageScrollerVisibilityState, b: MessageScrollerVisibilityState) {
  return (
    a.currentAnchorId === b.currentAnchorId &&
    a.visibleMessageIds.length === b.visibleMessageIds.length &&
    a.visibleMessageIds.every((id, i) => id === b.visibleMessageIds[i])
  )
}

export function createMessageScrollerController(options: MessageScrollerOptions) {
  const edgeThreshold = () => options.scrollEdgeThreshold() ?? DEFAULT_SCROLL_EDGE_THRESHOLD
  const scrollMargin = () => options.scrollMargin() ?? DEFAULT_SCROLL_MARGIN
  const previousItemPeek = () => options.scrollPreviousItemPeek() ?? DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK

  // --- the ref bag -----------------------------------------------------------------------------
  let autoscrolling = false
  let autoscrollingTimeout: number | null = null
  let content: HTMLDivElement | null = null
  let defaultScrollPositionApplied = false
  let itemCount = 0
  let firstItem: HTMLElement | null = null
  let lastScrollTop = 0
  let mode: MessageScrollerMode = options.autoScroll() ? "following-bottom" : "free-scrolling"
  const messageElements = new Map<string, HTMLElement>()
  let pendingScrollToMessage: { messageId: string; options?: MessageScrollerScrollOptions } | null = null
  let prependRestore: { element: HTMLElement; viewportTop: number } | null = null
  let streamingTurn: HTMLElement | null = null
  let preserveScrollOnPrepend = true
  let root: HTMLDivElement | null = null
  let pendingScrollFrame: number | null = null
  let spacerGap = 0
  let spacerHeight = 0
  let spacer: HTMLDivElement | null = null
  let stateFrame: number | null = null
  let viewport: HTMLDivElement | null = null
  let visibilityFrame: number | null = null
  let visibilityObserver: IntersectionObserver | null = null
  let visibilityListeners = 0
  const visibleMessageIds = new Set<string>()
  const handledScrollAnchors = new WeakSet<HTMLElement>()

  let scrollable: MessageScrollerScrollable = { start: false, end: false }
  let visibility: MessageScrollerVisibilityState = EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE
  let pendingDefaultScroll = options.defaultScrollPosition() === "end" || options.defaultScrollPosition() === "last-anchor"

  const setScrollable = (next: MessageScrollerScrollable) => {
    if (scrollStatesEqual(scrollable, next)) return
    scrollable = next
    options.onScrollable(next)
  }
  const setVisibility = (next: MessageScrollerVisibilityState) => {
    if (visibilityStatesEqual(visibility, next)) return
    visibility = next
    options.onVisibility(next)
  }
  const clearPendingDefaultScroll = () => {
    if (!pendingDefaultScroll) return
    pendingDefaultScroll = false
    options.onPendingDefaultScroll(false)
  }
  const markDefaultScrollPositionApplied = () => {
    defaultScrollPositionApplied = true
    clearPendingDefaultScroll()
  }

  // --- state commits ---------------------------------------------------------------------------
  const writeStateAttributes = (state: MessageScrollerScrollable) => {
    const value = [state.start && "start", state.end && "end"].filter(Boolean).join(" ")
    for (const element of [root, viewport]) {
      if (!element) continue
      if (value) element.setAttribute("data-scrollable", value)
      else element.removeAttribute("data-scrollable")
      element.toggleAttribute("data-autoscrolling", autoscrolling)
    }
  }

  const reconcileFollowMode = (state: MessageScrollerScrollable) => {
    const scrollTop = viewport?.scrollTop ?? 0
    const scrolledUp = scrollTop < lastScrollTop - SCROLL_POSITION_EPSILON
    lastScrollTop = scrollTop

    if (
      options.autoScroll() &&
      !state.end &&
      spacerHeight === 0 &&
      mode !== "settling-jump" &&
      mode !== "anchored-to-message"
    ) {
      mode = "following-bottom"
    } else if (mode === "following-bottom" && state.end && scrolledUp && !autoscrolling) {
      mode = "free-scrolling"
    }
  }

  const commitScrollState = () => {
    const next = getMessageScrollerScrollable({ content, scrollEdgeThreshold: edgeThreshold(), spacer, viewport })
    reconcileFollowMode(next)
    const published = mode === "following-bottom" ? { ...next, end: false } : next
    writeStateAttributes(published)
    setScrollable(published)
  }

  const scheduleStateCommit = () => {
    if (stateFrame !== null) return
    stateFrame = window.requestAnimationFrame(() => {
      stateFrame = null
      commitScrollState()
    })
  }

  const scheduleVisibilitySync = () => {
    if (visibilityListeners === 0 || visibilityFrame !== null) return
    visibilityFrame = window.requestAnimationFrame(() => {
      visibilityFrame = null
      if (visibilityListeners === 0) return
      setVisibility(
        getMessageScrollerVisibilityState({
          content,
          scrollMargin: scrollMargin(),
          scrollPreviousItemPeek: previousItemPeek(),
          spacer,
          viewport,
          visibleMessageIds,
        }),
      )
    })
  }

  // --- commands --------------------------------------------------------------------------------
  const setAutoScrolling = (value: boolean) => {
    if (autoscrollingTimeout !== null) {
      window.clearTimeout(autoscrollingTimeout)
      autoscrollingTimeout = null
    }
    if (autoscrolling !== value) {
      autoscrolling = value
      commitScrollState()
    }
    if (value) {
      autoscrollingTimeout = window.setTimeout(() => {
        autoscrollingTimeout = null
        autoscrolling = false
        commitScrollState()
      }, AUTOSCROLLING_CLEAR_DELAY)
    }
  }

  const setTailSpacerHeight = (height: number) => {
    if (!spacer) return
    const next = Math.max(0, Math.ceil(height))
    if (spacerHeight === next) return
    spacerHeight = next
    spacer.hidden = next === 0
    spacer.style.height = `${next}px`
    spacer.style.marginTop = next > 0 ? `${-spacerGap}px` : ""
  }

  const scrollToPosition = (
    scrollTop: number,
    { behavior = "auto", autoscrolling: auto = false }: { behavior?: ScrollBehavior; autoscrolling?: boolean } = {},
  ) => {
    if (!viewport) return
    const next = Math.max(0, scrollTop)
    if (Math.abs(viewport.scrollTop - next) <= SCROLL_POSITION_EPSILON) {
      viewport.scrollTop = next
      commitScrollState()
      return
    }
    if (auto) setAutoScrolling(true)
    viewport.scrollTo({ top: next, behavior })
    scheduleStateCommit()
  }

  const scrollToStart = ({ behavior = "auto" }: MessageScrollerScrollOptions = {}) => {
    if (!viewport) return false
    setTailSpacerHeight(0)
    streamingTurn = null
    mode = "free-scrolling"
    scrollToPosition(0, { behavior })
    scheduleVisibilitySync()
    return true
  }

  const scrollToEnd = ({ behavior = "auto" }: MessageScrollerScrollOptions = {}) => {
    if (!viewport) return false
    setTailSpacerHeight(0)
    streamingTurn = null
    mode = options.autoScroll() ? "following-bottom" : "free-scrolling"
    scrollToPosition(getMaxScrollTop(viewport), { autoscrolling: true, behavior })
    scheduleVisibilitySync()
    return true
  }

  const scrollToElement = (
    element: HTMLElement,
    { align = "start", behavior = "auto", scrollMargin: margin = scrollMargin() }: MessageScrollerScrollOptions = {},
    { keepPreviousPeek = false }: { keepPreviousPeek?: boolean } = {},
  ) => {
    if (!content || !viewport || !content.contains(element)) return false
    const scrollTop = getElementScrollTop({
      align,
      element,
      scrollMargin: keepPreviousPeek ? margin + previousItemPeek() : margin,
      spacer,
      viewport,
    })
    setTailSpacerHeight(getTailSpacerHeight({ content, scrollTop, spacer, viewport }))
    prependRestore = { element, viewportTop: getElementViewportTop(element, viewport) }
    mode = keepPreviousPeek ? "anchored-to-message" : "settling-jump"
    streamingTurn = keepPreviousPeek ? element : null
    scrollToPosition(scrollTop, { behavior })
    scheduleVisibilitySync()
    return true
  }

  const reanchorToAnchoredMessage = () => {
    const element = streamingTurn
    if (!element || !element.isConnected || mode !== "anchored-to-message") return false
    return scrollToElement(element, { align: "start" }, { keepPreviousPeek: true })
  }

  const scrollToMessage = (messageId: string, scrollOptions?: MessageScrollerScrollOptions) => {
    const element = messageElements.get(messageId)
    if (!element) {
      if (itemCount === 0) {
        pendingScrollToMessage = { messageId, options: scrollOptions }
        markDefaultScrollPositionApplied()
        return true
      }
      return false
    }
    markDefaultScrollPositionApplied()
    if (scrollToElement(element, scrollOptions)) {
      pendingScrollToMessage = null
      return true
    }
    pendingScrollToMessage = { messageId, options: scrollOptions }
    return true
  }

  const flushPendingScrollToMessage = () => {
    const pending = pendingScrollToMessage
    if (!pending) return false
    const element = messageElements.get(pending.messageId)
    if (!element) return false
    if (!scrollToElement(element, pending.options)) return false
    pendingScrollToMessage = null
    markDefaultScrollPositionApplied()
    return true
  }

  // --- controller ------------------------------------------------------------------------------
  const restorePrependedAnchor = () => {
    const anchor = prependRestore
    if (!anchor || !viewport || !anchor.element.isConnected) return false
    const delta = getElementViewportTop(anchor.element, viewport) - anchor.viewportTop
    if (Math.abs(delta) <= SCROLL_POSITION_EPSILON) return false
    viewport.scrollTop += delta
    anchor.viewportTop = getElementViewportTop(anchor.element, viewport)
    scheduleStateCommit()
    scheduleVisibilitySync()
    return true
  }

  const capturePrependAnchor = () => {
    if (!content || !viewport) {
      prependRestore = null
      return
    }
    const anchor = getFirstVisibleMessageItem({ content, spacer, viewport })
    prependRestore = anchor ? { element: anchor, viewportTop: getElementViewportTop(anchor, viewport) } : null
  }

  const schedulePendingScrollToMessageFlush = () => {
    if (pendingScrollFrame !== null) return
    pendingScrollFrame = window.requestAnimationFrame(() => {
      pendingScrollFrame = null
      if (flushPendingScrollToMessage()) capturePrependAnchor()
    })
  }

  const applyDefaultScrollPosition = () => {
    const position = options.defaultScrollPosition()
    if (!position || defaultScrollPositionApplied || itemCount === 0) return false
    let handled = false
    if (position === "last-anchor") {
      const anchor = content && viewport ? getLastScrollAnchor(getMessageScrollerItems(content, spacer)) : null
      if (!content || !viewport || !anchor) {
        handled = scrollToEnd({ behavior: "auto" })
      } else {
        const anchorTop = getElementTop(anchor, viewport)
        const contentBottom = getContentBottom({ content, spacer, viewport })
        const lastTurnFits = contentBottom - anchorTop <= viewport.clientHeight
        handled = lastTurnFits
          ? scrollToEnd({ behavior: "auto" })
          : scrollToElement(anchor, { align: "start" }, { keepPreviousPeek: true })
      }
    } else {
      handled = position === "end" ? scrollToEnd({ behavior: "auto" }) : scrollToStart({ behavior: "auto" })
    }
    if (!handled) return false
    markDefaultScrollPositionApplied()
    return true
  }

  const handleContentChange = () => {
    if (!content) return
    const items = getMessageScrollerItems(content, spacer)
    const previousItemCount = itemCount
    const previousFirstItem = firstItem
    itemCount = items.length
    firstItem = items[0] ?? null

    // Branch order is load-bearing: first-content, prepended, appended, updated.
    const reconcileScrollPosition = () => {
      if (flushPendingScrollToMessage()) return

      if (previousItemCount === 0) {
        if (applyDefaultScrollPosition()) return
        if (items.length > 0 && options.autoScroll() && scrollToEnd({ behavior: "auto" })) return
        commitScrollState()
        scheduleVisibilitySync()
        return
      }

      const previousFirstItemIndex = previousFirstItem ? items.indexOf(previousFirstItem) : -1
      if (preserveScrollOnPrepend && previousFirstItemIndex > 0) {
        restorePrependedAnchor()
        return
      }

      if (items.length > previousItemCount) {
        const anchor = getNewScrollAnchor(items, previousItemCount)
        if (anchor) {
          if (options.autoScroll() && mode === "following-bottom" && hasMultipleNewScrollAnchors(items, previousItemCount)) {
            scrollToEnd({ behavior: "auto" })
            return
          }
          scrollToElement(anchor, { align: "start" }, { keepPreviousPeek: true })
          handledScrollAnchors.add(anchor)
          return
        }
      }

      if (items.length === previousItemCount) {
        const anchor = getUnanchoredScrollAnchor(items, handledScrollAnchors)
        if (anchor) {
          scrollToElement(anchor, { align: "start" }, { keepPreviousPeek: true })
          handledScrollAnchors.add(anchor)
          return
        }
      }

      if (mode === "following-bottom" && options.autoScroll()) {
        scrollToEnd({ behavior: "auto" })
      } else {
        commitScrollState()
        scheduleVisibilitySync()
      }
    }

    reconcileScrollPosition()
    capturePrependAnchor()
  }

  const drainReleasedSpacer = () => {
    if (
      !options.autoScroll() ||
      spacerHeight <= 0 ||
      mode === "following-bottom" ||
      mode === "anchored-to-message" ||
      mode === "settling-jump" ||
      autoscrolling
    ) {
      return false
    }
    if (!viewport || !content) return false
    const contentBottom = getContentBottom({ content, spacer, viewport })
    const overlap = viewport.scrollTop + viewport.clientHeight - contentBottom
    if (overlap <= 0) return false
    const next = Math.max(0, contentBottom + spacerHeight - (viewport.scrollTop + viewport.clientHeight))
    if (next === 0) {
      scrollToEnd({ behavior: "auto" })
      return true
    }
    setTailSpacerHeight(next)
    return false
  }

  const handleResize = () => {
    if (mode === "following-bottom" && options.autoScroll()) {
      scrollToEnd({ behavior: "auto" })
      return
    }
    const previousSpacerHeight = spacerHeight
    if (reanchorToAnchoredMessage()) {
      if (options.autoScroll() && previousSpacerHeight > 0 && spacerHeight === 0) {
        scrollToEnd({ behavior: "auto" })
      }
      return
    }
    if (drainReleasedSpacer()) return
    scheduleStateCommit()
    scheduleVisibilitySync()
  }

  const observeVisibility = () => {
    if (!viewport || visibilityListeners === 0) return
    if (typeof IntersectionObserver === "undefined") {
      scheduleVisibilitySync()
      return
    }
    if (!visibilityObserver) {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const messageId = (entry.target as HTMLElement).dataset.messageId
            if (!messageId) continue
            if (entry.isIntersecting) visibleMessageIds.add(messageId)
            else visibleMessageIds.delete(messageId)
          }
          scheduleVisibilitySync()
        },
        {
          root: viewport,
          rootMargin: `${-(scrollMargin() + previousItemPeek())}px 0px 0px 0px`,
          threshold: [0, 0.01, 0.5, 1],
        },
      )
    }
    messageElements.forEach((element) => visibilityObserver?.observe(element))
    scheduleVisibilitySync()
  }

  const unobserveVisibility = () => {
    if (visibilityFrame !== null) {
      window.cancelAnimationFrame(visibilityFrame)
      visibilityFrame = null
    }
    visibilityObserver?.disconnect()
    visibilityObserver = null
    visibleMessageIds.clear()
    setVisibility(EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE)
  }

  /** Reference-counted visibility tracking (`useMessageScrollerVisibility`). */
  const subscribeVisibility = () => {
    visibilityListeners++
    if (visibilityListeners === 1) observeVisibility()
    return () => {
      visibilityListeners--
      if (visibilityListeners === 0) unobserveVisibility()
    }
  }

  const registerMessage = (messageId: string, element: HTMLElement | null, removedElement?: HTMLElement | null) => {
    if (element) {
      messageElements.set(messageId, element)
      visibilityObserver?.observe(element)
      scheduleVisibilitySync()
      if (pendingScrollToMessage?.messageId === messageId) schedulePendingScrollToMessageFlush()
      return
    }
    if (removedElement && messageElements.get(messageId) === removedElement) {
      messageElements.delete(messageId)
      visibleMessageIds.delete(messageId)
      visibilityObserver?.unobserve(removedElement)
      scheduleVisibilitySync()
    }
  }

  const userScrollIntent = () => {
    if (mode === "following-bottom" || mode === "anchored-to-message" || mode === "settling-jump") {
      streamingTurn = null
      mode = "free-scrolling"
    }
  }

  const syncAfterScroll = () => {
    drainReleasedSpacer()
    commitScrollState()
    scheduleVisibilitySync()
    capturePrependAnchor()
  }

  /** The mount-time layout effect: apply the opening position, or stop holding it back. */
  const mount = () => {
    if (applyDefaultScrollPosition()) return
    if (itemCount === 0) clearPendingDefaultScroll()
  }

  /** The `autoScroll` layout effect. */
  const syncAutoScroll = () => {
    if (options.autoScroll() && mode === "following-bottom" && itemCount > 0) {
      scrollToEnd({ behavior: "auto" })
      return
    }
    commitScrollState()
  }

  /** A changed `defaultScrollPosition` re-applies the opening position (without hiding again). */
  const resetDefaultScrollPosition = () => {
    defaultScrollPositionApplied = false
    applyDefaultScrollPosition()
  }

  const dispose = () => {
    if (stateFrame !== null) window.cancelAnimationFrame(stateFrame)
    if (visibilityFrame !== null) window.cancelAnimationFrame(visibilityFrame)
    if (autoscrollingTimeout !== null) window.clearTimeout(autoscrollingTimeout)
    if (pendingScrollFrame !== null) window.cancelAnimationFrame(pendingScrollFrame)
    stateFrame = visibilityFrame = autoscrollingTimeout = pendingScrollFrame = null
    visibilityObserver?.disconnect()
    visibilityObserver = null
  }

  return {
    // commands
    scrollToEnd,
    scrollToMessage,
    scrollToStart,
    // wiring for the parts
    handleContentChange,
    handleResize,
    registerMessage,
    subscribeVisibility,
    syncAfterScroll,
    userScrollIntent,
    mount,
    syncAutoScroll,
    resetDefaultScrollPosition,
    dispose,
    setPreserveScrollOnPrepend: (value: boolean) => {
      preserveScrollOnPrepend = value
    },
    setRootElement: (element: HTMLDivElement | null) => {
      root = element
      if (element) writeStateAttributes(scrollable)
    },
    setViewportElement: (element: HTMLDivElement | null) => {
      viewport = element
      if (element) writeStateAttributes(scrollable)
    },
    setContentElement: (element: HTMLDivElement | null) => {
      content = element
    },
    setSpacerElement: (element: HTMLDivElement | null) => {
      spacer = element
      spacerGap = getFlexGap(element?.parentElement ?? null)
    },
    initialPendingDefaultScroll: pendingDefaultScroll,
  }
}

export type MessageScrollerController = ReturnType<typeof createMessageScrollerController>
