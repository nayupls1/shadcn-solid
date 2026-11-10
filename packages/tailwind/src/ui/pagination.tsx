import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide"
import type { VariantProps } from "class-variance-authority"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { Button, type buttonVariants } from "./button"

function Pagination(props: Omit<JSX.IntrinsicElements["nav"], "class"> & { class?: string }) {
  const rest = omit(props, "class")
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      class={cn("mx-auto flex w-full justify-center", props.class)}
      {...rest}
    />
  )
}

function PaginationContent(props: Omit<JSX.IntrinsicElements["ul"], "class"> & { class?: string }) {
  const rest = omit(props, "class")
  return <ul data-slot="pagination-content" class={cn("flex items-center gap-1", props.class)} {...rest} />
}

function PaginationItem(props: JSX.IntrinsicElements["li"]) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  size?: VariantProps<typeof buttonVariants>["size"]
  class?: string
} & Omit<JSX.IntrinsicElements["a"], "class">

function PaginationLink(props: PaginationLinkProps) {
  const rest = omit(props, "class", "isActive", "size")
  return (
    <Button
      variant={props.isActive ? "outline" : "ghost"}
      size={props.size ?? "icon"}
      class={cn(props.class)}
      nativeButton={false}
      render={(buttonProps) => (
        <a
          {...(buttonProps as JSX.IntrinsicElements["a"])}
          aria-current={props.isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={props.isActive}
          {...rest}
        />
      )}
    />
  )
}

type PaginationPreviousProps = PaginationLinkProps & { text?: string }

function PaginationPrevious(props: PaginationPreviousProps) {
  const rest = omit(props, "class", "text")
  return (
    <PaginationLink aria-label="Go to previous page" size="default" class={cn("pl-2!", props.class)} {...rest}>
      {/* shadcn's `cn-rtl-flip` mirrors the chevron in right-to-left layouts. */}
      <Icon icon={ChevronLeft} data-icon="inline-start" class="rtl:rotate-180" />
      <span class="hidden sm:block">{props.text ?? "Previous"}</span>
    </PaginationLink>
  )
}

function PaginationNext(props: PaginationPreviousProps) {
  const rest = omit(props, "class", "text")
  return (
    <PaginationLink aria-label="Go to next page" size="default" class={cn("pr-2!", props.class)} {...rest}>
      <span class="hidden sm:block">{props.text ?? "Next"}</span>
      <Icon icon={ChevronRight} data-icon="inline-end" class="rtl:rotate-180" />
    </PaginationLink>
  )
}

function PaginationEllipsis(props: Omit<JSX.IntrinsicElements["span"], "class"> & { class?: string }) {
  const rest = omit(props, "class")
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      class={cn("flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4", props.class)}
      {...rest}
    >
      <Icon icon={Ellipsis} />
      <span class="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  type PaginationLinkProps,
}
