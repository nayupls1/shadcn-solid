import { omit } from "solid-js"
import { LoaderCircle } from "lucide"
import { Icon, type IconProps } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

type SpinnerProps = Omit<IconProps, "icon" | "class"> & { class?: string }

function Spinner(props: SpinnerProps) {
  const rest = omit(props, "class")
  return (
    <Icon
      icon={LoaderCircle}
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      aria-hidden={undefined}
      class={cn("size-4 animate-spin", props.class)}
      {...rest}
    />
  )
}

export { Spinner, type SpinnerProps }
