import { omit } from "solid-js"
import { Separator as SeparatorPrimitive } from "base-ui-solidjs/separator"
import { cn } from "../lib/utils"

type SeparatorProps = Omit<SeparatorPrimitive.Props, "class"> & { class?: string }

function Separator(props: SeparatorProps) {
  const rest = omit(props, "class", "orientation")
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={props.orientation ?? "horizontal"}
      class={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        props.class,
      )}
      {...rest}
    />
  )
}

export { Separator, type SeparatorProps }
