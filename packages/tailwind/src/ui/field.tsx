import { children as resolveChildren, createMemo, For, omit, Show } from "solid-js"
import type { JSX } from "@solidjs/web"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Label, type LabelProps } from "./label"
import { Separator } from "./separator"

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & { class?: string }

type FieldSetProps = Omit<JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>, "class"> & { class?: string }

function FieldSet(props: FieldSetProps) {
  const rest = omit(props, "class")
  return (
    <fieldset
      data-slot="field-set"
      class={cn(
        "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        props.class
      )}
      {...rest}
    />
  )
}

type FieldLegendProps = Omit<JSX.HTMLAttributes<HTMLLegendElement>, "class"> & {
  class?: string
  variant?: "legend" | "label"
}

function FieldLegend(props: FieldLegendProps) {
  const rest = omit(props, "class", "variant")
  return (
    <legend
      data-slot="field-legend"
      data-variant={props.variant ?? "legend"}
      class={cn("mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base", props.class)}
      {...rest}
    />
  )
}

function FieldGroup(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="field-group"
      class={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        props.class
      )}
      {...rest}
    />
  )
}

const fieldVariants = cva("group/field flex w-full gap-3 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

type FieldProps = DivProps & VariantProps<typeof fieldVariants>

function Field(props: FieldProps) {
  const rest = omit(props, "class", "orientation")
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={props.orientation ?? "vertical"}
      class={cn(fieldVariants({ orientation: props.orientation ?? "vertical" }), props.class)}
      {...rest}
    />
  )
}

function FieldContent(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="field-content"
      class={cn("group/field-content flex flex-1 flex-col gap-1 leading-snug", props.class)}
      {...rest}
    />
  )
}

function FieldLabel(props: LabelProps) {
  const rest = omit(props, "class")
  return (
    <Label
      data-slot="field-label"
      class={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-3 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        props.class
      )}
      {...rest}
    />
  )
}

function FieldTitle(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="field-label"
      class={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        props.class
      )}
      {...rest}
    />
  )
}

type FieldDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class"> & { class?: string }

function FieldDescription(props: FieldDescriptionProps) {
  const rest = omit(props, "class")
  return (
    <p
      data-slot="field-description"
      class={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        props.class
      )}
      {...rest}
    />
  )
}

function FieldSeparator(props: DivProps) {
  const rest = omit(props, "class", "children")
  const content = resolveChildren(() => props.children)
  return (
    <div
      data-slot="field-separator"
      data-content={!!content()}
      class={cn("relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2", props.class)}
      {...rest}
    >
      <Separator class="absolute inset-0 top-1/2" />
      <Show when={content()}>
        <span
          class="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {content()}
        </span>
      </Show>
    </div>
  )
}

type FieldErrorProps = DivProps & {
  errors?: Array<{ message?: string } | undefined>
}

function FieldError(props: FieldErrorProps) {
  const rest = omit(props, "class", "children", "errors")
  const resolved = resolveChildren(() => props.children)
  const uniqueErrors = createMemo(() => [...new Map((props.errors ?? []).map((error) => [error?.message, error])).values()])
  const content = createMemo((): JSX.Element => {
    const children = resolved()
    if (children) return children
    if (!props.errors?.length) return null
    const errors = uniqueErrors()
    if (errors.length == 1) return errors[0]?.message
    return (
      <ul class="ml-4 flex list-disc flex-col gap-1">
        <For each={errors}>{(error) => (error?.message ? <li>{error.message}</li> : null)}</For>
      </ul>
    )
  })

  return (
    <Show when={content()}>
      <div role="alert" data-slot="field-error" class={cn("text-sm font-normal text-destructive", props.class)} {...rest}>
        {content()}
      </div>
    </Show>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
