import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  omit,
  onSettled,
  untrack,
  useContext,
} from "solid-js"
import type { JSX } from "@solidjs/web"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import {
  compareDocumentOrder,
  createQuestionnaireCollection,
  getAnswerKeyShortcuts,
  getInitialItemName,
  getShortcutByChoiceValue,
  getShortcutFromKey,
  getShortcutKeys,
  hasInputValue,
  isAnswerFilled,
  isEmptyNavigableInput,
  isRadioTarget,
  isTextEntryTarget,
  type AnswerControlRegistration,
  type ItemRegistration,
  type QuestionnaireItemDefinition,
  type QuestionnaireItemStatus,
  type QuestionnaireShortcutMode,
} from "./utils"
import { renderProps } from "../render-props"

/**
 * Solid port of `@shadcn/react/questionnaire` (MIT): an unstyled multi-step questionnaire. `Root`
 * renders a native form and answers are read with `FormData`. Same parts, props, keyboard model
 * (shortcut keys, ArrowUp/Down between answers, ArrowLeft/Right between items, Enter and
 * Meta/Ctrl+Enter to confirm), validation and data attributes. Not ported: the development-only
 * warnings about mismatches between `Root.items` and the rendered items.
 */

type AnyProps = Record<string, unknown>
type PendingFocus = { name: string; target: "invalid" | "item" }

type QuestionnaireRootState = { current: number; first: boolean; last: boolean; total: number }

type QuestionnaireContextValue = QuestionnaireRootState & {
  readonly activeItem: ItemRegistration | null
  readonly activeItemName: string | null
  readonly activeItemRequired: boolean | null
  readonly activeItemStatus: QuestionnaireItemStatus | null
  readonly domVersion: number
  readonly itemDefinitionByName: ReadonlyMap<string, QuestionnaireItemDefinition> | null
  readonly nativeValidation: boolean
  readonly shortcuts: QuestionnaireShortcutMode | null
  goNext: () => void
  goPrevious: () => void
  registerItem: (registration: ItemRegistration) => () => void
  skipCurrent: () => void
}

type QuestionnaireItemContextValue = {
  readonly active: boolean
  readonly disabled: boolean
  readonly hasInputAnswer: boolean
  readonly invalid: boolean
  readonly multiple: boolean
  readonly name: string
  readonly required: boolean
  readonly resetVersion: number
  readonly selectedAnswerIds: string[]
  readonly shortcutByAnswerId: ReadonlyMap<string, string>
  readonly shortcutByChoiceValue: ReadonlyMap<string, string> | null
  readonly shortcuts: QuestionnaireShortcutMode | null
  readonly status: QuestionnaireItemStatus
  registerAnswerControl: (registration: AnswerControlRegistration) => () => void
  registerAnswerSelection: (answerId: string, defaultSelected: boolean) => () => void
  registerDescription: (id: string) => () => void
  registerError: (id: string) => () => void
  setAnswerDefault: (answerId: string, defaultSelected: boolean) => void
  setAnswerSelectionFromInteraction: (answerId: string, selected: boolean) => void
  syncControlledAnswerSelection: (answerId: string, selected: boolean) => void
}

type QuestionnaireChoiceState = {
  checked: boolean
  disabled: boolean
  invalid: boolean
  shortcut: string | null
  type: "checkbox" | "radio"
}

type QuestionnaireChoiceContextValue = {
  inputProps: () => AnyProps
  setInputElement: (element: HTMLInputElement) => void
  state: () => QuestionnaireChoiceState
}

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null)
const QuestionnaireItemContext = createContext<QuestionnaireItemContextValue | null>(null)
const QuestionnaireChoiceContext = createContext<QuestionnaireChoiceContextValue | null>(null)

function useQuestionnaireContext(component: string) {
  const context = useContext(QuestionnaireContext)
  if (!context) throw new Error(`${component} must be used within a Questionnaire.Root component.`)
  return context
}

function useQuestionnaireItemContext(component: string) {
  const context = useContext(QuestionnaireItemContext)
  if (!context) throw new Error(`${component} must be used within a Questionnaire.Item component.`)
  return context
}

function useQuestionnaireChoiceContext(component: string) {
  const context = useContext(QuestionnaireChoiceContext)
  if (!context) throw new Error(`${component} must be used within a Questionnaire.Choice component.`)
  return context
}

// Structural equality for memos recomputed on every DOM mutation (`domVersion`): returning an equal
// value keeps dependents (and their DOM) untouched, so the MutationObserver can't feed itself.
function sameArray<T>(a: readonly T[], b: readonly T[]) {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function sameMap<K, V>(a: ReadonlyMap<K, V> | null, b: ReadonlyMap<K, V> | null) {
  if (a === b) return true
  if (!a || !b || a.size !== b.size) return false
  for (const [key, value] of a) if (b.get(key) !== value) return false
  return true
}

function callHandler<E extends Event>(handler: unknown, event: E) {
  if (typeof handler === "function") (handler as (event: E) => void)(event)
}

function callRef<T>(ref: unknown, element: T) {
  if (typeof ref === "function") (ref as (el: T) => void)(element)
}

// --- Root ---------------------------------------------------------------------------------------

type QuestionnaireRootProps = Omit<useRender.ComponentProps<"form", QuestionnaireRootState>, "onSubmit" | "onReset"> & {
  defaultItem?: string
  item?: string
  items?: readonly QuestionnaireItemDefinition[]
  onItemChange?: (item: string) => void
  shortcuts?: QuestionnaireShortcutMode
  /** Defaults to true; `false` turns on native constraint validation of filled answers. */
  noValidate?: boolean
  onSubmit?: (event: SubmitEvent & { currentTarget: HTMLFormElement }) => void
  onReset?: (event: Event & { currentTarget: HTMLFormElement }) => void
}

function QuestionnaireRoot(props: QuestionnaireRootProps) {
  const rest = omit(
    props,
    "defaultItem",
    "item",
    "items",
    "noValidate",
    "onItemChange",
    "onReset",
    "onSubmit",
    "ref",
    "shortcuts",
    "render",
    "children",
  )
  const collection = createMemo(() => createQuestionnaireCollection(props.items))
  const [registrations, setRegistrations] = createSignal<ItemRegistration[]>([], { ownedWrite: true })
  const [uncontrolledItem, setUncontrolledItem] = createSignal<string | null>(
    untrack(() => getInitialItemName(collection(), props.defaultItem)),
  )
  const [domVersion, setDomVersion] = createSignal(0)
  let rootElement: HTMLFormElement | undefined
  let pendingFocus: PendingFocus | null = null

  const controlled = () => props.item !== undefined
  const shortcuts = () => props.shortcuts ?? null
  const nativeValidation = () => props.noValidate === false

  const runtimeItems = createMemo(
    () => {
      domVersion()
      return registrations()
        .filter((registration) => !registration.disabled)
        .sort(compareDocumentOrder)
    },
    { equals: sameArray },
  )
  const runtimeItemByName = createMemo(() => new Map(runtimeItems().map((item) => [item.name, item])))
  const logicalItems = createMemo((): readonly { name: string }[] => collection()?.enabledItems ?? runtimeItems())
  // Upstream moves an unknown or missing item to the first one in a layout effect; deriving it here
  // gives the same result without a state write.
  const activeItemName = createMemo(() => {
    const name = controlled() ? (props.item ?? null) : uncontrolledItem()
    const items = logicalItems()
    if (items.some((item) => item.name === name)) return name
    return items[0]?.name ?? null
  })
  const currentIndex = createMemo(() => logicalItems().findIndex((item) => item.name === activeItemName()))
  const activeItem = createMemo(() => {
    const name = activeItemName()
    return currentIndex() < 0 || !name ? null : (runtimeItemByName().get(name) ?? null)
  })
  const activeItemRequired = createMemo(() => {
    if (currentIndex() < 0) return null
    const name = activeItemName()
    const definition = name ? collection()?.itemByName.get(name) : undefined
    return definition ? Boolean(definition.required) : (activeItem()?.required ?? false)
  })
  const activeItemStatus = createMemo((): QuestionnaireItemStatus | null =>
    currentIndex() < 0 ? null : (activeItem()?.status ?? (activeItemName() ? "unanswered" : null)),
  )
  const orderedRegistrations = () => {
    const c = collection()
    if (!c) return runtimeItems()
    return c.enabledItems.flatMap((definition) => {
      const registration = runtimeItemByName().get(definition.name)
      return registration ? [registration] : []
    })
  }
  const total = () => logicalItems().length
  const current = () => (currentIndex() < 0 ? 0 : currentIndex() + 1)
  const first = () => total() > 0 && currentIndex() === 0
  const last = () => total() > 0 && currentIndex() === total() - 1

  const setItem = (nextItem: string, focusTarget: PendingFocus["target"] = "item") => {
    if (nextItem === activeItemName()) return
    pendingFocus = { name: nextItem, target: focusTarget }
    if (!controlled()) setUncontrolledItem(nextItem)
    props.onItemChange?.(nextItem)
  }

  // Focus the newly active item (or its first invalid control) once it is shown.
  createEffect(
    () => [activeItemName(), activeItem()] as const,
    ([name, item], previous) => {
      if (!pendingFocus || pendingFocus.name !== name) {
        if (controlled() && previous && previous[0] !== name) item?.focus()
        return
      }
      if (!item) return
      if (pendingFocus.target === "invalid") item.focusInvalid()
      else item.focus()
      pendingFocus = null
    },
  )

  onSettled(() => {
    if (!rootElement || typeof MutationObserver === "undefined") return
    const observer = new MutationObserver(() => setDomVersion((version) => version + 1))
    observer.observe(rootElement, { childList: true, subtree: true })
    return () => observer.disconnect()
  })

  const registerItem = (registration: ItemRegistration) => {
    setRegistrations((current) => [
      ...current.filter((r) => r.element !== registration.element && r.name !== registration.name),
      registration,
    ])
    return () => setRegistrations((current) => current.filter((r) => r !== registration))
  }

  const goPrevious = () => {
    if (currentIndex() <= 0) return
    setItem(logicalItems()[currentIndex() - 1].name)
  }

  const goNext = () => {
    const item = activeItem()
    if (!item || currentIndex() >= total() - 1) return
    if (!item.validate()) {
      item.focusInvalid()
      return
    }
    setItem(logicalItems()[currentIndex() + 1].name)
  }

  const confirmCurrent = () => {
    const item = activeItem()
    if (!item) return
    if (!item.validate()) {
      item.focusInvalid()
      return
    }
    if (last()) {
      rootElement?.requestSubmit()
      return
    }
    setItem(logicalItems()[currentIndex() + 1].name)
  }

  const skipCurrent = () => {
    const item = activeItem()
    if (!item || item.required) return
    item.skip()
    if (!last()) {
      setItem(logicalItems()[currentIndex() + 1].name)
      return
    }
    queueMicrotask(() => rootElement?.requestSubmit())
  }

  const handleReset = (event: Event & { currentTarget: HTMLFormElement }) => {
    props.onReset?.(event)
    if (event.defaultPrevented) return
    for (const registration of registrations()) registration.reset()
    const c = collection()
    const resetItemName = c
      ? getInitialItemName(c, props.defaultItem)
      : (runtimeItems().find((r) => r.name === props.defaultItem)?.name ?? runtimeItems()[0]?.name)
    if (resetItemName) setItem(resetItemName)
  }

  const handleSubmit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    const firstInvalidItem = orderedRegistrations().find((registration) => !registration.validate())
    if (firstInvalidItem) {
      event.preventDefault()
      setItem(firstInvalidItem.name, "invalid")
      if (firstInvalidItem.name === activeItemName()) {
        firstInvalidItem.focusInvalid()
        pendingFocus = null
      }
      return
    }
    props.onSubmit?.(event)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const item = activeItem()
    if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || !item || !(event.target instanceof Element)) {
      return
    }

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
      event.preventDefault()
      if (!event.repeat) confirmCurrent()
      return
    }

    if (event.metaKey || event.ctrlKey || event.altKey) return

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (item.moveAnswerFocus(event.target, event.key === "ArrowDown" ? "next" : "previous")) {
        event.preventDefault()
        return
      }
    }

    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !isTextEntryTarget(event.target) && !isRadioTarget(event.target)) {
      event.preventDefault()
      if (event.repeat) return
      if (event.key === "ArrowLeft") goPrevious()
      else if (item.status !== "unanswered") goNext()
      return
    }

    if (event.key === "Enter") {
      const answer = item.getAnswerByElement(event.target)
      if (!answer) return
      event.preventDefault()
      if (!event.repeat && isAnswerFilled(answer)) confirmCurrent()
      return
    }

    const mode = shortcuts()
    if (!mode || isTextEntryTarget(event.target)) return
    const shortcut = getShortcutFromKey(event.key, mode)
    const answer = shortcut ? item.getAnswerByShortcut(shortcut) : null
    if (!answer) return
    event.preventDefault()
    if (event.repeat) return
    answer.element.focus()
    if (answer.type === "choice") answer.element.click()
  }

  const context: QuestionnaireContextValue = {
    get current() {
      return current()
    },
    get first() {
      return first()
    },
    get last() {
      return last()
    },
    get total() {
      return total()
    },
    get activeItem() {
      return activeItem()
    },
    get activeItemName() {
      return activeItemName()
    },
    get activeItemRequired() {
      return activeItemRequired()
    },
    get activeItemStatus() {
      return activeItemStatus()
    },
    get domVersion() {
      return domVersion()
    },
    get itemDefinitionByName() {
      return collection()?.itemByName ?? null
    },
    get nativeValidation() {
      return nativeValidation()
    },
    get shortcuts() {
      return shortcuts()
    },
    goNext,
    goPrevious,
    registerItem,
    skipCurrent,
  }

  return (
    <QuestionnaireContext value={context}>
      {useRender({
        defaultTagName: "form",
        get render() {
          return props.render
        },
        get children() {
          return props.children
        },
        ref: (element: Element) => {
          rootElement = element as HTMLFormElement
          callRef(
            untrack(() => props.ref),
            element,
          )
        },
        state: () => ({ current: current(), first: first(), last: last(), total: total() }),
        props: renderProps(() => {
          return mergeProps<AnyProps>(
            {
              "data-shortcuts": shortcuts() ?? undefined,
              novalidate: props.noValidate === false ? undefined : true,
              onKeyDown: handleKeyDown,
              onReset: handleReset,
              onSubmit: handleSubmit,
            },
            rest as AnyProps,
          )
        }),
      })}
    </QuestionnaireContext>
  )
}

// --- Progress -----------------------------------------------------------------------------------

type QuestionnaireProgressProps = useRender.ComponentProps<"div", QuestionnaireRootState>

function QuestionnaireProgress(props: QuestionnaireProgressProps) {
  const rest = omit(props, "children", "render")
  const root = useQuestionnaireContext("Questionnaire.Progress")
  const label = () => (root.total ? `Question ${root.current} of ${root.total}` : undefined)
  return useRender({
    defaultTagName: "div",
    get render() {
      return props.render
    },
    get children() {
      return props.children ?? label()
    },
    state: () => ({ current: root.current, first: root.first, last: root.last, total: root.total }),
    props: renderProps(() => {
      return mergeProps<AnyProps>(
        {
          "aria-label": "Questionnaire progress",
          "aria-live": "polite",
          "aria-valuemax": root.total || undefined,
          "aria-valuemin": root.total ? 1 : undefined,
          "aria-valuenow": root.total ? root.current : undefined,
          "aria-valuetext": label(),
          role: "progressbar",
        },
        rest as AnyProps,
      )
    }),
  })
}

// --- Item ---------------------------------------------------------------------------------------

type QuestionnaireItemState = {
  active: boolean
  disabled: boolean
  invalid: boolean
  multiple: boolean
  required: boolean
  status: QuestionnaireItemStatus
}

type QuestionnaireItemProps = Omit<useRender.ComponentProps<"fieldset", QuestionnaireItemState>, "name"> & {
  invalid?: boolean
  name: string
  multiple?: boolean
  onStatusChange?: (status: QuestionnaireItemStatus) => void
  required?: boolean
  disabled?: boolean
}

function QuestionnaireItem(props: QuestionnaireItemProps) {
  const rest = omit(
    props,
    "aria-describedby",
    "aria-keyshortcuts",
    "children",
    "disabled",
    "invalid",
    "multiple",
    "name",
    "onStatusChange",
    "ref",
    "required",
    "render",
  )
  const root = useQuestionnaireContext("Questionnaire.Item")
  let element: HTMLFieldSetElement | undefined
  const [controls, setControls] = createSignal<AnswerControlRegistration[]>([], { ownedWrite: true })
  const [validationAttempted, setValidationAttempted] = createSignal(false)
  const [selectedAnswerIds, setSelectedAnswerIds] = createSignal<string[]>([], { ownedWrite: true })
  const [skipped, setSkipped] = createSignal(false)
  const [resetVersion, setResetVersion] = createSignal(0)
  const [descriptionIds, setDescriptionIds] = createSignal<string[]>([], { ownedWrite: true })
  const [errorIds, setErrorIds] = createSignal<string[]>([], { ownedWrite: true })
  let defaultSelectedAnswerIds: string[] = []

  const disabled = () => props.disabled ?? false
  const multiple = () => props.multiple ?? false
  const required = () => props.required ?? false
  const active = () => !disabled() && root.activeItemName === props.name
  const answerControls = createMemo(
    () => {
      root.domVersion
      return [...controls()].sort(compareDocumentOrder)
    },
    { equals: sameArray },
  )
  const answers = createMemo(() => answerControls().filter((answer) => !answer.disabled), { equals: sameArray })
  const answered = () => answers().some((answer) => selectedAnswerIds().includes(answer.id))
  const status = createMemo((): QuestionnaireItemStatus => (skipped() ? "skipped" : answered() ? "answered" : "unanswered"))
  const intentionallySkipped = () => status() === "skipped" && !required()
  const valid = () => disabled() || intentionallySkipped() || (!(props.invalid ?? false) && status() === "answered")
  const invalid = () =>
    !disabled() && !intentionallySkipped() && ((props.invalid ?? false) || (validationAttempted() && !valid()))
  const hasInputAnswer = () => answers().some((answer) => answer.type === "input")
  const shortcutByChoiceValue = createMemo(
    () =>
      root.itemDefinitionByName
        ? getShortcutByChoiceValue(root.itemDefinitionByName.get(props.name), root.shortcuts)
        : null,
    { equals: sameMap },
  )
  const shortcutByAnswerId = createMemo(
    () => {
      if (shortcutByChoiceValue()) return new Map<string, string>()
      const keys = getShortcutKeys(root.shortcuts)
      const choices = answers().filter((answer) => answer.type === "choice")
      return new Map(choices.slice(0, keys.length).map((answer, index) => [answer.id, keys[index]]))
    },
    { equals: sameMap },
  )

  createEffect(
    status,
    (value) => {
      props.onStatusChange?.(value)
    },
    { defer: true },
  )

  // A single-select item keeps one answer when `multiple` turns off.
  createEffect(
    multiple,
    (isMultiple, wasMultiple) => {
      if (!wasMultiple || isMultiple) return
      setSelectedAnswerIds((ids) => {
        const selected = answers().find((answer) => ids.includes(answer.id))
        return selected ? [selected.id] : []
      })
    },
    { defer: true },
  )

  const updateAnswerSelected = (answerId: string, selected: boolean) => {
    setSelectedAnswerIds((ids) => {
      if (!selected) return ids.filter((id) => id !== answerId)
      if (!multiple()) return [answerId]
      return ids.includes(answerId) ? ids : [...ids, answerId]
    })
  }

  const validate = () => {
    setValidationAttempted(true)
    if (!valid()) return false
    if (!root.nativeValidation) return true
    const invalidAnswer = answers().find(
      (answer) => isAnswerFilled(answer) && answer.element.willValidate && !answer.element.validity.valid,
    )
    if (!invalidAnswer) return true
    invalidAnswer.element.focus()
    invalidAnswer.element.reportValidity()
    return false
  }

  const registration: ItemRegistration = {
    get choices() {
      return answerControls().flatMap((answer) =>
        answer.type === "choice" ? [{ disabled: answer.ownDisabled, value: answer.value }] : [],
      )
    },
    get disabled() {
      return disabled()
    },
    get element() {
      return element as HTMLFieldSetElement
    },
    get name() {
      return props.name
    },
    get required() {
      return required()
    },
    get status() {
      return status()
    },
    focus: () => element?.focus(),
    focusInvalid: () => {
      const selectedInput = element?.querySelector<HTMLInputElement>("input[data-filled][name]:not(:disabled)")
      const firstControl = element?.querySelector<HTMLElement>(
        "input:not([type=hidden]):not(:disabled), textarea:not(:disabled)",
      )
      ;(selectedInput ?? firstControl ?? element)?.focus()
    },
    getAnswerByElement: (answerElement) => answers().find((answer) => answer.element === answerElement) ?? null,
    getAnswerByShortcut: (shortcut) => {
      const byValue = shortcutByChoiceValue()
      if (byValue) {
        const choiceValue = Array.from(byValue.entries()).find(([, s]) => s === shortcut)?.[0]
        return answers().find((answer) => answer.type === "choice" && answer.value === choiceValue) ?? null
      }
      const answerId = Array.from(shortcutByAnswerId().entries()).find(([, s]) => s === shortcut)?.[0]
      return answers().find((answer) => answer.id === answerId) ?? null
    },
    moveAnswerFocus: (currentElement, direction) => {
      const list = answers()
      const currentIndex = list.findIndex((answer) => answer.element === currentElement)
      const currentAnswer = currentIndex < 0 ? null : (list[currentIndex] ?? null)
      if (
        !list.length ||
        (isTextEntryTarget(currentElement) && !isEmptyNavigableInput(currentAnswer)) ||
        (currentIndex < 0 && currentElement !== element)
      ) {
        return false
      }
      const nextAnswer =
        currentIndex < 0
          ? (list.find(isAnswerFilled) ?? (direction === "next" ? list[0] : list[list.length - 1]))
          : list[(currentIndex + (direction === "next" ? 1 : -1) + list.length) % list.length]
      if (!nextAnswer || nextAnswer.element === currentElement) return false
      if (currentIndex >= 0 && isRadioTarget(currentElement) && isRadioTarget(nextAnswer.element)) return false
      nextAnswer.element.focus()
      if (nextAnswer.type === "choice" && isRadioTarget(nextAnswer.element)) nextAnswer.element.click()
      return true
    },
    reset: () => {
      setValidationAttempted(false)
      setSkipped(false)
      setSelectedAnswerIds(multiple() ? [...defaultSelectedAnswerIds] : defaultSelectedAnswerIds.slice(0, 1))
      setResetVersion((version) => version + 1)
    },
    skip: () => {
      if (required()) return
      setSelectedAnswerIds([])
      setSkipped(true)
    },
    validate,
  }

  onSettled(() => (element ? root.registerItem(registration) : undefined))

  const context: QuestionnaireItemContextValue = {
    get active() {
      return active()
    },
    get disabled() {
      return disabled()
    },
    get hasInputAnswer() {
      return hasInputAnswer()
    },
    get invalid() {
      return invalid()
    },
    get multiple() {
      return multiple()
    },
    get name() {
      return props.name
    },
    get required() {
      return required()
    },
    get resetVersion() {
      return resetVersion()
    },
    get selectedAnswerIds() {
      return selectedAnswerIds()
    },
    get shortcutByAnswerId() {
      return shortcutByAnswerId()
    },
    get shortcutByChoiceValue() {
      return shortcutByChoiceValue()
    },
    get shortcuts() {
      return root.shortcuts
    },
    get status() {
      return status()
    },
    registerAnswerControl: (control) => {
      setControls((current) => [
        ...current.filter((c) => c.element !== control.element && c.id !== control.id),
        control,
      ])
      return () => setControls((current) => current.filter((c) => c !== control))
    },
    registerAnswerSelection: (answerId, defaultSelected) => {
      if (defaultSelected) {
        defaultSelectedAnswerIds = [...defaultSelectedAnswerIds.filter((id) => id !== answerId), answerId]
        setSelectedAnswerIds((ids) => {
          if (!untrack(multiple)) return ids.length ? ids : [answerId]
          return ids.includes(answerId) ? ids : [...ids, answerId]
        })
      }
      return () => {
        defaultSelectedAnswerIds = defaultSelectedAnswerIds.filter((id) => id !== answerId)
        setSelectedAnswerIds((ids) => ids.filter((id) => id !== answerId))
      }
    },
    registerDescription: (id) => {
      setDescriptionIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
      return () => setDescriptionIds((ids) => ids.filter((current) => current !== id))
    },
    registerError: (id) => {
      setErrorIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
      return () => setErrorIds((ids) => ids.filter((current) => current !== id))
    },
    setAnswerDefault: (answerId, defaultSelected) => {
      defaultSelectedAnswerIds = defaultSelected
        ? defaultSelectedAnswerIds.includes(answerId)
          ? defaultSelectedAnswerIds
          : [...defaultSelectedAnswerIds, answerId]
        : defaultSelectedAnswerIds.filter((id) => id !== answerId)
    },
    setAnswerSelectionFromInteraction: (answerId, selected) => {
      setSkipped(false)
      updateAnswerSelected(answerId, selected)
    },
    syncControlledAnswerSelection: (answerId, selected) => {
      if (selected) setSkipped(false)
      updateAnswerSelected(answerId, selected)
    },
  }

  const describedBy = () =>
    [...descriptionIds(), ...(invalid() ? errorIds() : []), props["aria-describedby"]].filter(Boolean).join(" ") ||
    undefined
  const keyShortcuts = () =>
    [
      props["aria-keyshortcuts"],
      active() ? "Meta+Enter Control+Enter" : undefined,
      active() && answers().length ? "ArrowUp ArrowDown" : undefined,
      active() && !root.first ? "ArrowLeft" : undefined,
      active() && !root.last && status() !== "unanswered" ? "ArrowRight" : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <QuestionnaireItemContext value={context}>
      {useRender({
        defaultTagName: "fieldset",
        get render() {
          return props.render
        },
        get children() {
          return props.children
        },
        ref: (node: Element) => {
          element = node as HTMLFieldSetElement
          callRef(
            untrack(() => props.ref),
            node,
          )
        },
        state: () => ({
          active: active(),
          disabled: disabled(),
          invalid: invalid(),
          multiple: multiple(),
          required: required(),
          status: status(),
        }),
        stateAttributesMapping: {
          active: (isActive: boolean) => (isActive ? { "data-active": "" } : null),
        },
        props: renderProps(() => {
          return mergeProps<AnyProps>(
            {
              "aria-describedby": describedBy(),
              "aria-invalid": invalid() ? "true" : undefined,
              "aria-keyshortcuts": keyShortcuts(),
              disabled: disabled() || undefined,
              hidden: active() ? undefined : true,
              inert: active() ? undefined : "",
              tabindex: -1,
            },
            rest as AnyProps,
          )
        }),
      })}
    </QuestionnaireItemContext>
  )
}

// --- Title, description, choices ----------------------------------------------------------------

type QuestionnaireTitleProps = useRender.ComponentProps<"legend">

function QuestionnaireTitle(props: QuestionnaireTitleProps) {
  useQuestionnaireItemContext("Questionnaire.Title")
  const rest = omit(props, "render", "children")
  return useRender({
    defaultTagName: "legend",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    props: renderProps(() => {
      return rest as AnyProps
    }),
  })
}

type QuestionnaireDescriptionProps = useRender.ComponentProps<"p">

function QuestionnaireDescription(props: QuestionnaireDescriptionProps) {
  const item = useQuestionnaireItemContext("Questionnaire.Description")
  const rest = omit(props, "render", "children", "id")
  const generatedId = createUniqueId()
  const descriptionId = () => (typeof props.id === "string" && props.id) || generatedId
  onSettled(() => item.registerDescription(untrack(descriptionId)))
  return useRender({
    defaultTagName: "p",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    props: renderProps(() => {
      return mergeProps<AnyProps>({ id: descriptionId() }, rest as AnyProps)
    }),
  })
}

type QuestionnaireChoicesState = { shortcuts: QuestionnaireShortcutMode | null }
type QuestionnaireChoicesProps = useRender.ComponentProps<"div", QuestionnaireChoicesState>

function QuestionnaireChoices(props: QuestionnaireChoicesProps) {
  const item = useQuestionnaireItemContext("Questionnaire.Choices")
  const rest = omit(props, "render", "children")
  return useRender({
    defaultTagName: "div",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    state: () => ({ shortcuts: item.shortcuts }),
    props: renderProps(() => {
      return rest as AnyProps
    }),
  })
}

// --- Choice -------------------------------------------------------------------------------------

/** A state attribute mapping that sets one of two data attributes. */
function flag(on: string, off: string) {
  return (value: boolean): Record<string, string> => (value ? { [on]: "" } : { [off]: "" })
}

const checkedMapping = { checked: flag("data-checked", "data-unchecked") }

type QuestionnaireChoiceProps = Omit<useRender.ComponentProps<"label", QuestionnaireChoiceState>, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (event: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => void
  value: string
}

function QuestionnaireChoice(props: QuestionnaireChoiceProps) {
  const item = useQuestionnaireItemContext("Questionnaire.Choice")
  const rest = omit(props, "checked", "children", "defaultChecked", "disabled", "onChange", "render", "value")
  const answerId = createUniqueId()
  let inputElement: HTMLInputElement | undefined

  const controlled = () => props.checked !== undefined
  const disabled = () => item.disabled || (props.disabled ?? false)
  const selected = () => item.selectedAnswerIds.includes(answerId)
  const checked = () => (controlled() ? (item.status === "skipped" ? false : (props.checked ?? false)) : selected())
  const type = (): "checkbox" | "radio" => (item.multiple ? "checkbox" : "radio")
  const shortcut = () => item.shortcutByChoiceValue?.get(props.value) ?? item.shortcutByAnswerId.get(answerId) ?? null

  onSettled(() => {
    const unselect = item.registerAnswerSelection(answerId, untrack(() => props.defaultChecked ?? false))
    const unregister = inputElement
      ? item.registerAnswerControl({
          get disabled() {
            return disabled()
          },
          element: inputElement,
          id: answerId,
          get ownDisabled() {
            return props.disabled ?? false
          },
          type: "choice",
          get value() {
            return props.value
          },
        })
      : undefined
    return () => {
      unselect()
      unregister?.()
    }
  })

  createEffect(
    () => props.defaultChecked ?? false,
    (defaultChecked) => {
      item.setAnswerDefault(answerId, defaultChecked)
    },
  )

  createEffect(
    () => [controlled(), props.checked, item.resetVersion] as const,
    ([isControlled, value]) => {
      if (isControlled) item.syncControlledAnswerSelection(answerId, value ?? false)
    },
  )

  // Keep the native reset target aligned with the owned default.
  createEffect(
    () => [checked(), item.resetVersion] as const,
    ([isChecked, resetVersion]) => {
      if (!inputElement) return
      inputElement.defaultChecked = controlled() ? (props.checked ?? false) : (props.defaultChecked ?? false)
      if (resetVersion > 0) inputElement.checked = isChecked
    },
  )

  const handleChange = (event: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => {
    props.onChange?.(event)
    if (event.defaultPrevented) return
    if (!controlled()) {
      item.setAnswerSelectionFromInteraction(answerId, event.currentTarget.checked)
      return
    }
    if (item.status === "skipped" && props.checked === event.currentTarget.checked) {
      item.setAnswerSelectionFromInteraction(answerId, props.checked)
    }
  }

  const state = (): QuestionnaireChoiceState => ({
    checked: checked(),
    disabled: disabled(),
    invalid: item.invalid,
    shortcut: shortcut(),
    type: type(),
  })

  const inputProps = (): AnyProps => ({
    "aria-invalid": item.invalid ? "true" : undefined,
    "aria-keyshortcuts": getAnswerKeyShortcuts(shortcut(), !disabled() && checked()),
    checked: checked(),
    disabled: disabled() || undefined,
    id: answerId,
    name: item.status === "skipped" ? undefined : item.name,
    onChange: handleChange,
    required: item.required && !item.multiple && !item.hasInputAnswer ? true : undefined,
    type: type(),
    value: props.value,
  })

  return (
    <QuestionnaireChoiceContext
      value={{
        inputProps,
        state,
        setInputElement: (element) => {
          inputElement = element
        },
      }}
    >
      {useRender({
        defaultTagName: "label",
        get render() {
          return props.render
        },
        get children() {
          return props.children
        },
        state,
        stateAttributesMapping: checkedMapping,
        props: renderProps(() => {
          return rest as AnyProps
        }),
      })}
    </QuestionnaireChoiceContext>
  )
}

type QuestionnaireChoiceInputProps = Omit<
  useRender.ComponentProps<"input", QuestionnaireChoiceState>,
  "checked" | "disabled" | "name" | "onChange" | "required" | "type" | "value"
>

function QuestionnaireChoiceInput(props: QuestionnaireChoiceInputProps) {
  const choice = useQuestionnaireChoiceContext("Questionnaire.ChoiceInput")
  const rest = omit(props, "render", "ref")
  return useRender({
    defaultTagName: "input",
    get render() {
      return props.render
    },
    ref: (element: Element) => {
      choice.setInputElement(element as HTMLInputElement)
      callRef(
        untrack(() => props.ref),
        element,
      )
    },
    state: choice.state,
    stateAttributesMapping: checkedMapping,
    props: renderProps(() => {
      return mergeProps<AnyProps>(choice.inputProps(), rest as AnyProps)
    }),
  })
}

type QuestionnaireChoiceLabelProps = useRender.ComponentProps<"span">

function QuestionnaireChoiceLabel(props: QuestionnaireChoiceLabelProps) {
  useQuestionnaireChoiceContext("Questionnaire.ChoiceLabel")
  const rest = omit(props, "render", "children")
  return useRender({
    defaultTagName: "span",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    props: renderProps(() => {
      return rest as AnyProps
    }),
  })
}

type QuestionnaireChoiceShortcutProps = useRender.ComponentProps<"span", { shortcut: string | null }>

function QuestionnaireChoiceShortcut(props: QuestionnaireChoiceShortcutProps) {
  const choice = useQuestionnaireChoiceContext("Questionnaire.ChoiceShortcut")
  const rest = omit(props, "render", "children")
  return useRender({
    defaultTagName: "span",
    get render() {
      return props.render
    },
    get children() {
      return props.children ?? choice.state().shortcut
    },
    state: () => ({ shortcut: choice.state().shortcut }),
    props: renderProps(() => {
      return mergeProps<AnyProps>(
        { "aria-hidden": "true", hidden: choice.state().shortcut === null ? true : undefined },
        rest as AnyProps,
      )
    }),
  })
}

// --- Input --------------------------------------------------------------------------------------

type QuestionnaireInputState = { disabled: boolean; filled: boolean; invalid: boolean }
type QuestionnaireInputType =
  | "date"
  | "datetime-local"
  | "email"
  | "month"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week"

type QuestionnaireInputProps = Omit<
  useRender.ComponentProps<"input", QuestionnaireInputState>,
  "form" | "name" | "type" | "value"
> & {
  type?: QuestionnaireInputType
  value?: string
  defaultValue?: string
  disabled?: boolean
}

function QuestionnaireInput(props: QuestionnaireInputProps) {
  const item = useQuestionnaireItemContext("Questionnaire.Input")
  const rest = omit(props, "defaultValue", "disabled", "onInput", "ref", "render", "type", "value")
  const answerId = createUniqueId()
  let inputElement: HTMLInputElement | undefined
  const controlled = () => props.value !== undefined
  const defaultFilled = () => hasInputValue(props.defaultValue)
  const [uncontrolledFilled, setUncontrolledFilled] = createSignal(untrack(defaultFilled))
  const disabled = () => item.disabled || (props.disabled ?? false)
  const filled = () => (controlled() ? hasInputValue(props.value) : uncontrolledFilled())
  const selected = () => item.selectedAnswerIds.includes(answerId)

  onSettled(() => {
    const unselect = item.registerAnswerSelection(answerId, untrack(defaultFilled))
    const unregister = inputElement
      ? item.registerAnswerControl({
          get disabled() {
            return disabled()
          },
          element: inputElement,
          id: answerId,
          type: "input",
        })
      : undefined
    return () => {
      unselect()
      unregister?.()
    }
  })

  createEffect(defaultFilled, (value) => {
    item.setAnswerDefault(answerId, value)
  })

  createEffect(
    () => [controlled(), hasInputValue(props.value), item.resetVersion] as const,
    ([isControlled, controlledFilled, resetVersion]) => {
      if (isControlled) {
        item.syncControlledAnswerSelection(answerId, controlledFilled)
        return
      }
      if (resetVersion > 0) setUncontrolledFilled(untrack(defaultFilled))
    },
  )

  createEffect(
    () => props.value,
    (value) => {
      if (inputElement && value !== undefined) inputElement.defaultValue = String(value)
    },
  )

  // React's onChange for text inputs is the input event.
  const handleInput = (event: InputEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => {
    callHandler(props.onInput, event)
    if (event.defaultPrevented || controlled()) return
    const nextFilled = event.currentTarget.value.trim().length > 0
    setUncontrolledFilled(nextFilled)
    item.setAnswerSelectionFromInteraction(answerId, nextFilled)
  }

  return useRender({
    defaultTagName: "input",
    get render() {
      return props.render
    },
    ref: (element: Element) => {
      inputElement = element as HTMLInputElement
      // Uncontrolled: the default value is set once, like React's defaultValue.
      const defaultValue = untrack(() => props.defaultValue)
      if (!untrack(controlled) && defaultValue !== undefined) inputElement.value = defaultValue
      callRef(
        untrack(() => props.ref),
        element,
      )
    },
    state: () => ({ disabled: disabled(), filled: filled(), invalid: item.invalid }),
    stateAttributesMapping: {
      filled: flag("data-filled", "data-empty"),
    },
    props: renderProps(() => {
      return mergeProps<AnyProps>(
        {
          "aria-invalid": item.invalid ? "true" : undefined,
          "aria-keyshortcuts": getAnswerKeyShortcuts(null, !disabled() && filled() && selected()),
          disabled: disabled() || undefined,
          // Not submitted with the form until it holds an answer.
          form: selected() ? undefined : "",
          id: answerId,
          name: selected() ? item.name : undefined,
          onInput: handleInput,
          type: props.type ?? "text",
          ...(controlled() ? { value: props.value } : {}),
        },
        rest as AnyProps,
      )
    }),
  })
}

// --- Error --------------------------------------------------------------------------------------

type QuestionnaireErrorProps = useRender.ComponentProps<"p", { invalid: boolean }>

function QuestionnaireError(props: QuestionnaireErrorProps) {
  const item = useQuestionnaireItemContext("Questionnaire.Error")
  const rest = omit(props, "children", "id", "render")
  const generatedId = createUniqueId()
  const errorId = () => (typeof props.id === "string" && props.id) || generatedId
  onSettled(() => item.registerError(untrack(errorId)))
  return useRender({
    defaultTagName: "p",
    get render() {
      return props.render
    },
    get children() {
      return (
        props.children ??
        (item.required ? "Choose an answer to continue." : "Choose an answer or skip this question.")
      )
    },
    state: () => ({ invalid: item.invalid }),
    props: renderProps(() => {
      return mergeProps<AnyProps>(
        { hidden: item.invalid ? undefined : true, id: errorId(), role: item.invalid ? "alert" : undefined },
        rest as AnyProps,
      )
    }),
  })
}

// --- Navigation ---------------------------------------------------------------------------------

type QuestionnaireNavigationState = {
  disabled: boolean
  shortcut: "Enter" | null
  status: QuestionnaireItemStatus | null
  visible: boolean
}

type QuestionnaireNavigationProps = useRender.ComponentProps<"button", QuestionnaireNavigationState> & {
  disabled?: boolean
}

function NavigationButton(
  props: QuestionnaireNavigationProps,
  options: {
    label: string
    type: "button" | "submit"
    shortcut?: "Enter"
    visible: () => boolean
    onClick?: () => void
  },
) {
  const root = useQuestionnaireContext("Questionnaire navigation")
  const rest = omit(props, "children", "disabled", "onClick", "render", "tabindex", "type")
  const disabled = () => props.disabled ?? false
  const activeShortcut = () => (options.visible() && !disabled() ? (options.shortcut ?? null) : null)
  return useRender({
    defaultTagName: "button",
    get render() {
      return props.render
    },
    get children() {
      return props.children ?? options.label
    },
    state: () => ({
      disabled: disabled(),
      shortcut: activeShortcut(),
      status: root.activeItemStatus,
      visible: options.visible(),
    }),
    stateAttributesMapping: {
      visible: flag("data-visible", "data-hidden"),
    },
    props: renderProps(() => {
      return mergeProps<AnyProps>(
        {
          "aria-hidden": options.visible() ? undefined : "true",
          "aria-keyshortcuts": activeShortcut() ?? undefined,
          disabled: disabled() || undefined,
          hidden: options.visible() ? undefined : true,
          inert: options.visible() ? undefined : "",
          onClick: (event: MouseEvent) => {
            callHandler(props.onClick, event)
            if (!event.defaultPrevented) options.onClick?.()
          },
          tabindex: options.visible() ? props.tabindex : -1,
          type: props.type ?? options.type,
        },
        rest as AnyProps,
      )
    }),
  })
}

function QuestionnairePrevious(props: QuestionnaireNavigationProps) {
  const root = useQuestionnaireContext("Questionnaire.Previous")
  return NavigationButton(props, {
    label: "Previous",
    type: "button",
    visible: () => root.total > 1 && !root.first,
    onClick: () => root.goPrevious(),
  })
}

function QuestionnaireSkip(props: QuestionnaireNavigationProps) {
  const root = useQuestionnaireContext("Questionnaire.Skip")
  return NavigationButton(props, {
    label: "Skip",
    type: "button",
    visible: () => root.activeItemRequired === false,
    onClick: () => root.skipCurrent(),
  })
}

function QuestionnaireNext(props: QuestionnaireNavigationProps) {
  const root = useQuestionnaireContext("Questionnaire.Next")
  return NavigationButton(props, {
    label: "Next",
    type: "button",
    shortcut: "Enter",
    visible: () => root.total > 1 && !root.last,
    onClick: () => root.goNext(),
  })
}

function QuestionnaireSubmit(props: QuestionnaireNavigationProps) {
  const root = useQuestionnaireContext("Questionnaire.Submit")
  return NavigationButton(props, {
    label: "Submit",
    type: "submit",
    shortcut: "Enter",
    visible: () => root.total > 0 && root.last,
  })
}

const Questionnaire = {
  Root: QuestionnaireRoot,
  Progress: QuestionnaireProgress,
  Item: QuestionnaireItem,
  Title: QuestionnaireTitle,
  Description: QuestionnaireDescription,
  Choices: QuestionnaireChoices,
  Choice: QuestionnaireChoice,
  ChoiceInput: QuestionnaireChoiceInput,
  ChoiceLabel: QuestionnaireChoiceLabel,
  ChoiceShortcut: QuestionnaireChoiceShortcut,
  Input: QuestionnaireInput,
  Error: QuestionnaireError,
  Previous: QuestionnairePrevious,
  Skip: QuestionnaireSkip,
  Next: QuestionnaireNext,
  Submit: QuestionnaireSubmit,
}

export {
  Questionnaire,
  type QuestionnaireRootProps,
  type QuestionnaireProgressProps,
  type QuestionnaireItemProps,
  type QuestionnaireTitleProps,
  type QuestionnaireDescriptionProps,
  type QuestionnaireChoicesProps,
  type QuestionnaireChoiceProps,
  type QuestionnaireChoiceInputProps,
  type QuestionnaireChoiceLabelProps,
  type QuestionnaireChoiceShortcutProps,
  type QuestionnaireInputProps,
  type QuestionnaireErrorProps,
  type QuestionnaireNavigationProps,
  type QuestionnaireChoiceState,
  type QuestionnaireItemState,
  type QuestionnaireRootState,
  type QuestionnaireNavigationState,
  type QuestionnaireItemStatus,
  type QuestionnaireShortcutMode,
  type QuestionnaireItemDefinition,
}
