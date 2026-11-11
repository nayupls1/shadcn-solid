import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { cn } from "../lib/utils"

type SkeletonProps = Omit<JSX.IntrinsicElements["div"], "class"> & { class?: string }

function Skeleton(props: SkeletonProps) {
  const rest = omit(props, "class")
  return <div data-slot="skeleton" class={cn("animate-pulse rounded-md bg-muted", props.class)} {...rest} />
}

export { Skeleton, type SkeletonProps }
