import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & { class?: string }
type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & { class?: string }

const attachmentVariants = cva(
  "group/attachment relative flex w-fit max-w-full min-w-0 shrink-0 flex-wrap rounded-xl border bg-card text-card-foreground transition-colors focus-within:ring-1 focus-within:ring-ring/50 has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed",
  {
    variants: {
      size: {
        default:
          "gap-2 text-sm has-data-[slot=attachment-content]:px-2.5 has-data-[slot=attachment-content]:py-2 has-data-[slot=attachment-media]:p-2",
        sm: "gap-2.5 text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
        xs: "gap-1.5 rounded-lg text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1",
      },
      orientation: {
        horizontal: "min-w-40 items-center",
        vertical: "w-24 flex-col has-data-[slot=attachment-content]:w-30",
      },
    },
  },
)

type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done"

type AttachmentProps = DivProps & VariantProps<typeof attachmentVariants> & { state?: AttachmentState }

function Attachment(props: AttachmentProps) {
  const rest = omit(props, "class", "state", "size", "orientation")
  return (
    <div
      data-slot="attachment"
      data-state={props.state ?? "done"}
      data-size={props.size ?? "default"}
      data-orientation={props.orientation ?? "horizontal"}
      class={cn(
        attachmentVariants({ size: props.size ?? "default", orientation: props.orientation ?? "horizontal" }),
        props.class,
      )}
      {...rest}
    />
  )
}

const attachmentMediaVariants = cva(
  "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 group-data-[size=xs]/attachment:rounded-md group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive group-data-[orientation=vertical]/attachment:*:data-[slot=spinner]:size-6! [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        icon: "",
        image:
          "opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  },
)

type AttachmentMediaProps = DivProps & VariantProps<typeof attachmentMediaVariants>

function AttachmentMedia(props: AttachmentMediaProps) {
  const rest = omit(props, "class", "variant")
  return (
    <div
      data-slot="attachment-media"
      data-variant={props.variant ?? "icon"}
      class={cn(attachmentMediaVariants({ variant: props.variant ?? "icon" }), props.class)}
      {...rest}
    />
  )
}

function AttachmentContent(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="attachment-content"
      class={cn(
        "max-w-full min-w-0 flex-1 leading-tight group-data-[orientation=vertical]/attachment:px-1",
        props.class,
      )}
      {...rest}
    />
  )
}

function AttachmentTitle(props: SpanProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="attachment-title"
      class={cn(
        "block max-w-full min-w-0 truncate font-medium group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer",
        props.class,
      )}
      {...rest}
    />
  )
}

function AttachmentDescription(props: SpanProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="attachment-description"
      class={cn(
        "mt-0.5 block min-w-0 truncate text-xs text-muted-foreground group-data-[state=error]/attachment:text-destructive/80",
        "max-w-full",
        props.class,
      )}
      {...rest}
    />
  )
}

function AttachmentActions(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="attachment-actions"
      class={cn(
        "relative z-20 flex shrink-0 items-center group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-3 group-data-[orientation=vertical]/attachment:right-3 group-data-[orientation=vertical]/attachment:gap-1",
        props.class,
      )}
      {...rest}
    />
  )
}

function AttachmentAction(props: ButtonProps) {
  const rest = omit(props, "class", "variant", "size")
  return (
    <Button
      data-slot="attachment-action"
      variant={props.variant ?? "ghost"}
      size={props.size ?? "icon-xs"}
      class={cn(props.class)}
      {...rest}
    />
  )
}

type AttachmentTriggerProps = Omit<useRender.ComponentProps<"button">, "class"> & { class?: string }

function AttachmentTrigger(props: AttachmentTriggerProps) {
  const rest = omit(props, "class", "render", "type", "children")
  return useRender({
    defaultTagName: "button",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    state: { slot: "attachment-trigger" },
    get props() {
      return mergeProps<Record<string, unknown>>(
        {
          type: props.render ? props.type : (props.type ?? "button"),
          class: cn("absolute inset-0 z-10 outline-none", props.class),
        },
        rest,
      )
    },
  })
}

function AttachmentGroup(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="attachment-group"
      class={cn(
        "flex min-w-0 scroll-fade-x snap-x snap-mandatory scroll-px-1 scrollbar-none gap-3 overflow-x-auto overscroll-x-contain py-1 *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
        props.class,
      )}
      {...rest}
    />
  )
}

export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
  type AttachmentProps,
  type AttachmentState,
  type AttachmentMediaProps,
  type AttachmentTriggerProps,
}
