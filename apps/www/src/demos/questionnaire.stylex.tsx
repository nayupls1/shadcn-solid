import { For, Show } from "solid-js"
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
import { toast } from "@shadcn-solid/stylex/ui/sonner"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"
import { describeAnswers, questionnaireItems } from "./lib/questionnaire-items"

export default function QuestionnaireDemo() {
  return (
    <Questionnaire
      xstyle={styles.questionnaire}
      defaultItem="direction"
      items={questionnaireItems}
      shortcuts="letters"
      onSubmit={(event) => {
        event.preventDefault()
        toast("Agent plan saved", { description: describeAnswers(event.currentTarget) })
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
  )
}

const styles = stylex.create({
  questionnaire: { marginInline: "auto", maxWidth: "28rem" },
  medium: { fontWeight: 500 },
  muted: { color: colors.mutedForeground },
})
