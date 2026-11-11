import { createSignal } from "solid-js"

/**
 * A small scripted chat for the demos, standing in for shadcn's `createChat()` (`@/lib/ai`, built
 * on the AI SDK's `useChat` with a mock transport). A script is a list of turns; the assistant's
 * steps stream in with delays (text word by word, tool calls with a pause before their result).
 */

export type TextPart = { id: string; type: "text"; text: string; state: "streaming" | "done" }
export type ReasoningPart = { id: string; type: "reasoning"; text: string; state: "streaming" | "done" }
export type ToolPart = {
  id: string
  type: "tool-runCommand"
  toolCallId: string
  state: "input-available" | "output-available" | "output-error"
  input: { command: string }
  output?: { stdout: string }
  errorText?: string
}
export type SourcePart = { id: string; type: "source-url"; url: string; title?: string }
export type Part = TextPart | ReasoningPart | ToolPart | SourcePart

export type ChatMessage = { id: string; role: "user" | "assistant"; parts: Part[] }
export type ChatStatus = "ready" | "submitted" | "streaming"

export type Step =
  | { kind: "text" | "reasoning"; text: string; delayMs?: number }
  | { kind: "tool"; command: string; sleep: number; output?: string; error?: string }
  | { kind: "source"; url: string; title?: string }
  | { kind: "sleep"; ms: number }

type Turn = { role: "user"; text: string; wait: number } | { role: "assistant"; steps: Step[] }

let uid = 0
const nextId = (prefix: string) => `${prefix}-${++uid}`

export function getMessageText(message: ChatMessage) {
  return message.parts
    .filter((part): part is TextPart => part.type === "text")
    .map((part) => part.text)
    .join("")
}

function finalParts(steps: Step[]): Part[] {
  const parts: Part[] = []
  for (const step of steps) {
    if (step.kind === "text" || step.kind === "reasoning") {
      parts.push({ id: nextId("part"), type: step.kind, text: step.text, state: "done" })
    } else if (step.kind === "tool") {
      const toolCallId = nextId("call")
      parts.push(
        step.error
          ? { id: toolCallId, type: "tool-runCommand", toolCallId, state: "output-error", input: { command: step.command }, errorText: step.error }
          : {
              id: toolCallId,
              type: "tool-runCommand",
              toolCallId,
              state: "output-available",
              input: { command: step.command },
              output: { stdout: step.output ?? "" },
            },
      )
    } else if (step.kind === "source") {
      parts.push({ id: nextId("part"), type: "source-url", url: step.url, title: step.title })
    }
  }
  return parts
}

export function createChat() {
  const turns: Turn[] = []

  const builder = {
    user(text: string) {
      turns.push({ role: "user", text, wait: 0 })
      return builder
    },
    /** Waits before the next assistant reply starts (the "submitted" state). */
    sleep(ms: number) {
      const last = turns[turns.length - 1]
      if (last?.role === "user") last.wait = ms
      return builder
    },
    assistant(content: string | Step[]) {
      turns.push({ role: "assistant", steps: typeof content === "string" ? [{ kind: "text", text: content }] : content })
      return builder
    },
    /** The first `count` user turns and their replies as finished messages (all by default). */
    get(count?: number): ChatMessage[] {
      const messages: ChatMessage[] = []
      let users = 0
      for (const turn of turns) {
        if (turn.role === "user") {
          if (count !== undefined && users >= count) break
          users++
          messages.push({ id: nextId("msg"), role: "user", parts: [{ id: nextId("part"), type: "text", text: turn.text, state: "done" }] })
        } else {
          messages.push({ id: nextId("msg"), role: "assistant", parts: finalParts(turn.steps) })
        }
      }
      return messages
    },
    /** The next user message to send after `messages`, or undefined when the script is done. */
    next(messages: ChatMessage[]): ChatMessage | undefined {
      const sent = messages.filter((m) => m.role === "user").length
      const turn = turns.filter((t) => t.role === "user")[sent]
      if (!turn || turn.role !== "user") return undefined
      return { id: `next-${sent}`, role: "user", parts: [{ id: `next-${sent}-text`, type: "text", text: turn.text, state: "done" }] }
    },
    /** Reactive chat state (`useChat`): streams the scripted reply to each sent user message. */
    useChat(options: { messages?: ChatMessage[]; delayMs?: number } = {}) {
      const [messages, setMessagesSignal] = createSignal<ChatMessage[]>(options.messages ?? [])
      const [status, setStatus] = createSignal<ChatStatus>("ready")
      const delayMs = options.delayMs ?? 20
      let generation = 0

      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
      const update = (fn: (parts: Part[]) => Part[]) =>
        setMessagesSignal((prev) => {
          const last = prev[prev.length - 1]
          return [...prev.slice(0, -1), { ...last, parts: fn(last.parts) }]
        })

      async function sendMessage(message: ChatMessage) {
        const run = ++generation
        const userText = getMessageText(message)
        const index = turns.findIndex((t) => t.role === "user" && t.text === userText)
        const userTurn = turns[index]
        const reply = turns[index + 1]
        setMessagesSignal((prev) => [...prev, { ...message, id: nextId("msg") }])
        setStatus("submitted")
        await sleep(userTurn?.role === "user" ? userTurn.wait : 0)
        if (run !== generation) return
        if (!reply || reply.role !== "assistant") {
          setStatus("ready")
          return
        }
        setMessagesSignal((prev) => [...prev, { id: nextId("msg"), role: "assistant", parts: [] }])
        setStatus("streaming")
        for (const step of reply.steps) {
          if (run !== generation) return
          if (step.kind === "sleep") {
            await sleep(step.ms)
          } else if (step.kind === "text" || step.kind === "reasoning") {
            const id = nextId("part")
            update((parts) => [...parts, { id, type: step.kind, text: "", state: "streaming" }])
            const words = step.text.split(/(?<=\s)/)
            for (const word of words) {
              await sleep(step.delayMs ?? delayMs)
              if (run !== generation) return
              update((parts) =>
                parts.map((p) => (p.id === id && (p.type === "text" || p.type === "reasoning") ? { ...p, text: p.text + word } : p)),
              )
            }
            update((parts) =>
              parts.map((p) => (p.id === id && (p.type === "text" || p.type === "reasoning") ? { ...p, state: "done" } : p)),
            )
          } else if (step.kind === "tool") {
            const toolCallId = nextId("call")
            update((parts) => [
              ...parts,
              { id: toolCallId, type: "tool-runCommand", toolCallId, state: "input-available", input: { command: step.command } },
            ])
            await sleep(step.sleep)
            if (run !== generation) return
            update((parts) =>
              parts.map((p) =>
                p.id !== toolCallId || p.type !== "tool-runCommand"
                  ? p
                  : step.error
                    ? { ...p, state: "output-error", errorText: step.error }
                    : { ...p, state: "output-available", output: { stdout: step.output ?? "" } },
              ),
            )
          } else if (step.kind === "source") {
            update((parts) => [...parts, { id: nextId("part"), type: "source-url", url: step.url, title: step.title }])
          }
        }
        if (run === generation) setStatus("ready")
      }

      function setMessages(next: ChatMessage[]) {
        generation++
        setStatus("ready")
        setMessagesSignal(next)
      }

      return { messages, status, sendMessage, setMessages }
    },
  }

  return builder
}
