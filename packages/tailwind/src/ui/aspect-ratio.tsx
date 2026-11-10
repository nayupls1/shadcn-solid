import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { cn } from "../lib/utils"

type AspectRatioProps = Omit<JSX.IntrinsicElements["div"], "class" | "style"> & {
  ratio: number
  class?: string
  style?: JSX.CSSProperties
}

function AspectRatio(props: AspectRatioProps) {
  const rest = omit(props, "class", "style", "ratio")
  return (
    <div
      data-slot="aspect-ratio"
      style={{ "--ratio": props.ratio, ...props.style }}
      class={cn("relative aspect-(--ratio)", props.class)}
      {...rest}
    />
  )
}

export { AspectRatio, type AspectRatioProps }
