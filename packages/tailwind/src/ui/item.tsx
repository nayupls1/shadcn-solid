import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Separator, type SeparatorProps } from "./separator"

type DivProps = Omit<JSX.IntrinsicElements["div"], "class"> & { class?: string }

function ItemGroup(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      role="list"
      data-slot="item-group"
      class={cn(
        "group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2",
        props.class,
      )}
      {...rest}
    />
  )
}

function ItemSeparator(props: SeparatorProps) {
  const rest = omit(props, "class")
  return <Separator data-slot="item-separator" orientation="horizontal" class={cn("my-2", props.class)} {...rest} />
}

const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center rounded-md border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-muted",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50",
      },
      size: {
        default: "gap-3.5 px-4 py-3.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

type ItemProps = Omit<useRender.ComponentProps<"div">, "class"> &
  VariantProps<typeof itemVariants> & { class?: string }

function Item(props: ItemProps) {
  const rest = omit(props, "class", "variant", "size", "render", "children")
  return useRender({
    defaultTagName: "div",
    get props() {
      return mergeProps<Record<string, unknown>>(
        {
          class: cn(itemVariants({ variant: props.variant, size: props.size, class: props.class })),
        },
        rest,
      )
    },
    get render() {
      return props.render
    },
    // Passed on their own: `mergeProps` reads every getter, and reading `children` there would
    // create the child components inside the props memo.
    get children() {
      return props.children
    },
    state: () => ({
      slot: "item",
      variant: props.variant ?? "default",
      size: props.size ?? "default",
    }),
  })
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type ItemMediaProps = DivProps & VariantProps<typeof itemMediaVariants>

function ItemMedia(props: ItemMediaProps) {
  const rest = omit(props, "class", "variant")
  return (
    <div
      data-slot="item-media"
      data-variant={props.variant ?? "default"}
      class={cn(itemMediaVariants({ variant: props.variant ?? "default", class: props.class }))}
      {...rest}
    />
  )
}

function ItemContent(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="item-content"
      class={cn(
        "flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        props.class,
      )}
      {...rest}
    />
  )
}

function ItemTitle(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="item-title"
      class={cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4",
        props.class,
      )}
      {...rest}
    />
  )
}

type ItemDescriptionProps = Omit<JSX.IntrinsicElements["p"], "class"> & { class?: string }

function ItemDescription(props: ItemDescriptionProps) {
  const rest = omit(props, "class")
  return (
    <p
      data-slot="item-description"
      class={cn(
        "line-clamp-2 text-left text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        props.class,
      )}
      {...rest}
    />
  )
}

function ItemActions(props: DivProps) {
  const rest = omit(props, "class")
  return <div data-slot="item-actions" class={cn("flex items-center gap-2", props.class)} {...rest} />
}

function ItemHeader(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="item-header"
      class={cn("flex basis-full items-center justify-between gap-2", props.class)}
      {...rest}
    />
  )
}

function ItemFooter(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="item-footer"
      class={cn("flex basis-full items-center justify-between gap-2", props.class)}
      {...rest}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
  itemVariants,
  itemMediaVariants,
  type ItemProps,
  type ItemMediaProps,
}
