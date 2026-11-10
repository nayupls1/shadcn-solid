import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "../tokens.stylex"
import { animate } from "../lib/animate"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `skeleton` (see the Tailwind variant for the source classes).
const styles = stylex.create({
  base: {
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },
})

type SkeletonProps = Omit<ComponentProps<"div">, "class"> & { class?: string; xstyle?: stylex.StyleXStyles }

function Skeleton(props: SkeletonProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(animate.pulse, styles.base, props.xstyle)
  return <div data-slot="skeleton" {...rest} class={cx(attrs().class, props.class)} />
}

export { Skeleton, type SkeletonProps }
