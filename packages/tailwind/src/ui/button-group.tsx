import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Separator, type SeparatorProps } from "../ui/separator"

const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "*:data-slot:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md! [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0",
        vertical:
          "flex-col *:data-slot:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-md! [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
)

type ButtonGroupProps = Omit<JSX.IntrinsicElements["div"], "class"> &
  VariantProps<typeof buttonGroupVariants> & { class?: string }

function ButtonGroup(props: ButtonGroupProps) {
  const rest = omit(props, "class", "orientation")
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={props.orientation ?? undefined}
      class={cn(buttonGroupVariants({ orientation: props.orientation }), props.class)}
      {...rest}
    />
  )
}

type ButtonGroupTextProps = Omit<useRender.ComponentProps<"div">, "class"> & { class?: string }

function ButtonGroupText(props: ButtonGroupTextProps) {
  const rest = omit(props, "class", "render", "children")
  return useRender({
    defaultTagName: "div",
    get render() {
      return props.render
    },
    get props() {
      return mergeProps<Record<string, unknown>>(
        {
          class: cn(
            "flex items-center gap-2 rounded-md border bg-muted px-2.5 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
            props.class,
          ),
        },
        rest,
      )
    },
    get children() {
      return props.children
    },
    state: { slot: "button-group-text" },
  })
}

type ButtonGroupSeparatorProps = SeparatorProps

function ButtonGroupSeparator(props: ButtonGroupSeparatorProps) {
  const rest = omit(props, "class", "orientation")
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={props.orientation ?? "vertical"}
      class={cn(
        "relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        props.class,
      )}
      {...rest}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
  type ButtonGroupProps,
  type ButtonGroupTextProps,
  type ButtonGroupSeparatorProps,
}
