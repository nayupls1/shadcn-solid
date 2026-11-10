import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { ChevronRight, Ellipsis } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

type BreadcrumbProps = Omit<JSX.IntrinsicElements["nav"], "class"> & { class?: string }

function Breadcrumb(props: BreadcrumbProps) {
  const rest = omit(props, "class")
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" class={cn(props.class)} {...rest} />
}

type BreadcrumbListProps = Omit<JSX.IntrinsicElements["ol"], "class"> & { class?: string }

function BreadcrumbList(props: BreadcrumbListProps) {
  const rest = omit(props, "class")
  return (
    <ol
      data-slot="breadcrumb-list"
      class={cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground sm:gap-2.5",
        props.class,
      )}
      {...rest}
    />
  )
}

type BreadcrumbItemProps = Omit<JSX.IntrinsicElements["li"], "class"> & { class?: string }

function BreadcrumbItem(props: BreadcrumbItemProps) {
  const rest = omit(props, "class")
  return <li data-slot="breadcrumb-item" class={cn("inline-flex items-center gap-1.5", props.class)} {...rest} />
}

type BreadcrumbLinkProps = Omit<useRender.ComponentProps<"a">, "class"> & { class?: string }

function BreadcrumbLink(props: BreadcrumbLinkProps) {
  const rest = omit(props, "class", "render", "children")
  return useRender({
    defaultTagName: "a",
    get render() {
      return props.render
    },
    get props() {
      return mergeProps<Record<string, unknown>>({ class: cn("transition-colors hover:text-foreground", props.class) }, rest)
    },
    get children() {
      return props.children
    },
    state: { slot: "breadcrumb-link" },
  })
}

type BreadcrumbPageProps = Omit<JSX.IntrinsicElements["span"], "class"> & { class?: string }

function BreadcrumbPage(props: BreadcrumbPageProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      class={cn("font-normal text-foreground", props.class)}
      {...rest}
    />
  )
}

type BreadcrumbSeparatorProps = Omit<JSX.IntrinsicElements["li"], "class"> & { class?: string }

function BreadcrumbSeparator(props: BreadcrumbSeparatorProps) {
  const rest = omit(props, "class", "children")
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      class={cn("[&>svg]:size-3.5", props.class)}
      {...rest}
    >
      {props.children ?? <Icon icon={ChevronRight} class="rtl:rotate-180" />}
    </li>
  )
}

type BreadcrumbEllipsisProps = Omit<JSX.IntrinsicElements["span"], "class"> & { class?: string }

function BreadcrumbEllipsis(props: BreadcrumbEllipsisProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      class={cn("flex size-5 items-center justify-center [&>svg]:size-4", props.class)}
      {...rest}
    >
      <Icon icon={Ellipsis} />
      <span class="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  type BreadcrumbProps,
  type BreadcrumbListProps,
  type BreadcrumbItemProps,
  type BreadcrumbLinkProps,
  type BreadcrumbPageProps,
  type BreadcrumbSeparatorProps,
  type BreadcrumbEllipsisProps,
}
