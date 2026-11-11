// The questions of shadcn's questionnaire demo.
export const questionnaireItems = [
  {
    choices: [
      { description: "Show what the agent ran and what came back.", label: "Tool call timeline", value: "tool-calls" },
      { description: "Ask before sensitive or destructive actions.", label: "Approval checkpoints", value: "approvals" },
      { description: "Make delegated work and results easier to follow.", label: "Sub-agent handoffs", value: "handoffs" },
    ],
    description: "Choose a direction or describe another task.",
    input: { label: "Another agent feature", placeholder: "Describe another feature…" },
    name: "direction",
    required: true,
    title: "What should the agent build next?",
  },
  {
    choices: [
      { label: "Progress", value: "progress" },
      { label: "Decisions", value: "decisions" },
      { label: "Risks", value: "risks" },
      { label: "Next step", value: "next-step" },
    ],
    description: "Select all that apply, or skip this question.",
    multiple: true,
    name: "signals",
    required: false,
    title: "What should every progress update include?",
  },
  {
    choices: [
      { label: "Start now", value: "now" },
      { label: "Next development cycle", value: "next-cycle" },
      { label: "Add it to the backlog", value: "backlog" },
    ],
    description: "Choose when the agent should begin the work.",
    name: "timing",
    required: true,
    title: "When should work begin?",
  },
] as Array<{
  choices: Array<{ description?: string; label: string; value: string }>
  description: string
  input?: { label: string; placeholder: string }
  multiple?: boolean
  name: string
  required: boolean
  title: string
}>

/** The text shadcn's demo puts in its "Agent plan saved" toast. */
export function describeAnswers(form: HTMLFormElement) {
  const formData = new FormData(form)
  const answers = {
    direction: formData.get("direction"),
    signals: formData.getAll("signals"),
    timing: formData.get("timing"),
  }
  return `Direction: ${answers.direction ?? "None"} · Progress signals: ${answers.signals.join(", ") || "None"} · Timing: ${answers.timing ?? "None"}`
}
