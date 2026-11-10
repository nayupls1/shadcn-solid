import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground",
  {
    variants: {
      variant: {
        default: "",
        separator:
          "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
        border: "border-b border-border pb-2",
      },
    },
  },
)

type MarkerProps = Omit<useRender.ComponentProps<"div">, "class"> &
  VariantProps<typeof markerVariants> & { class?: string }

function Marker(props: MarkerProps) {
  const rest = omit(props, "class", "variant", "render", "children")
  return useRender({
    defaultTagName: "div",
    get render() {
      return props.render
    },
    get children() {
      return props.children
    },
    state: () => ({ slot: "marker", variant: props.variant ?? "default" }),
    get props() {
      return mergeProps<Record<string, unknown>>({ class: cn(markerVariants({ variant: props.variant ?? "default", class: props.class })) }, rest)
    },
  })
}

type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & { class?: string }

function MarkerIcon(props: SpanProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="marker-icon"
      aria-hidden="true"
      class={cn("size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4", props.class)}
      {...rest}
    />
  )
}

function MarkerContent(props: SpanProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="marker-content"
      class={cn(
        "min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        props.class,
      )}
      {...rest}
    />
  )
}

export { Marker, MarkerIcon, MarkerContent, markerVariants, type MarkerProps }
