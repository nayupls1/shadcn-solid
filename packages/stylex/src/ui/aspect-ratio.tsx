import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { cx } from "../lib/utils"

const styles = stylex.create({
  base: { position: "relative", aspectRatio: "var(--ratio)" },
})

type AspectRatioProps = Omit<JSX.IntrinsicElements["div"], "class" | "style"> & {
  ratio: number
  class?: string
  style?: JSX.CSSProperties
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function AspectRatio(props: AspectRatioProps) {
  const rest = omit(props, "class", "style", "ratio", "xstyle")
  return (
    <div
      data-slot="aspect-ratio"
      {...rest}
      style={{ "--ratio": props.ratio, ...props.style }}
      class={cx(stylex.attrs(styles.base, props.xstyle).class, props.class)}
    />
  )
}

export { AspectRatio, type AspectRatioProps }
