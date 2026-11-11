import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Progress as ProgressPrimitive } from "base-ui-solidjs/progress"
import { colors } from "../tokens.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `progress` (see the Tailwind variant for the source classes).
const styles = stylex.create({
  root: { display: "flex", flexWrap: "wrap", gap: "0.75rem" },
  track: {
    position: "relative",
    display: "flex",
    height: "0.375rem",
    width: "100%",
    alignItems: "center",
    overflowX: "hidden",
    borderRadius: "9999px",
    backgroundColor: colors.muted,
  },
  indicator: {
    height: "100%",
    backgroundColor: colors.primary,
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  label: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 500 },
  value: {
    marginLeft: "auto",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
  },
})

type XStyle = {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

type ProgressProps = Omit<ProgressPrimitive.Root.Props, "class"> & XStyle

function Progress(props: ProgressProps) {
  const rest = omit(props, "class", "children", "value", "xstyle")
  return (
    <ProgressPrimitive.Root
      value={props.value}
      data-slot="progress"
      {...rest}
      class={cx(stylex.attrs(styles.root, props.xstyle).class, props.class)}
    >
      {props.children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

type ProgressTrackProps = Omit<ProgressPrimitive.Track.Props, "class"> & XStyle

function ProgressTrack(props: ProgressTrackProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      {...rest}
      class={cx(stylex.attrs(styles.track, props.xstyle).class, props.class)}
    />
  )
}

type ProgressIndicatorProps = Omit<ProgressPrimitive.Indicator.Props, "class"> & XStyle

function ProgressIndicator(props: ProgressIndicatorProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      {...rest}
      class={cx(stylex.attrs(styles.indicator, props.xstyle).class, props.class)}
    />
  )
}

type ProgressLabelProps = Omit<ProgressPrimitive.Label.Props, "class"> & XStyle

function ProgressLabel(props: ProgressLabelProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <ProgressPrimitive.Label
      data-slot="progress-label"
      {...rest}
      class={cx(stylex.attrs(styles.label, props.xstyle).class, props.class)}
    />
  )
}

type ProgressValueProps = Omit<ProgressPrimitive.Value.Props, "class"> & XStyle

function ProgressValue(props: ProgressValueProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      {...rest}
      class={cx(stylex.attrs(styles.value, props.xstyle).class, props.class)}
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
