import { createSignal, For, Show } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
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
} from "@shadcn-solid/stylex/ui/questionnaire"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"
import { describeAnswers, questionnaireItems } from "./lib/questionnaire-items"

export default function QuestionnaireDemo() {
  // shadcn shows these answers in a sonner toast ("Agent plan saved"); sonner belongs to another
  // group, so the demo shows the same text below the form.
  const [saved, setSaved] = createSignal<string>()

  return (
    <div {...stylex.attrs(styles.root)}>
      <Questionnaire
        xstyle={styles.questionnaire}
        defaultItem="direction"
        items={questionnaireItems}
        shortcuts="letters"
        onSubmit={(event) => {
          event.preventDefault()
          setSaved(describeAnswers(event.currentTarget))
        }}
      >
        <QuestionnaireProgress />
        <For each={questionnaireItems}>
          {(question) => (
            <QuestionnaireItem multiple={question.multiple ?? false} name={question.name} required={question.required}>
              <QuestionnaireTitle>{question.title}</QuestionnaireTitle>
              <QuestionnaireDescription>{question.description}</QuestionnaireDescription>
              <QuestionnaireChoices>
                <For each={question.choices}>
                  {(choice) => (
                    <QuestionnaireChoice value={choice.value}>
                      <span {...stylex.attrs(styles.medium)}>{choice.label}</span>
                      <Show when={choice.description}>
                        <span {...stylex.attrs(styles.muted)}>{choice.description}</span>
                      </Show>
                    </QuestionnaireChoice>
                  )}
                </For>
                <Show when={question.input}>
                  {(input) => <QuestionnaireInput aria-label={input().label} placeholder={input().placeholder} />}
                </Show>
              </QuestionnaireChoices>
              <QuestionnaireError />
            </QuestionnaireItem>
          )}
        </For>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          <QuestionnaireNext>Next</QuestionnaireNext>
          <QuestionnaireSubmit>Save plan</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
      <Show when={saved()}>
        {(text) => (
          <div role="status" {...stylex.attrs(styles.saved)}>
            <p {...stylex.attrs(styles.medium)}>Agent plan saved</p>
            <p {...stylex.attrs(styles.muted)}>{text()}</p>
          </div>
        )}
      </Show>
    </div>
  )
}

const styles = stylex.create({
  root: { marginInline: "auto", display: "flex", width: "100%", maxWidth: "28rem", flexDirection: "column", gap: "1rem" },
  questionnaire: { marginInline: "auto", maxWidth: "28rem" },
  medium: { fontWeight: 500 },
  muted: { color: colors.mutedForeground },
  saved: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.popover,
    paddingInline: "1rem",
    paddingBlock: "0.75rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.popoverForeground,
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
})
