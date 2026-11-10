import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type DivProps = Omit<JSX.IntrinsicElements["div"], "class"> & { class?: string }
type AlertProps = DivProps & VariantProps<typeof alertVariants>

function Alert(props: AlertProps) {
  const rest = omit(props, "class", "variant")
  return (
    <div
      data-slot="alert"
      role="alert"
      class={cn(alertVariants({ variant: props.variant }), props.class)}
      {...rest}
    />
  )
}

function AlertTitle(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="alert-title"
      class={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        props.class,
      )}
      {...rest}
    />
  )
}

function AlertDescription(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="alert-description"
      class={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        props.class,
      )}
      {...rest}
    />
  )
}

function AlertAction(props: DivProps) {
  const rest = omit(props, "class")
  return <div data-slot="alert-action" class={cn("absolute top-2.5 right-3", props.class)} {...rest} />
}

export { Alert, AlertTitle, AlertDescription, AlertAction, type AlertProps }
