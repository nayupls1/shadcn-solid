import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `label` (see the Tailwind variant for the source classes).
// `group-data-[disabled=true]:*` (an ancestor `.group` with data-disabled) and `peer-disabled:*`
// (a preceding disabled `.peer`) refer to arbitrary elements of the consumer's markup, which StyleX
// can't target without markers on them. Inside a `Field`, `FieldLabel` dims itself from the field's
// marker instead; elsewhere pass `xstyle` for the disabled look.
const styles = stylex.create({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: 1,
    fontWeight: 500,
    userSelect: "none",
  },
})

type LabelProps = Omit<ComponentProps<"label">, "class"> & { class?: string; xstyle?: stylex.StyleXStyles }

function Label(props: LabelProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.base, props.xstyle)
  return <label data-slot="label" {...rest} class={cx(attrs().class, props.class)} />
}

export { Label, type LabelProps }
