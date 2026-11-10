import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & { class?: string }
type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & { class?: string }

function Trace(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="trace"
      class={cn(
        "flex w-full min-w-0 flex-col gap-2 *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:rounded-md *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-none *:has-[>[data-slot=trace-line]]:focus-visible:ring-3 *:has-[>[data-slot=trace-line]]:focus-visible:ring-ring/50",
        props.class,
      )}
      {...rest}
    />
  )
}

type TraceLineProps = SpanProps & { status?: "running" | "error" | "pending" }

function TraceLine(props: TraceLineProps) {
  const rest = omit(props, "class", "status")
  return (
    <span
      data-slot="trace-line"
      data-status={props.status}
      class={cn(
        "flex w-fit max-w-full min-w-0 items-center gap-2 text-sm text-muted-foreground transition-colors in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-foreground data-[status=error]:text-destructive data-[status=error]:in-[a:hover,button:hover]:text-destructive data-[status=pending]:opacity-60 data-[status=running]:*:data-[slot=trace-title]:shimmer",
        props.class,
      )}
      {...rest}
    />
  )
}

function TraceIcon(props: SpanProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      class={cn(
        "flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=trace-title]~&]:-ml-1",
        props.class,
      )}
      {...rest}
    />
  )
}

function TraceTitle(props: SpanProps) {
  const rest = omit(props, "class")
  return <span data-slot="trace-title" class={cn("min-w-0 truncate motion-reduce:shimmer-none", props.class)} {...rest} />
}

function TraceDescription(props: SpanProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="trace-description"
      class={cn("shrink-0 text-muted-foreground/70 tabular-nums", props.class)}
      {...rest}
    />
  )
}

type CollapsibleProps = Parameters<typeof Collapsible>[0]

type TraceCollapsibleProps = Omit<CollapsibleProps, "open" | "class"> & { class?: string } & (
    | { open?: undefined }
    | { open: boolean; onOpenChange: NonNullable<CollapsibleProps["onOpenChange"]> }
  )

function TraceCollapsible(props: TraceCollapsibleProps) {
  const rest = omit(props, "class")
  return <Collapsible data-slot="trace-collapsible" class={cn("flex w-full min-w-0 flex-col", props.class)} {...rest} />
}

type TraceCollapsibleTriggerProps = Omit<Parameters<typeof CollapsibleTrigger>[0], "class"> & { class?: string }

function TraceCollapsibleTrigger(props: TraceCollapsibleTriggerProps) {
  const rest = omit(props, "class", "children")
  return (
    <CollapsibleTrigger
      data-slot="trace-collapsible-trigger"
      class={cn(
        "group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-md text-left text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 has-[[data-status=error]]:text-destructive",
        props.class,
      )}
      {...rest}
    >
      {props.children}
      <TraceIcon class="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90">
        <Icon icon={ChevronRight} />
      </TraceIcon>
    </CollapsibleTrigger>
  )
}

type TraceCollapsibleContentProps = Omit<Parameters<typeof CollapsibleContent>[0], "class"> & { class?: string }

function TraceCollapsibleContent(props: TraceCollapsibleContentProps) {
  const rest = omit(props, "class", "children")
  return (
    <CollapsibleContent
      data-slot="trace-collapsible-content"
      class="h-(--collapsible-panel-height) min-w-0 overflow-hidden transition-[height] duration-200 data-ending-style:h-0 data-starting-style:h-0"
      {...rest}
    >
      <div
        data-slot="trace-collapsible-content-inner"
        class={cn(
          "mt-2 mb-1 ml-[calc(--spacing(2)-1px)] min-w-0 border-l pr-1 pl-4 leading-relaxed wrap-break-word text-muted-foreground",
          props.class,
        )}
      >
        {props.children}
      </div>
    </CollapsibleContent>
  )
}

export {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
  type TraceLineProps,
  type TraceCollapsibleProps,
}
