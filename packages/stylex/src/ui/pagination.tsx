import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cx } from "../lib/utils"
import { Button, type ButtonSize } from "./button"

// Port of shadcn/ui's base-vega `pagination` (see the Tailwind variant for the source classes).
const styles = stylex.create({
  nav: { marginInline: "auto", display: "flex", width: "100%", justifyContent: "center" },
  content: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    // Tailwind's preflight resets lists.
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  // `pl-2!` / `pr-2!`
  previous: { paddingLeft: "0.5rem" },
  next: { paddingRight: "0.5rem" },
  // `hidden sm:block`
  text: { display: { default: "none", "@media (min-width: 40rem)": "block" } },
  // shadcn's `cn-rtl-flip`: mirrors the chevrons in right-to-left layouts.
  rtlFlip: { transform: { default: null, ":dir(rtl)": "rotate(180deg)" } },
  ellipsis: {
    display: "flex",
    width: "2.25rem",
    height: "2.25rem",
    alignItems: "center",
    justifyContent: "center",
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
})

type XProps = {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function Pagination(props: Omit<JSX.IntrinsicElements["nav"], "class"> & XProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      {...rest}
      class={cx(stylex.attrs(styles.nav, props.xstyle).class, props.class)}
    />
  )
}

function PaginationContent(props: Omit<JSX.IntrinsicElements["ul"], "class"> & XProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <ul
      data-slot="pagination-content"
      {...rest}
      class={cx(stylex.attrs(styles.content, props.xstyle).class, props.class)}
    />
  )
}

function PaginationItem(props: JSX.IntrinsicElements["li"]) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  size?: ButtonSize | null
} & XProps &
  Omit<JSX.IntrinsicElements["a"], "class">

function PaginationLink(props: PaginationLinkProps) {
  const rest = omit(props, "class", "isActive", "size", "xstyle")
  return (
    <Button
      variant={props.isActive ? "outline" : "ghost"}
      size={props.size ?? "icon"}
      class={props.class}
      xstyle={props.xstyle}
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
  const rest = omit(props, "xstyle", "text")
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      {...rest}
      xstyle={[styles.previous, props.xstyle]}
    >
      <Icon icon={ChevronLeft} data-icon="inline-start" {...stylex.attrs(styles.rtlFlip)} />
      <span {...stylex.attrs(styles.text)}>{props.text ?? "Previous"}</span>
    </PaginationLink>
  )
}

function PaginationNext(props: PaginationPreviousProps) {
  const rest = omit(props, "xstyle", "text")
  return (
    <PaginationLink aria-label="Go to next page" size="default" {...rest} xstyle={[styles.next, props.xstyle]}>
      <span {...stylex.attrs(styles.text)}>{props.text ?? "Next"}</span>
      <Icon icon={ChevronRight} data-icon="inline-end" {...stylex.attrs(styles.rtlFlip)} />
    </PaginationLink>
  )
}

function PaginationEllipsis(props: Omit<JSX.IntrinsicElements["span"], "class"> & XProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      {...rest}
      class={cx(stylex.attrs(styles.ellipsis, props.xstyle).class, props.class)}
    >
      <Icon icon={Ellipsis} />
      <span {...stylex.attrs(styles.srOnly)}>More pages</span>
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
