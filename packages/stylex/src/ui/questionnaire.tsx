import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import {
  Questionnaire as QuestionnairePrimitive,
  type QuestionnaireChoiceProps as QuestionnairePrimitiveChoiceProps,
  type QuestionnaireChoicesProps as QuestionnairePrimitiveChoicesProps,
  type QuestionnaireDescriptionProps as QuestionnairePrimitiveDescriptionProps,
  type QuestionnaireErrorProps as QuestionnairePrimitiveErrorProps,
  type QuestionnaireInputProps as QuestionnairePrimitiveInputProps,
  type QuestionnaireItemProps as QuestionnairePrimitiveItemProps,
  type QuestionnaireNavigationProps,
  type QuestionnaireProgressProps as QuestionnairePrimitiveProgressProps,
  type QuestionnaireRootProps as QuestionnairePrimitiveRootProps,
  type QuestionnaireTitleProps as QuestionnairePrimitiveTitleProps,
} from "@shadcn-solid/primitives/questionnaire"
import { Check } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { choiceMarker } from "../lib/markers.stylex"
import { sxMerge } from "../lib/sx"
import { buttonStyles, type ButtonSize, type ButtonVariant } from "./button"

// Port of shadcn/ui's base-vega `questionnaire` (see the Tailwind variant for the source classes)
// over @shadcn-solid/primitives/questionnaire. `group-data-*/questionnaire-choice` conditions are
// `stylex.when.ancestor(…, choiceMarker)`; parts with their own `display` also hide on `[hidden]`
// (Tailwind's preflight does that for the Tailwind variant).

const SM = "@media (min-width: 40rem)"
const MD = "@media (min-width: 48rem)"

const styles = stylex.create({
  root: { display: "flex", width: "100%", minWidth: 0, flexDirection: "column", gap: "1.5rem" },
  progress: {
    minHeight: "1lh",
    width: "fit-content",
    minWidth: "14ch",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
  },
  item: {
    display: { default: "flex", ":is([hidden])": "none" },
    minWidth: 0,
    flexDirection: "column",
    gap: "1.25rem",
    margin: 0,
    borderWidth: 0,
    padding: 0,
    outline: "none",
  },
  title: {
    padding: 0,
    fontSize: "1rem",
    lineHeight: "1.5rem",
    fontWeight: 600,
    textWrap: "pretty",
    marginBottom: { default: null, ":not(:has(~ [data-slot=questionnaire-description]))": "1.25rem" },
  },
  description: { fontSize: "0.875rem", lineHeight: "1.25rem", textWrap: "pretty", color: colors.mutedForeground },
  choices: { display: "grid", minWidth: 0, gap: "0.75rem" },
  choice: {
    position: "relative",
    display: "flex",
    minHeight: "2.75rem",
    cursor: { default: "pointer", ":is([data-disabled])": "not-allowed" },
    alignItems: "flex-start",
    gap: "0.75rem",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: colors.input,
      ":is([data-checked])": `color-mix(in oklch, ${colors.primary} 40%, transparent)`,
      ":is([data-invalid])": colors.destructive,
      ":has(> input:focus-visible)": colors.ring,
    },
    backgroundColor: {
      default: `light-dark(transparent, color-mix(in oklch, ${colors.input} 20%, transparent))`,
      ":hover": `color-mix(in oklch, ${colors.muted} 50%, transparent)`,
      ":is([data-checked])": colors.muted,
      ":is([data-checked]):hover": colors.muted,
    },
    paddingInline: "1rem",
    paddingBlock: "0.875rem",
    textAlign: "start",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    boxShadow: {
      default: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      ":has(> input:focus-visible)": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05)`,
    },
    transitionProperty: "color, background-color, border-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    userSelect: "none",
    pointerEvents: { default: null, ":is([data-disabled])": "none" },
    opacity: { default: null, ":is([data-disabled])": 0.5 },
  },
  choiceInput: {
    position: "absolute",
    inset: 0,
    zIndex: 10,
    width: "100%",
    height: "100%",
    margin: 0,
    cursor: "pointer",
    opacity: 0,
  },
  indicator: {
    pointerEvents: "none",
    position: "relative",
    display: "flex",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    transform: {
      default: "translateY(0.1125rem)",
      [stylex.when.ancestor(":has([data-slot=questionnaire-choice-description])", choiceMarker)]: "translateY(0.125rem)",
    },
    alignItems: "center",
    justifyContent: "center",
    borderRadius: {
      default: "4px",
      [stylex.when.ancestor("[data-type=radio]", choiceMarker)]: "9999px",
    },
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: colors.input,
      [stylex.when.ancestor("[data-checked]", choiceMarker)]: colors.primary,
    },
    backgroundColor: {
      default: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
      [stylex.when.ancestor("[data-checked]", choiceMarker)]: colors.primary,
    },
    color: {
      default: null,
      [stylex.when.ancestor("[data-checked]", choiceMarker)]: colors.primaryForeground,
    },
  },
  dot: {
    display: {
      default: "none",
      [stylex.when.ancestor("[data-checked][data-type=radio]", choiceMarker)]: "block",
    },
    width: "0.5rem",
    height: "0.5rem",
    borderRadius: "9999px",
    backgroundColor: colors.primaryForeground,
  },
  check: {
    display: {
      default: "none",
      [stylex.when.ancestor("[data-checked][data-type=checkbox]", choiceMarker)]: "block",
    },
    width: "0.875rem",
    height: "0.875rem",
  },
  label: { display: "flex", minWidth: 0, flex: "1 1 0%", flexDirection: "column", gap: "0.25rem", lineHeight: 1.375 },
  shortcut: {
    pointerEvents: "none",
    marginInlineStart: "auto",
    display: {
      default: "none",
      [stylex.when.ancestor("[data-shortcut]", choiceMarker)]: "inline-flex",
    },
    width: "1.25rem",
    height: "1.25rem",
    flexShrink: 0,
    transform: {
      default: "translateY(0.1125rem)",
      [stylex.when.ancestor(":has([data-slot=questionnaire-choice-description])", choiceMarker)]: "translateY(0.125rem)",
    },
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.input,
    backgroundColor: colors.background,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: "0.625rem",
    lineHeight: 1,
    fontWeight: 500,
    color: colors.mutedForeground,
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
  choiceDescription: { color: colors.mutedForeground },
  inputWrapper: { position: "relative", width: "100%", minWidth: 0 },
  input: {
    height: "2.25rem",
    minHeight: { default: "2.75rem", [SM]: 0 },
    width: "100%",
    minWidth: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
      ":is([aria-invalid=true])": `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`,
    },
    backgroundColor: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
    paddingInline: "0.625rem",
    paddingBlock: "0.25rem",
    fontFamily: "inherit",
    fontSize: { default: "1rem", [MD]: "0.875rem" },
    lineHeight: { default: "1.5rem", [MD]: "1.25rem" },
    color: "inherit",
    boxShadow: {
      default: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
      ":is([aria-invalid=true])": `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`,
    },
    transitionProperty: "color, box-shadow, background-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    pointerEvents: { default: null, ":disabled": "none" },
    cursor: { default: null, ":disabled": "not-allowed" },
    opacity: { default: null, ":disabled": 0.5 },
    "::placeholder": { color: colors.mutedForeground },
    "::selection": { backgroundColor: colors.primary, color: colors.primaryForeground },
  },
  error: { fontSize: "0.875rem", lineHeight: "1.25rem", color: colors.destructive },
  actions: {
    display: "grid",
    minHeight: { default: "2.75rem", [SM]: "2.25rem" },
    width: "100%",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    alignItems: "center",
    gap: "0.5rem",
  },
  navigation: {
    gridRowStart: "1",
    minHeight: { default: "2.75rem", [SM]: 0 },
    display: { default: null, ":is([hidden])": "none" },
  },
  previous: { gridColumnStart: "1", justifySelf: "start" },
  skip: { gridColumnStart: "2", justifySelf: "end" },
  next: { gridColumnStart: "3", justifySelf: "end" },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }
type WithXStyle<T> = Omit<T, "class"> & XStyle

function part<P extends object>(
  Component: (props: P) => JSX.Element,
  slot: string,
  style: stylex.StyleXStyles,
) {
  return function QuestionnairePart(props: WithXStyle<P>) {
    const rest = omit(props as WithXStyle<P> & { style?: unknown }, "class", "style", "xstyle")
    const a = () => sxMerge([style, props.xstyle], props.class, (props as { style?: unknown }).style)
    return <Component data-slot={slot} {...(rest as unknown as P)} class={a().class} style={a().style} />
  }
}

const Questionnaire = part<QuestionnairePrimitiveRootProps>(QuestionnairePrimitive.Root, "questionnaire", styles.root)
const QuestionnaireProgress = part<QuestionnairePrimitiveProgressProps>(
  QuestionnairePrimitive.Progress,
  "questionnaire-progress",
  styles.progress,
)
const QuestionnaireItem = part<QuestionnairePrimitiveItemProps>(QuestionnairePrimitive.Item, "questionnaire-item", styles.item)
const QuestionnaireTitle = part<QuestionnairePrimitiveTitleProps>(
  QuestionnairePrimitive.Title,
  "questionnaire-title",
  styles.title,
)
const QuestionnaireDescription = part<QuestionnairePrimitiveDescriptionProps>(
  QuestionnairePrimitive.Description,
  "questionnaire-description",
  styles.description,
)
const QuestionnaireChoices = part<QuestionnairePrimitiveChoicesProps>(
  QuestionnairePrimitive.Choices,
  "questionnaire-choices",
  styles.choices,
)
const QuestionnaireError = part<QuestionnairePrimitiveErrorProps>(
  QuestionnairePrimitive.Error,
  "questionnaire-error",
  styles.error,
)

function QuestionnaireChoice(props: WithXStyle<QuestionnairePrimitiveChoiceProps>) {
  const rest = omit(props, "children", "class", "style", "xstyle")
  const a = () => sxMerge([choiceMarker, styles.choice, props.xstyle], props.class, props.style)
  return (
    <QuestionnairePrimitive.Choice data-slot="questionnaire-choice" {...rest} class={a().class} style={a().style}>
      <QuestionnairePrimitive.ChoiceInput data-slot="questionnaire-choice-input" {...stylex.attrs(styles.choiceInput)} />
      <span aria-hidden="true" data-slot="questionnaire-choice-indicator" {...stylex.attrs(styles.indicator)}>
        <span data-slot="questionnaire-choice-indicator-dot" {...stylex.attrs(styles.dot)} />
        <Icon icon={Check} data-slot="questionnaire-choice-indicator-check" {...stylex.attrs(styles.check)} />
      </span>
      <QuestionnairePrimitive.ChoiceLabel data-slot="questionnaire-choice-label" {...stylex.attrs(styles.label)}>
        {props.children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut data-slot="questionnaire-choice-shortcut" {...stylex.attrs(styles.shortcut)} />
    </QuestionnairePrimitive.Choice>
  )
}

function QuestionnaireChoiceDescription(props: WithXStyle<JSX.HTMLAttributes<HTMLSpanElement>>) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.choiceDescription, props.xstyle], props.class, props.style)
  return <span data-slot="questionnaire-choice-description" {...rest} class={a().class} style={a().style} />
}

function QuestionnaireInput(props: WithXStyle<QuestionnairePrimitiveInputProps>) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.input, props.xstyle], props.class, props.style)
  return (
    <div data-slot="questionnaire-input-wrapper" {...stylex.attrs(styles.inputWrapper)}>
      <QuestionnairePrimitive.Input data-slot="questionnaire-input" {...rest} class={a().class} style={a().style} />
    </div>
  )
}

function QuestionnaireActions(props: WithXStyle<JSX.HTMLAttributes<HTMLDivElement>>) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.actions, props.xstyle], props.class, props.style)
  return <div data-slot="questionnaire-actions" {...rest} class={a().class} style={a().style} />
}

type NavigationProps = WithXStyle<QuestionnaireNavigationProps> & {
  size?: ButtonSize | null
  variant?: ButtonVariant | null
}

function navigationButton(
  Part: (props: QuestionnaireNavigationProps) => JSX.Element,
  slot: string,
  label: string,
  defaultVariant: ButtonVariant,
  layout: stylex.StyleXStyles,
) {
  return function QuestionnaireNavigationButton(props: NavigationProps) {
    const rest = omit(props, "children", "class", "size", "style", "variant", "xstyle")
    const a = () =>
      sxMerge(
        [
          ...buttonStyles({ size: props.size ?? "default", variant: props.variant ?? defaultVariant }),
          styles.navigation,
          layout,
          props.xstyle,
        ],
        props.class,
        props.style,
      )
    return (
      <Part
        data-slot={slot}
        data-size={props.size ?? "default"}
        data-variant={props.variant ?? defaultVariant}
        {...rest}
        class={a().class}
        style={a().style}
      >
        {props.children ?? label}
      </Part>
    )
  }
}

const QuestionnairePrevious = navigationButton(
  QuestionnairePrimitive.Previous,
  "questionnaire-previous",
  "Previous",
  "outline",
  styles.previous,
)
const QuestionnaireSkip = navigationButton(QuestionnairePrimitive.Skip, "questionnaire-skip", "Skip", "outline", styles.skip)
const QuestionnaireNext = navigationButton(QuestionnairePrimitive.Next, "questionnaire-next", "Next", "default", styles.next)
const QuestionnaireSubmit = navigationButton(
  QuestionnairePrimitive.Submit,
  "questionnaire-submit",
  "Submit",
  "default",
  styles.next,
)

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
}
