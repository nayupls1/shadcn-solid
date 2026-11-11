import { children, createEffect, createSignal, For, omit, Show } from "solid-js"
import type { JSX } from "@solidjs/web"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Copy } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & { class?: string }

const codeBlockVariants = cva(
  "group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-lg text-sm has-[>[data-slot=code-block-content]:focus-visible]:ring-3 has-[>[data-slot=code-block-content]:focus-visible]:ring-ring/50 data-[size=sm]:text-xs",
  {
    variants: {
      variant: {
        default:
          "border border-input text-foreground has-[>[data-slot=code-block-content]:focus-visible]:border-ring dark:bg-input/30",
        destructive: "border border-destructive/30 text-destructive dark:border-destructive/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type CodeBlockProps = DivProps & VariantProps<typeof codeBlockVariants> & { size?: "default" | "sm" }

function CodeBlock(props: CodeBlockProps) {
  const rest = omit(props, "class", "variant", "size")
  return (
    <div
      data-slot="code-block"
      data-variant={props.variant ?? "default"}
      data-size={props.size ?? "default"}
      class={cn(codeBlockVariants({ variant: props.variant ?? "default" }), props.class)}
      {...rest}
    />
  )
}

function CodeBlockHeader(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="code-block-header"
      class={cn(
        "flex min-w-0 shrink-0 items-center gap-2 px-4 pt-4 text-muted-foreground group-data-[size=sm]/code-block:px-3 group-data-[size=sm]/code-block:pt-3 group-data-[variant=destructive]/code-block:text-destructive *:has-[>[data-slot=code-block-title]]:min-w-0",
        props.class,
      )}
      {...rest}
    />
  )
}

function CodeBlockTitle(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="code-block-title"
      class={cn(
        "min-w-0 truncate font-sans text-sm font-medium text-foreground group-data-[size=sm]/code-block:text-xs group-data-[variant=destructive]/code-block:text-destructive [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:align-middle [&_svg:not([class*='size-'])]:size-4 group-data-[size=sm]/code-block:[&_svg:not([class*='size-'])]:size-3.5 *:[svg]:me-1.5",
        props.class,
      )}
      {...rest}
    />
  )
}

function CodeBlockActions(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="code-block-actions"
      class={cn(
        "-my-1 ms-auto -me-1.5 flex shrink-0 items-center gap-1 [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:end-3 [[data-slot=code-block]>&]:top-3 [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:m-0 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100 [[data-slot=code-block]>&]:group-hover/code-block:opacity-100 group-data-[size=sm]/code-block:[[data-slot=code-block]>&]:end-2 group-data-[size=sm]/code-block:[[data-slot=code-block]>&]:top-2 [[data-slot=code-block]>&]:pointer-coarse:opacity-100 [[data-slot=code-block]>&]:*:[button]:bg-background [[data-slot=code-block]>&]:*:[button]:ring-1 [[data-slot=code-block]>&]:*:[button]:ring-foreground/10",
        props.class,
      )}
      {...rest}
    />
  )
}

type CodeBlockCopyButtonProps = ButtonProps & { value: string }

function CodeBlockCopyButton(props: CodeBlockCopyButtonProps) {
  const rest = omit(props, "value", "variant", "size", "class", "onClick")
  const [copied, setCopied] = createSignal(false)

  createEffect(copied, (isCopied) => {
    if (!isCopied) {
      return
    }

    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  })

  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        data-copied={copied() || undefined}
        variant={props.variant ?? "ghost"}
        size={props.size ?? "icon-xs"}
        aria-label={copied() ? "Copied" : "Copy"}
        class={cn(props.class)}
        onClick={(event: MouseEvent) => {
          const onClick = props.onClick
          if (typeof onClick === "function") (onClick as (event: MouseEvent) => void)(event)
          navigator.clipboard
            .writeText(props.value)
            .then(() => setCopied(true))
            .catch(() => {})
        }}
        {...rest}
      >
        <Show when={copied()} fallback={<Icon icon={Copy} />}>
          <Icon icon={Check} />
        </Show>
      </Button>
      <span aria-live="polite" class="sr-only">
        {copied() ? "Copied" : ""}
      </span>
    </>
  )
}

type CodeBlockContentProps = Omit<JSX.HTMLAttributes<HTMLPreElement>, "class" | "style"> & {
  class?: string
  style?: JSX.CSSProperties
  wrap?: boolean
  lineNumbers?: boolean
  startLine?: number
}

function CodeBlockContent(props: CodeBlockContentProps) {
  const rest = omit(props, "class", "children", "style", "wrap", "lineNumbers", "startLine")
  const resolved = children(() => props.children)
  const lines = () => {
    const value = resolved()
    return props.lineNumbers && typeof value === "string" ? value.replace(/\n$/, "").split("\n") : null
  }
  return (
    <pre
      data-slot="code-block-content"
      data-wrap={props.wrap || undefined}
      data-numbered={props.lineNumbers || undefined}
      dir="ltr"
      tabindex={0}
      style={{ "counter-reset": `line ${(props.startLine ?? 1) - 1}`, ...props.style }}
      class={cn(
        "min-h-0 min-w-0 scroll-fade-x scrollbar-thin overflow-auto px-4 py-4 text-start font-mono leading-relaxed outline-none group-has-data-[slot=code-block-footer]/code-block:pb-2 group-has-data-[slot=code-block-header]/code-block:pt-2 group-data-[size=sm]/code-block:px-3 group-data-[size=sm]/code-block:py-3 group-data-[size=sm]/code-block:group-has-data-[slot=code-block-header]/code-block:pt-1.5 data-wrap:scroll-fade-y data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap",
        props.class,
      )}
      {...rest}
    >
      <code
        data-slot="code-block-code"
        class="grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0"
      >
        <Show when={lines()} fallback={resolved()}>
          {(split) => <For each={split()}>{(line) => <CodeBlockLine>{line}</CodeBlockLine>}</For>}
        </Show>
      </code>
    </pre>
  )
}

const codeBlockLineVariants = cva(
  "relative -mx-4 block min-h-lh px-4 group-data-[size=sm]/code-block:-mx-3 group-data-[size=sm]/code-block:px-3 before:min-w-6 before:text-end before:text-muted-foreground after:absolute after:start-1 after:top-0 after:text-muted-foreground after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']",
  {
    variants: {
      variant: {
        default: "",
        added: "bg-muted after:content-['+']",
        removed: "bg-destructive/10 after:text-destructive after:content-['−']",
        highlighted: "bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type CodeBlockLineProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> &
  VariantProps<typeof codeBlockLineVariants> & { class?: string }

/** Whether a line's children are empty (an empty line still holds a newline for copying). */
function isEmptyLine(children: unknown) {
  return (
    children === undefined ||
    children === null ||
    children === "" ||
    (Array.isArray(children) && children.length === 0)
  )
}

function CodeBlockLine(props: CodeBlockLineProps) {
  const rest = omit(props, "class", "variant", "children")
  const resolved = children(() => props.children)
  return (
    <span
      data-slot="code-block-line"
      data-variant={props.variant ?? "default"}
      class={cn(codeBlockLineVariants({ variant: props.variant ?? "default" }), props.class)}
      {...rest}
    >
      {/* An empty line holds a newline so copying a selection keeps blank lines. */}
      <span data-slot="code-block-line-content" class="min-w-0">
        {isEmptyLine(resolved()) ? "\n" : resolved()}
      </span>
    </span>
  )
}

function CodeBlockFooter(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="code-block-footer"
      class={cn(
        "flex min-w-0 shrink-0 items-center gap-2 px-4 pb-4 text-muted-foreground group-data-[size=sm]/code-block:px-3 group-data-[size=sm]/code-block:pb-3",
        props.class,
      )}
      {...rest}
    />
  )
}

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
  CodeBlockFooter,
  type CodeBlockProps,
  type CodeBlockContentProps,
  type CodeBlockLineProps,
  type CodeBlockCopyButtonProps,
}
