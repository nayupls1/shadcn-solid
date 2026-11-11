import { createSignal, For, Show } from "solid-js"
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
import { describeAnswers, questionnaireItems } from "./lib/questionnaire-items"

export default function QuestionnaireDemo() {
  // shadcn shows these answers in a sonner toast ("Agent plan saved"); sonner belongs to another
  // group, so the demo shows the same text below the form.
  const [saved, setSaved] = createSignal<string>()

  return (
    <div class="mx-auto flex w-full max-w-md flex-col gap-4">
      <Questionnaire
        class="mx-auto max-w-md"
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
      <Show when={saved()}>
        {(text) => (
          <div role="status" class="rounded-lg border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg">
            <p class="font-medium">Agent plan saved</p>
            <p class="text-muted-foreground">{text()}</p>
          </div>
        )}
      </Show>
    </div>
  )
}
