// Port of @shadcn/react's questionnaire utils.ts and collection.ts (MIT), without the dev warnings.

export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped"
export type QuestionnaireShortcutMode = "letters" | "numbers"

export type QuestionnaireChoiceDefinition = { disabled?: boolean; value: string }

export type QuestionnaireItemDefinition = {
  choices?: readonly QuestionnaireChoiceDefinition[]
  disabled?: boolean
  name: string
  required?: boolean
}

export type AnswerControlRegistration = {
  readonly disabled: boolean
  element: HTMLInputElement
  id: string
} & ({ readonly ownDisabled: boolean; type: "choice"; readonly value: string } | { type: "input" })

export type ItemRegistration = {
  readonly choices: readonly { disabled: boolean; value: string }[]
  readonly disabled: boolean
  element: HTMLFieldSetElement
  focus: () => void
  focusInvalid: () => void
  getAnswerByElement: (element: Element) => AnswerControlRegistration | null
  getAnswerByShortcut: (shortcut: string) => AnswerControlRegistration | null
  moveAnswerFocus: (element: Element, direction: "next" | "previous") => boolean
  readonly name: string
  readonly required: boolean
  reset: () => void
  skip: () => void
  readonly status: QuestionnaireItemStatus
  validate: () => boolean
}

export type QuestionnaireCollection = {
  enabledItems: readonly QuestionnaireItemDefinition[]
  itemByName: ReadonlyMap<string, QuestionnaireItemDefinition>
  items: readonly QuestionnaireItemDefinition[]
}

export function createQuestionnaireCollection(
  items: readonly QuestionnaireItemDefinition[] | undefined,
): QuestionnaireCollection | null {
  if (items === undefined) return null
  return {
    enabledItems: items.filter((item) => !item.disabled),
    itemByName: new Map(items.map((item) => [item.name, item])),
    items,
  }
}

export function getInitialItemName(collection: QuestionnaireCollection | null, defaultItem: string | undefined) {
  if (!collection) return defaultItem ?? null
  const defaultDefinition = defaultItem ? collection.itemByName.get(defaultItem) : undefined
  if (defaultDefinition && !defaultDefinition.disabled) return defaultDefinition.name
  return collection.enabledItems[0]?.name ?? null
}

export function getShortcutByChoiceValue(
  item: QuestionnaireItemDefinition | undefined,
  shortcuts: QuestionnaireShortcutMode | null,
) {
  const shortcutByChoiceValue = new Map<string, string>()
  if (!item || !shortcuts) return shortcutByChoiceValue
  const keys = getShortcutKeys(shortcuts)
  let shortcutIndex = 0
  for (const choice of item.choices ?? []) {
    if (choice.disabled) continue
    const shortcut = keys[shortcutIndex]
    if (!shortcut) break
    shortcutByChoiceValue.set(choice.value, shortcut)
    shortcutIndex += 1
  }
  return shortcutByChoiceValue
}

export function hasInputValue(value: unknown) {
  if (Array.isArray(value)) return value.some((item) => String(item).trim().length > 0)
  return value !== undefined && value !== null && String(value).trim().length > 0
}

export function getShortcutKeys(shortcuts: QuestionnaireShortcutMode | null) {
  if (shortcuts === "letters") return Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))
  if (shortcuts === "numbers") return Array.from({ length: 9 }, (_, index) => String(index + 1))
  return []
}

export function getShortcutFromKey(key: string, shortcuts: QuestionnaireShortcutMode) {
  const normalizedKey = shortcuts === "letters" ? key.toUpperCase() : key
  return getShortcutKeys(shortcuts).includes(normalizedKey) ? normalizedKey : null
}

export function getAnswerKeyShortcuts(shortcut: string | null, filled: boolean) {
  return [shortcut, filled ? "Enter" : null].filter(Boolean).join(" ") || undefined
}

export function isAnswerFilled(answer: AnswerControlRegistration) {
  if (answer.type === "choice") return answer.element.checked
  return answer.element.hasAttribute("name") && hasInputValue(answer.element.value)
}

export function isEmptyNavigableInput(answer: AnswerControlRegistration | null) {
  return (
    answer?.type === "input" &&
    ["email", "password", "search", "tel", "text", "url"].includes(answer.element.type) &&
    !hasInputValue(answer.element.value)
  )
}

export function isTextEntryTarget(element: Element) {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return true
  if (element instanceof HTMLInputElement) {
    return !["button", "checkbox", "radio", "reset", "submit"].includes(element.type)
  }
  return element instanceof HTMLElement && element.isContentEditable
}

export function isRadioTarget(element: Element) {
  return element instanceof HTMLInputElement && element.type === "radio"
}

export function compareDocumentOrder(a: { element: Element }, b: { element: Element }) {
  if (a.element === b.element) return 0
  const position = a.element.compareDocumentPosition(b.element)
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
  return 0
}
