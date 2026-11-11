import { For, Show } from "solid-js"
import { ArrowUp, Globe, Image, MessageCircleDashed, Paperclip, Plus, RotateCw, Telescope } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Bubble, BubbleContent } from "@shadcn-solid/tailwind/ui/bubble"
import { Button, type ButtonProps } from "@shadcn-solid/tailwind/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@shadcn-solid/tailwind/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shadcn-solid/tailwind/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@shadcn-solid/tailwind/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton } from "@shadcn-solid/tailwind/ui/input-group"
import { Message, MessageContent } from "@shadcn-solid/tailwind/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@shadcn-solid/tailwind/ui/message-scroller"
import { Tooltip, TooltipContent, TooltipTrigger } from "@shadcn-solid/tailwind/ui/tooltip"
import { getMessageText, type ChatMessage } from "./lib/fake-chat"
import { parseMessage, scrollerChat as chat } from "./lib/scroller-chat"

type InputGroupButtonProps = Parameters<typeof InputGroupButton>[0]

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
              <Tooltip>
                <TooltipTrigger
                  aria-label="Reset conversation"
                  onClick={() => setMessages(initialMessages)}
                  render={(p) => (
                    <Button {...(p as ButtonProps)} variant="outline" size="icon" disabled={isBusy()} />
                  )}
                >
                  <Icon icon={RotateCw} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset</p>
                </TooltipContent>
              </Tooltip>
            </CardAction>
          </CardHeader>
          <CardContent class="flex-1 overflow-hidden p-0">
            <Show
              when={messages().length > 0}
              fallback={
                <Empty class="h-full">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Icon icon={MessageCircleDashed} />
                    </EmptyMedia>
                    <EmptyTitle>Morning, shadcn!</EmptyTitle>
                    <EmptyDescription>What are we working on today? Press send to start a new conversation</EmptyDescription>
                  </EmptyHeader>
                </Empty>
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
              <InputGroup>
                <div class="h-14 w-full px-3 py-2.5">
                  <span class="line-clamp-2 opacity-60 data-[status=ready]:opacity-100" data-status={status()}>
                    <Show
                      when={nextMessage()}
                      fallback={<span class="text-muted-foreground">No messages queued. Reset the conversation.</span>}
                    >
                      {(next) => <>{getMessageText(next())}</>}
                    </Show>
                  </span>
                </div>
                <InputGroupAddon align="block-end" class="pt-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Add files"
                      render={(p) => (
                        <InputGroupButton {...(p as InputGroupButtonProps)} type="button" size="icon-sm" variant="outline" />
                      )}
                    >
                      <Icon icon={Plus} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" class="w-44">
                      <DropdownMenuItem>
                        <Icon icon={Paperclip} />
                        Add Photos & Files
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Icon icon={Image} />
                        Create Image
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Icon icon={Telescope} />
                        Deep Research
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Icon icon={Globe} />
                        Web Search
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={!nextMessage() || isBusy()}
                    class="ml-auto"
                  >
                    <Icon icon={ArrowUp} />
                    <span class="sr-only">Send</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </CardFooter>
        </Card>
        <div class="px-0.5 text-center text-xs text-muted-foreground">Demo is read only. Press send to send messages.</div>
      </div>
    </MessageScrollerProvider>
  )
}
