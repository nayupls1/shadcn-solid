import { omit } from "solid-js"
import { Progress as ProgressPrimitive } from "base-ui-solidjs/progress"
import { cn } from "../lib/utils"

type ProgressProps = Omit<ProgressPrimitive.Root.Props, "class"> & { class?: string }

function Progress(props: ProgressProps) {
  const rest = omit(props, "class", "children", "value")
  return (
    <ProgressPrimitive.Root
      value={props.value}
      data-slot="progress"
      class={cn("flex flex-wrap gap-3", props.class)}
      {...rest}
    >
      {props.children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

type ProgressTrackProps = Omit<ProgressPrimitive.Track.Props, "class"> & { class?: string }

function ProgressTrack(props: ProgressTrackProps) {
  const rest = omit(props, "class")
  return (
    <ProgressPrimitive.Track
      class={cn("relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted", props.class)}
      data-slot="progress-track"
      {...rest}
    />
  )
}

type ProgressIndicatorProps = Omit<ProgressPrimitive.Indicator.Props, "class"> & { class?: string }

function ProgressIndicator(props: ProgressIndicatorProps) {
  const rest = omit(props, "class")
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      class={cn("h-full bg-primary transition-all", props.class)}
      {...rest}
    />
  )
}

type ProgressLabelProps = Omit<ProgressPrimitive.Label.Props, "class"> & { class?: string }

function ProgressLabel(props: ProgressLabelProps) {
  const rest = omit(props, "class")
  return (
    <ProgressPrimitive.Label class={cn("text-sm font-medium", props.class)} data-slot="progress-label" {...rest} />
  )
}

type ProgressValueProps = Omit<ProgressPrimitive.Value.Props, "class"> & { class?: string }

function ProgressValue(props: ProgressValueProps) {
  const rest = omit(props, "class")
  return (
    <ProgressPrimitive.Value
      class={cn("ml-auto text-sm text-muted-foreground tabular-nums", props.class)}
      data-slot="progress-value"
      {...rest}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
  type ProgressProps,
  type ProgressTrackProps,
  type ProgressIndicatorProps,
  type ProgressLabelProps,
  type ProgressValueProps,
}
