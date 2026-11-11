import { For, Show } from "solid-js"
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
} from "@shadcn-solid/tailwind/ui/questionnaire"
import { toast } from "@shadcn-solid/tailwind/ui/sonner"
import { describeAnswers, questionnaireItems } from "./lib/questionnaire-items"

export default function QuestionnaireDemo() {
  return (
    <Questionnaire
      class="mx-auto max-w-md"
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
                    <span class="font-medium">{choice.label}</span>
                    <Show when={choice.description}>
                      <span class="text-muted-foreground">{choice.description}</span>
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
