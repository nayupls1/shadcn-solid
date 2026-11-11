import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { cn } from "../lib/utils"

type Props<T extends keyof JSX.IntrinsicElements> = Omit<JSX.IntrinsicElements[T], "class"> & { class?: string }

function Table(props: Props<"table">) {
  const rest = omit(props, "class")
  return (
    <div data-slot="table-container" class="relative w-full overflow-x-auto">
      <table data-slot="table" class={cn("w-full caption-bottom text-sm", props.class)} {...rest} />
    </div>
  )
}

function TableHeader(props: Props<"thead">) {
  const rest = omit(props, "class")
  return <thead data-slot="table-header" class={cn("[&_tr]:border-b", props.class)} {...rest} />
}

function TableBody(props: Props<"tbody">) {
  const rest = omit(props, "class")
  return <tbody data-slot="table-body" class={cn("[&_tr:last-child]:border-0", props.class)} {...rest} />
}

function TableFooter(props: Props<"tfoot">) {
  const rest = omit(props, "class")
  return (
    <tfoot
      data-slot="table-footer"
      class={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", props.class)}
      {...rest}
    />
  )
}

function TableRow(props: Props<"tr">) {
  const rest = omit(props, "class")
  return (
    <tr
      data-slot="table-row"
      class={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        props.class,
      )}
      {...rest}
    />
  )
}

function TableHead(props: Props<"th">) {
  const rest = omit(props, "class")
  return (
    <th
      data-slot="table-head"
      class={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        props.class,
      )}
      {...rest}
    />
  )
}

function TableCell(props: Props<"td">) {
  const rest = omit(props, "class")
  return (
    <td
      data-slot="table-cell"
      class={cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", props.class)}
      {...rest}
    />
  )
}

function TableCaption(props: Props<"caption">) {
  const rest = omit(props, "class")
  return <caption data-slot="table-caption" class={cn("mt-4 text-sm text-muted-foreground", props.class)} {...rest} />
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
