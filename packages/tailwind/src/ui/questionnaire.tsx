import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
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
import { cn } from "../lib/utils"
import { buttonVariants, type ButtonProps } from "./button"

// shadcn's questionnaire over @shadcn-solid/primitives/questionnaire, a Solid port of
// @shadcn/react/questionnaire.

type WithClass<T> = Omit<T, "class"> & { class?: string }

function Questionnaire(props: WithClass<QuestionnairePrimitiveRootProps>) {
  const rest = omit(props, "class")
  return (
    <QuestionnairePrimitive.Root
      data-slot="questionnaire"
      class={cn("flex w-full min-w-0 flex-col gap-6", props.class)}
      {...rest}
    />
  )
}

function QuestionnaireProgress(props: WithClass<QuestionnairePrimitiveProgressProps>) {
  const rest = omit(props, "class")
  return (
    <QuestionnairePrimitive.Progress
      data-slot="questionnaire-progress"
      class={cn("min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums", props.class)}
      {...rest}
    />
  )
}

function QuestionnaireItem(props: WithClass<QuestionnairePrimitiveItemProps>) {
  const rest = omit(props, "class")
  return (
    <QuestionnairePrimitive.Item
      data-slot="questionnaire-item"
      class={cn("flex min-w-0 flex-col gap-5 border-0 p-0 outline-none", props.class)}
      {...rest}
    />
  )
}

function QuestionnaireTitle(props: WithClass<QuestionnairePrimitiveTitleProps>) {
  const rest = omit(props, "class")
  return (
    <QuestionnairePrimitive.Title
      data-slot="questionnaire-title"
      class={cn(
        "cn-font-heading text-base font-semibold text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-5",
        props.class,
      )}
      {...rest}
    />
  )
}

function QuestionnaireDescription(props: WithClass<QuestionnairePrimitiveDescriptionProps>) {
  const rest = omit(props, "class")
  return (
    <QuestionnairePrimitive.Description
      data-slot="questionnaire-description"
      class={cn("text-sm text-pretty text-muted-foreground", props.class)}
      {...rest}
    />
  )
}

function QuestionnaireChoices(props: WithClass<QuestionnairePrimitiveChoicesProps>) {
  const rest = omit(props, "class")
  return (
    <QuestionnairePrimitive.Choices
      data-slot="questionnaire-choices"
      class={cn("group/questionnaire-choices grid min-w-0 gap-3", props.class)}
      {...rest}
    />
  )
}

function QuestionnaireChoice(props: WithClass<QuestionnairePrimitiveChoiceProps>) {
  const rest = omit(props, "children", "class")
  return (
    <QuestionnairePrimitive.Choice
      data-slot="questionnaire-choice"
      class={cn(
        "group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-input bg-transparent px-4 py-3.5 text-start text-sm shadow-xs transition-colors outline-none select-none hover:bg-muted/50 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-3 has-[>input:focus-visible]:ring-ring/50 data-invalid:border-destructive dark:bg-input/20 data-checked:border-primary/40 data-checked:bg-muted dark:data-checked:bg-muted",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        props.class,
      )}
      {...rest}
    >
      <QuestionnairePrimitive.ChoiceInput
        data-slot="questionnaire-choice-input"
        class="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        data-slot="questionnaire-choice-indicator"
        class="pointer-events-none relative flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-[4px] border border-input group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground dark:bg-input/30 dark:group-data-checked/questionnaire-choice:bg-primary"
      >
        <span
          data-slot="questionnaire-choice-indicator-dot"
          class="hidden size-2 rounded-full bg-primary-foreground group-data-[type=checkbox]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
        />
        <Icon
          icon={Check}
          data-slot="questionnaire-choice-indicator-check"
          class="hidden size-3.5 group-data-[type=radio]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
        />
      </span>
      <QuestionnairePrimitive.ChoiceLabel
        data-slot="questionnaire-choice-label"
        class="flex min-w-0 flex-1 flex-col gap-1 leading-snug"
      >
        {props.children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut
        data-slot="questionnaire-choice-shortcut"
        class="pointer-events-none ms-auto hidden size-5 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-md border border-input bg-background font-mono text-[0.625rem] leading-none font-medium text-muted-foreground shadow-xs group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[shortcut]/questionnaire-choice:inline-flex"
      />
    </QuestionnairePrimitive.Choice>
  )
}

function QuestionnaireChoiceDescription(props: WithClass<JSX.HTMLAttributes<HTMLSpanElement>>) {
  const rest = omit(props, "class")
  return (
    <span data-slot="questionnaire-choice-description" class={cn("text-muted-foreground", props.class)} {...rest} />
  )
}

function QuestionnaireInput(props: WithClass<QuestionnairePrimitiveInputProps>) {
  const rest = omit(props, "class")
  return (
    <div data-slot="questionnaire-input-wrapper" class="group/questionnaire-input relative w-full min-w-0">
      <QuestionnairePrimitive.Input
        data-slot="questionnaire-input"
        class={cn(
          "h-9 min-h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:min-h-0 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
          props.class,
        )}
        {...rest}
      />
    </div>
  )
}

function QuestionnaireError(props: WithClass<QuestionnairePrimitiveErrorProps>) {
  const rest = omit(props, "class")
  return (
    <QuestionnairePrimitive.Error
      data-slot="questionnaire-error"
      class={cn("text-sm text-destructive", props.class)}
      {...rest}
    />
  )
}

function QuestionnaireActions(props: WithClass<JSX.HTMLAttributes<HTMLDivElement>>) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="questionnaire-actions"
      class={cn("grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:min-h-9", props.class)}
      {...rest}
    />
  )
}

type NavigationProps = WithClass<QuestionnaireNavigationProps> & Pick<ButtonProps, "size" | "variant">

function navigationButton(
  Part: (props: QuestionnaireNavigationProps) => JSX.Element,
  slot: string,
  label: string,
  defaultVariant: NonNullable<ButtonProps["variant"]>,
  layout: string,
) {
  return function QuestionnaireNavigationButton(props: NavigationProps) {
    const rest = omit(props, "children", "class", "size", "variant")
    return (
      <Part
        data-slot={slot}
        data-size={props.size ?? "default"}
        data-variant={props.variant ?? defaultVariant}
        class={cn(
          buttonVariants({ size: props.size ?? "default", variant: props.variant ?? defaultVariant }),
          layout,
          props.class,
        )}
        {...rest}
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
  "col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0",
)

const QuestionnaireSkip = navigationButton(
  QuestionnairePrimitive.Skip,
  "questionnaire-skip",
  "Skip",
  "outline",
  "col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0",
)

const QuestionnaireNext = navigationButton(
  QuestionnairePrimitive.Next,
  "questionnaire-next",
  "Next",
  "default",
  "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0",
)

const QuestionnaireSubmit = navigationButton(
  QuestionnairePrimitive.Submit,
  "questionnaire-submit",
  "Submit",
  "default",
  "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0",
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
