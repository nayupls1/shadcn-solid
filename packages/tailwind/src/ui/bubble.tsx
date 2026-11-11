import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { renderProps } from "@shadcn-solid/primitives/render-props"

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & { class?: string }

function BubbleGroup(props: DivProps) {
  const rest = omit(props, "class")
  return <div data-slot="bubble-group" class={cn("flex min-w-0 flex-col gap-2", props.class)} {...rest} />
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
        secondary:
          "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        muted:
          "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
        tinted:
          "*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] *:data-[slot=bubble-content]:text-foreground dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]",
        outline:
          "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30",
        ghost:
          "border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50",
        destructive:
          "*:data-[slot=bubble-content]:bg-destructive/10 *:data-[slot=bubble-content]:text-destructive dark:*:data-[slot=bubble-content]:bg-destructive/20 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type BubbleProps = DivProps & VariantProps<typeof bubbleVariants> & { align?: "start" | "end" }

function Bubble(props: BubbleProps) {
  const rest = omit(props, "class", "variant", "align")
  return (
    <div
      data-slot="bubble"
      data-variant={props.variant ?? "default"}
      data-align={props.align ?? "start"}
      class={cn(bubbleVariants({ variant: props.variant ?? "default" }), props.class)}
      {...rest}
    />
  )
}

type BubbleContentProps = Omit<useRender.ComponentProps<"div">, "class"> & { class?: string }

function BubbleContent(props: BubbleContentProps) {
  const rest = omit(props, "class", "render", "children")
  return useRender({
    defaultTagName: "div",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    state: { slot: "bubble-content" },
    props: renderProps(() => {
      return mergeProps<Record<string, unknown>>(
        {
          class: cn(
            "w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50",
            props.class,
          ),
        },
        rest,
      )
    }),
  })
}

const bubbleReactionsVariants = cva(
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-sm ring-3 ring-card has-[button]:p-0",
  {
    variants: {
      side: {
        top: "top-0 -translate-y-3/4",
        bottom: "bottom-0 translate-y-3/4",
      },
      align: {
        start: "left-3",
        end: "right-3",
      },
    },
    defaultVariants: {
      side: "bottom",
      align: "end",
    },
  },
)

type BubbleReactionsProps = DivProps & { align?: "start" | "end"; side?: "top" | "bottom" }

function BubbleReactions(props: BubbleReactionsProps) {
  const rest = omit(props, "class", "side", "align")
  return (
    <div
      data-slot="bubble-reactions"
      data-align={props.align ?? "end"}
      data-side={props.side ?? "bottom"}
      class={cn(
        bubbleReactionsVariants({ side: props.side ?? "bottom", align: props.align ?? "end" }),
        props.class,
      )}
      {...rest}
    />
  )
}

export {
  BubbleGroup,
  Bubble,
  BubbleContent,
  BubbleReactions,
  type BubbleProps,
  type BubbleContentProps,
  type BubbleReactionsProps,
}
