import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { LoaderCircle } from "lucide"
import { Icon, type IconProps } from "@shadcn-solid/icons"
import { sxMerge } from "../lib/sx"

// Port of shadcn/ui's base-vega `spinner`: `size-4 animate-spin`.

const spin = stylex.keyframes({
  to: { transform: "rotate(360deg)" },
})

const styles = stylex.create({
  spinner: {
    width: "1rem",
    height: "1rem",
    animationName: spin,
    animationDuration: "1s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
})

type SpinnerProps = Omit<IconProps, "icon" | "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function Spinner(props: SpinnerProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.spinner, props.xstyle], props.class, props.style)
  return (
    <Icon
      icon={LoaderCircle}
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      aria-hidden={undefined}
      {...rest}
      class={a().class}
      style={a().style}
    />
  )
}

export { Spinner, type SpinnerProps }
