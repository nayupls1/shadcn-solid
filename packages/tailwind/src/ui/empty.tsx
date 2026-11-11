import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

type DivProps = Omit<JSX.IntrinsicElements["div"], "class"> & { class?: string }

function Empty(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="empty"
      class={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-lg border-dashed p-12 text-center text-balance",
        props.class,
      )}
      {...rest}
    />
  )
}

function EmptyHeader(props: DivProps) {
  const rest = omit(props, "class")
  return <div data-slot="empty-header" class={cn("flex max-w-sm flex-col items-center gap-2", props.class)} {...rest} />
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type EmptyMediaProps = DivProps & VariantProps<typeof emptyMediaVariants>

function EmptyMedia(props: EmptyMediaProps) {
  const rest = omit(props, "class", "variant")
  return (
    <div
      data-slot="empty-icon"
      data-variant={props.variant ?? "default"}
      class={cn(emptyMediaVariants({ variant: props.variant ?? "default", class: props.class }))}
      {...rest}
    />
  )
}

function EmptyTitle(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="empty-title"
      class={cn("cn-font-heading text-lg font-medium tracking-tight", props.class)}
      {...rest}
    />
  )
}

type EmptyDescriptionProps = Omit<JSX.IntrinsicElements["p"], "class"> & { class?: string }

function EmptyDescription(props: EmptyDescriptionProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="empty-description"
      class={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        props.class,
      )}
      {...(rest as JSX.IntrinsicElements["div"])}
    />
  )
}

function EmptyContent(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="empty-content"
      class={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance", props.class)}
      {...rest}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  emptyMediaVariants,
  type EmptyMediaProps,
}
