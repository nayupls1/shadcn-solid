import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { cx } from "../lib/utils"

// `group-data-[disabled=true]:` and `peer-disabled:` become `stylex.when` conditions on an element
// carrying `stylex.defaultMarker()` (the StyleX field and checkbox parts add it).

const styles = stylex.create({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: 1,
    fontWeight: 500,
    userSelect: "none",
    pointerEvents: { default: null, [stylex.when.ancestor(":is([data-disabled=true])")]: "none" },
    opacity: { default: null, [stylex.when.ancestor(":is([data-disabled=true])")]: 0.5, [stylex.when.siblingBefore(":disabled")]: 0.5 },
    cursor: { default: null, [stylex.when.siblingBefore(":disabled")]: "not-allowed" },
  },
})

type LabelProps = Omit<JSX.IntrinsicElements["label"], "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function Label(props: LabelProps) {
  const rest = omit(props, "class", "xstyle")
  return <label data-slot="label" {...rest} class={cx(stylex.attrs(styles.base, props.xstyle).class, props.class)} />
}

export { Label, type LabelProps }
