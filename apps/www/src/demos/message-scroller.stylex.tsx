import { For, Show } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { ArrowUp, MessageCircleDashed, Plus, RotateCw } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Bubble, BubbleContent } from "@shadcn-solid/stylex/ui/bubble"
import { Button } from "@shadcn-solid/stylex/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@shadcn-solid/stylex/ui/card"
import { Message, MessageContent } from "@shadcn-solid/stylex/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@shadcn-solid/stylex/ui/message-scroller"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"
import { getMessageText, type ChatMessage } from "./lib/fake-chat"
import { parseMessage, scrollerChat as chat } from "./lib/scroller-chat"

const initialMessages = chat.get(0)

// shadcn's docs use a MessageAnimated helper: a MessageScrollerItem holding a Message and Bubble
// (user: default bubble on the end side, assistant: ghost bubble) that fades in.
function MessageAnimated(props: { message: ChatMessage; scrollAnchor?: boolean }) {
  const user = () => props.message.role === "user"
  return (
    <MessageScrollerItem messageId={props.message.id} scrollAnchor={props.scrollAnchor}>
      <Message align={user() ? "end" : "start"} xstyle={styles.enter}>
        <MessageContent>
          <Bubble variant={user() ? "default" : "ghost"} align={user() ? "end" : "start"}>
            <BubbleContent xstyle={styles.paragraphs}>
              <For each={parseMessage(getMessageText(props.message))}>
                {(paragraph) => (
                  <p>
                    <For each={paragraph}>
                      {(run) => (run.code ? <code {...stylex.attrs(styles.code)}>{run.text}</code> : run.text)}
                    </For>
                  </p>
                )}
              </For>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  )
}

export default function MessageScrollerDemo() {
  const { messages, sendMessage, status, setMessages } = chat.useChat({ messages: initialMessages, delayMs: 20 })
  const nextMessage = () => chat.next(messages())
  const isBusy = () => status() === "submitted" || status() === "streaming"

  return (
    <MessageScrollerProvider>
      <div {...stylex.attrs(styles.root)}>
        <Card xstyle={styles.card}>
          <CardHeader xstyle={styles.header}>
            <CardTitle>New Chat</CardTitle>
            <CardDescription>How can I help you today?</CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="icon"
                aria-label="Reset conversation"
                title="Reset"
                onClick={() => setMessages(initialMessages)}
                disabled={isBusy()}
              >
                <Icon icon={RotateCw} />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent xstyle={styles.content}>
            <Show
              when={messages().length > 0}
              fallback={
                <div {...stylex.attrs(styles.empty)}>
                  <div {...stylex.attrs(styles.emptyMedia)}>
                    <Icon icon={MessageCircleDashed} size={24} />
                  </div>
                  <div {...stylex.attrs(styles.emptyTitle)}>Morning, shadcn!</div>
                  <p {...stylex.attrs(styles.emptyDescription)}>
                    What are we working on today? Press send to start a new conversation
                  </p>
                </div>
              }
            >
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent aria-busy={isBusy() ? "true" : "false"} xstyle={styles.list}>
                    <For each={messages()} keyed={(message) => message.id}>
                      {(message) => <MessageAnimated message={message()} scrollAnchor={message().role === "user"} />}
                    </For>
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </Show>
          </CardContent>
          <CardFooter xstyle={styles.footer}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const next = nextMessage()
                if (!next || isBusy()) {
                  return
                }
                void sendMessage(next)
              }}
              {...stylex.attrs(styles.form)}
            >
              <div {...stylex.attrs(styles.composer)}>
                <div {...stylex.attrs(styles.queued)}>
                  <span data-status={status()} {...stylex.attrs(styles.queuedText)}>
                    <Show
                      when={nextMessage()}
                      fallback={<span {...stylex.attrs(styles.muted)}>No messages queued. Reset the conversation.</span>}
                    >
                      {(next) => <>{getMessageText(next())}</>}
                    </Show>
                  </span>
                </div>
                <div {...stylex.attrs(styles.composerActions)}>
                  <Button aria-label="Add files" type="button" size="icon-sm" variant="outline" xstyle={styles.round}>
                    <Icon icon={Plus} />
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={!nextMessage() || isBusy()}
                    xstyle={[styles.round, styles.send]}
                  >
                    <Icon icon={ArrowUp} />
                    <span {...stylex.attrs(styles.srOnly)}>Send</span>
                  </Button>
                </div>
              </div>
            </form>
          </CardFooter>
        </Card>
        <div {...stylex.attrs(styles.note)}>Demo is read only. Press send to send messages.</div>
      </div>
    </MessageScrollerProvider>
  )
}

const enter = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(0.25rem)" },
})

const styles = stylex.create({
  root: { position: "relative", display: "flex", width: "100%", flexDirection: "column", gap: "1rem" },
  card: { marginInline: "auto", height: "35rem", width: "100%", maxWidth: "24rem", gap: 0 },
  header: {
    gap: "0.25rem",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    paddingBottom: "var(--card-spacing)",
  },
  content: { flex: "1 1 0%", overflow: "hidden", padding: 0, paddingInline: 0 },
  empty: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1.5rem",
    textAlign: "center",
  },
  emptyMedia: {
    marginBottom: "0.5rem",
    display: "flex",
    width: "2.5rem",
    height: "2.5rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    color: colors.foreground,
  },
  emptyTitle: { fontSize: "1.125rem", lineHeight: "1.75rem", fontWeight: 500, letterSpacing: "-0.025em" },
  emptyDescription: { fontSize: "0.875rem", lineHeight: 1.625, color: colors.mutedForeground },
  list: { padding: "var(--card-spacing)" },
  enter: { animationName: enter, animationDuration: "300ms", animationTimingFunction: "ease" },
  paragraphs: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  code: {
    borderRadius: "0.25rem",
    backgroundColor: colors.muted,
    paddingInline: "0.25rem",
    paddingBlock: "0.125rem",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: "0.8125rem",
  },
  footer: { flexDirection: "column", gap: "0.5rem" },
  form: { width: "100%" },
  composer: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.input,
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    backgroundColor: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
  },
  queued: {
    height: "3.5rem",
    width: "100%",
    paddingInline: "0.75rem",
    paddingBlock: "0.625rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  queuedText: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
    opacity: { default: 0.6, ":is([data-status=ready])": 1 },
  },
  muted: { color: colors.mutedForeground },
  composerActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    paddingInline: "0.75rem",
    paddingTop: "0.25rem",
    paddingBottom: "0.75rem",
  },
  round: { borderRadius: "9999px" },
  send: { marginLeft: "auto" },
  note: {
    paddingInline: "0.125rem",
    textAlign: "center",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    color: colors.mutedForeground,
  },
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
