import { createContext, omit, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"
import { Toggle as TogglePrimitive } from "base-ui-solidjs/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "base-ui-solidjs/toggle-group"
import type { VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { toggleVariants } from "./toggle"

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  spacing?: number
  orientation?: "horizontal" | "vertical"
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

type ToggleGroupProps = Omit<ToggleGroupPrimitive.Props, "class"> &
  VariantProps<typeof toggleVariants> & {
    class?: string
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }

function ToggleGroup(props: ToggleGroupProps) {
  const rest = omit(props, "class", "variant", "size", "spacing", "orientation", "children", "style")
  const spacing = () => props.spacing ?? 2
  const orientation = () => props.orientation ?? "horizontal"
  // Getters keep the context reactive without destructuring props.
  const context: ToggleGroupContextValue = {
    get variant() {
      return props.variant
    },
    get size() {
      return props.size
    },
    get spacing() {
      return spacing()
    },
    get orientation() {
      return orientation()
    },
  }
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={props.variant}
      data-size={props.size}
      data-spacing={spacing()}
      data-orientation={orientation()}
      orientation={orientation()}
      style={
        typeof props.style === "string"
          ? `--gap:${spacing()};${props.style}`
          : { "--gap": spacing(), ...(props.style as JSX.CSSProperties | undefined) }
      }
      class={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=0]:data-[variant=outline]:shadow-xs data-vertical:flex-col data-vertical:items-stretch",
        props.class
      )}
      {...rest}
    >
      <ToggleGroupContext value={context}>{props.children}</ToggleGroupContext>
    </ToggleGroupPrimitive>
  )
}

type ToggleGroupItemProps = Omit<TogglePrimitive.Props, "class"> & VariantProps<typeof toggleVariants> & { class?: string }

function ToggleGroupItem(props: ToggleGroupItemProps) {
  const rest = omit(props, "class", "variant", "size", "children")
  const context = useContext(ToggleGroupContext)
  const variant = () => context.variant || props.variant || "default"
  const size = () => context.size || props.size || "default"
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={variant()}
      data-size={size()}
      data-spacing={context.spacing}
      class={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-[spacing=0]/toggle-group:shadow-none focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-md group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-md group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-md group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-md data-[state=on]:bg-muted group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({ variant: variant(), size: size() }),
        props.class
      )}
      {...rest}
    >
      {props.children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps, type ToggleGroupItemProps }
