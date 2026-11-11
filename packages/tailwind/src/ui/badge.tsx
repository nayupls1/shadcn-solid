import { omit } from "solid-js"
import { mergeProps } from "base-ui-solidjs/merge-props"
import { useRender } from "base-ui-solidjs/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type BadgeProps = Omit<useRender.ComponentProps<"span">, "class"> &
  VariantProps<typeof badgeVariants> & { class?: string }

function Badge(props: BadgeProps) {
  const rest = omit(props, "class", "variant", "render", "children")
  return useRender({
    defaultTagName: "span",
    get render() {
      return props.render
    },
    get props() {
      return mergeProps<Record<string, unknown>>(
        { class: cn(badgeVariants({ variant: props.variant ?? "default" }), props.class) },
        rest,
      )
    },
    get children() {
      return props.children
    },
    state: () => ({ slot: "badge", variant: props.variant ?? "default" }),
  })
}

export { Badge, badgeVariants, type BadgeProps }
