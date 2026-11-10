import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { LoaderCircle } from "lucide"
import { Icon, type IconProps } from "@shadcn-solid/icons"
import { cx } from "../lib/utils"

// Tailwind's `animate-spin`.
const spin = stylex.keyframes({
  to: { transform: "rotate(360deg)" },
})

const styles = stylex.create({
  base: {
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
  const rest = omit(props, "class", "xstyle")
  return (
    <Icon
      icon={LoaderCircle}
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      aria-hidden={undefined}
      {...rest}
      class={cx(stylex.attrs(styles.base, props.xstyle).class, props.class)}
    />
  )
}

export { Spinner, type SpinnerProps }
