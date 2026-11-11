import { For, Show } from "solid-js"
import { ArrowUp, MessageCircleDashed, Plus, RotateCw } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Bubble, BubbleContent } from "@shadcn-solid/tailwind/ui/bubble"
import { Button } from "@shadcn-solid/tailwind/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@shadcn-solid/tailwind/ui/card"
import { Message, MessageContent } from "@shadcn-solid/tailwind/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@shadcn-solid/tailwind/ui/message-scroller"
import { getMessageText, type ChatMessage } from "./lib/fake-chat"
import { parseMessage, scrollerChat as chat } from "./lib/scroller-chat"

const initialMessages = chat.get(0)

// shadcn's docs use a MessageAnimated helper: a MessageScrollerItem holding a Message and Bubble
// (user: default bubble on the end side, assistant: ghost bubble) that fades in.
function MessageAnimated(props: { message: ChatMessage; scrollAnchor?: boolean }) {
  const user = () => props.message.role === "user"
  return (
    <MessageScrollerItem messageId={props.message.id} scrollAnchor={props.scrollAnchor}>
      <Message align={user() ? "end" : "start"} class="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
        <MessageContent>
          <Bubble variant={user() ? "default" : "ghost"} align={user() ? "end" : "start"}>
            <BubbleContent class="flex flex-col gap-3">
              <For each={parseMessage(getMessageText(props.message))}>
                {(paragraph) => (
                  <p>
                    <For each={paragraph}>
                      {(run) =>
                        run.code ? <code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.8125rem]">{run.text}</code> : run.text
                      }
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
      <div class="relative flex w-full flex-col gap-4">
        <Card class="mx-auto h-140 w-full max-w-sm gap-0">
          <CardHeader class="gap-1 border-b">
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
          <CardContent class="flex-1 overflow-hidden p-0">
            <Show
              when={messages().length > 0}
              fallback={
                <div class="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                  <div class="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon icon={MessageCircleDashed} class="size-6" />
                  </div>
                  <div class="text-lg font-medium tracking-tight">Morning, shadcn!</div>
                  <p class="text-sm/relaxed text-muted-foreground">
                    What are we working on today? Press send to start a new conversation
                  </p>
                </div>
              }
            >
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent aria-busy={isBusy() ? "true" : "false"} class="p-(--card-spacing)">
                    <For each={messages()} keyed={(message) => message.id}>
                      {(message) => <MessageAnimated message={message()} scrollAnchor={message().role === "user"} />}
                    </For>
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </Show>
          </CardContent>
          <CardFooter class="flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const next = nextMessage()
                if (!next || isBusy()) {
                  return
                }
                void sendMessage(next)
              }}
              class="w-full"
            >
              <div class="flex w-full flex-col rounded-md border border-input shadow-xs dark:bg-input/30">
                <div class="h-14 w-full px-3 py-2.5 text-sm">
                  <span class="line-clamp-2 opacity-60 data-[status=ready]:opacity-100" data-status={status()}>
                    <Show
                      when={nextMessage()}
                      fallback={<span class="text-muted-foreground">No messages queued. Reset the conversation.</span>}
                    >
                      {(next) => <>{getMessageText(next())}</>}
                    </Show>
                  </span>
                </div>
                <div class="flex items-center gap-2 px-3 pt-1 pb-3">
                  <Button aria-label="Add files" type="button" size="icon-sm" variant="outline" class="rounded-full">
                    <Icon icon={Plus} />
                  </Button>
                  <Button type="submit" variant="default" size="icon-sm" disabled={!nextMessage() || isBusy()} class="ml-auto rounded-full">
                    <Icon icon={ArrowUp} />
                    <span class="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </form>
          </CardFooter>
        </Card>
        <div class="px-0.5 text-center text-xs text-muted-foreground">Demo is read only. Press send to send messages.</div>
      </div>
    </MessageScrollerProvider>
  )
}
