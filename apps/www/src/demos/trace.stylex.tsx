import { createSignal, For, Match, Show, Switch } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { ArrowUpRight, CircleAlert, CircleCheck, Globe, LoaderCircle } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Bubble, BubbleContent } from "@shadcn-solid/stylex/ui/bubble"
import { Button } from "@shadcn-solid/stylex/ui/button"
import { CodeBlock, CodeBlockContent } from "@shadcn-solid/stylex/ui/code-block"
import { Message, MessageContent } from "@shadcn-solid/stylex/ui/message"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
  traceItemStyles,
} from "@shadcn-solid/stylex/ui/trace"
import { getMessageText, type ChatMessage, type Part, type SourcePart, type ToolPart } from "./lib/fake-chat"
import { traceChat as chat } from "./lib/trace-chat"

const transcript = chat.get()
const [question] = chat.get(1)

function ThinkingLine(props: { running: boolean }) {
  return (
    <TraceLine status={props.running ? "running" : undefined}>
      <TraceIcon>
        <Show when={props.running} fallback={<Icon icon={CircleCheck} />}>
          <Icon icon={LoaderCircle} {...stylex.attrs(styles.spin)} />
        </Show>
      </TraceIcon>
      <TraceTitle>{props.running ? "Thinking" : "Thought for 5s"}</TraceTitle>
    </TraceLine>
  )
}

function ThinkingRow(props: { text: string; running: boolean }) {
  const [open, setOpen] = createSignal<boolean>()

  return (
    <Show when={props.text.length > 0} fallback={<ThinkingLine running={props.running} />}>
      <TraceCollapsible open={open() ?? props.running} onOpenChange={(next) => setOpen(next)}>
        <TraceCollapsibleTrigger>
          <ThinkingLine running={props.running} />
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent xstyle={styles.preWrap}>{props.text}</TraceCollapsibleContent>
      </TraceCollapsible>
    </Show>
  )
}

function ToolRow(props: { part: ToolPart; streaming: boolean; defaultOpen?: boolean }) {
  const failed = () => props.part.state === "output-error"

  return (
    <Show
      when={props.part.state === "output-available" || props.part.state === "output-error"}
      fallback={
        <TraceLine status={props.streaming ? "running" : "error"}>
          <TraceIcon>
            <Show when={props.streaming} fallback={<Icon icon={CircleAlert} />}>
              <Icon icon={LoaderCircle} {...stylex.attrs(styles.spin)} />
            </Show>
          </TraceIcon>
          <TraceTitle>
            {props.streaming ? "Running" : "Failed to run"} {props.part.input.command}
          </TraceTitle>
        </TraceLine>
      }
    >
      <TraceCollapsible defaultOpen={props.defaultOpen}>
        <TraceCollapsibleTrigger>
          <TraceLine status={failed() ? "error" : undefined}>
            <TraceIcon>
              <Show when={failed()} fallback={<Icon icon={CircleCheck} />}>
                <Icon icon={CircleAlert} />
              </Show>
            </TraceIcon>
            <TraceTitle>
              {failed() ? "Failed to run" : "Ran"} {props.part.input.command}
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Switch>
            <Match when={failed()}>
              <CodeBlock size="sm" variant="destructive">
                <CodeBlockContent wrap xstyle={styles.maxH64}>
                  {props.part.errorText}
                </CodeBlockContent>
              </CodeBlock>
            </Match>
            <Match when={!failed()}>
              <CodeBlock size="sm">
                <CodeBlockContent wrap xstyle={styles.maxH64}>
                  {props.part.output?.stdout}
                </CodeBlockContent>
              </CodeBlock>
            </Match>
          </Switch>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Show>
  )
}

function SourcesRow(props: { sources: SourcePart[]; running: boolean }) {
  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>
        <TraceLine status={props.running ? "running" : undefined}>
          <TraceIcon>
            <Show when={props.running} fallback={<Icon icon={Globe} />}>
              <Icon icon={LoaderCircle} {...stylex.attrs(styles.spin)} />
            </Show>
          </TraceIcon>
          <TraceTitle>
            {props.running ? "Using" : "Used"} {props.sources.length} sources
          </TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <Trace>
          <For each={props.sources} keyed={(source) => source.url}>
            {(source) => (
              <a href={source().url} target="_blank" rel="noreferrer" {...stylex.attrs(traceItemStyles.item)}>
                <TraceLine>
                  <TraceIcon>
                    <Icon icon={Globe} />
                  </TraceIcon>
                  <TraceTitle>
                    {source().title ?? new URL(source().url).hostname}
                    <span {...stylex.attrs(styles.srOnly)}> (opens in a new tab)</span>
                  </TraceTitle>
                  <TraceIcon>
                    <Icon icon={ArrowUpRight} />
                  </TraceIcon>
                </TraceLine>
              </a>
            )}
          </For>
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

function AssistantMessage(props: { message: ChatMessage; streaming: boolean }) {
  const rows = () =>
    props.message.parts.filter(
      (part): part is Exclude<Part, SourcePart> => part.type === "reasoning" || part.type === "tool-runCommand",
    )
  const sources = () => props.message.parts.filter((part): part is SourcePart => part.type === "source-url")
  const text = () => getMessageText(props.message)

  return (
    <Message>
      <MessageContent xstyle={styles.gap4}>
        <Show when={rows().length + sources().length > 0}>
          <Trace>
            <For each={rows()} keyed={(part) => part.id}>
              {(part) => (
                <Switch>
                  <Match when={part().type === "reasoning" && part()}>
                    {(reasoning) => (
                      <ThinkingRow
                        text={(reasoning() as Extract<Part, { type: "reasoning" }>).text}
                        running={props.streaming && (reasoning() as Extract<Part, { type: "reasoning" }>).state === "streaming"}
                      />
                    )}
                  </Match>
                  <Match when={part().type === "tool-runCommand" && (part() as ToolPart)}>
                    {(tool) => (
                      <ToolRow
                        part={tool()}
                        streaming={props.streaming}
                        defaultOpen={rows().findIndex((row) => row.id === tool().id) === 2}
                      />
                    )}
                  </Match>
                </Switch>
              )}
            </For>
            <Show when={sources().length > 0}>
              <SourcesRow sources={sources()} running={props.streaming && text().length === 0} />
            </Show>
          </Trace>
        </Show>
        <Show when={text()}>
          <p>{text()}</p>
        </Show>
      </MessageContent>
    </Message>
  )
}

export default function TraceDemo() {
  const { messages, sendMessage, setMessages, status } = chat.useChat({ messages: transcript, delayMs: 20 })
  const busy = () => status() === "submitted" || status() === "streaming"

  return (
    <div {...stylex.attrs(styles.root)}>
      <For each={messages()} keyed={(message) => message.id}>
        {(message) => (
          <Show
            when={message().role === "user"}
            fallback={
              <AssistantMessage message={message()} streaming={busy() && message().id === messages().at(-1)?.id} />
            }
          >
            <Message align="end">
              <MessageContent>
                <Bubble align="end" variant="muted">
                  <BubbleContent>{getMessageText(message())}</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          </Show>
        )}
      </For>
      <Show when={!busy()}>
        <Button
          variant="outline"
          size="sm"
          xstyle={styles.replay}
          onClick={() => {
            setMessages([])
            void sendMessage(question)
          }}
        >
          Replay
        </Button>
      </Show>
    </div>
  )
}

const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } })

const styles = stylex.create({
  root: {
    display: "flex",
    minHeight: "18rem",
    width: "100%",
    maxWidth: "24rem",
    flexDirection: "column",
    gap: "1rem",
    paddingBlock: "1.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  spin: { animationName: spin, animationDuration: "1s", animationTimingFunction: "linear", animationIterationCount: "infinite" },
  preWrap: { whiteSpace: "pre-wrap" },
  maxH64: { maxHeight: "16rem" },
  gap4: { gap: "1rem" },
  replay: { marginTop: "auto", alignSelf: "flex-start" },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
})
