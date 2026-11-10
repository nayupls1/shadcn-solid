import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Radio as RadioPrimitive } from "base-ui-solidjs/radio"
import { RadioGroup as RadioGroupPrimitive } from "base-ui-solidjs/radio-group"
import { colors } from "../tokens.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `radio-group` (see the Tailwind variant for the source classes).
// `group-has-[:focus-visible]/field-label:*` (inside a choice-card FieldLabel the label shows the focus
// ring, not the radio) → `:is([data-slot=field-label]:has(:focus-visible) *)` conditions on the item.

const IN_FOCUSED_LABEL = ":is([data-slot=field-label]:has(:focus-visible) *)"
const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const invalidRing = `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`

const styles = stylex.create({
  group: {
    display: "grid",
    width: "100%",
    gap: "0.75rem",
  },
  item: {
    position: "relative",
    display: "flex",
    aspectRatio: "1 / 1",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    borderRadius: "9999px",
    borderWidth: "1px",
    borderStyle: "solid",
    padding: 0,
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
      ":is([aria-invalid=true])": `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`,
      [IN_FOCUSED_LABEL]: colors.input,
      ":is([data-checked])": colors.primary,
    },
    backgroundColor: {
      default: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
      ":is([data-checked])": colors.primary,
    },
    color: { default: null, ":is([data-checked])": colors.primaryForeground },
    outlineStyle: "none",
    boxShadow: {
      default: null,
      ":focus-visible": focusRing,
      ":is([aria-invalid=true])": invalidRing,
      [IN_FOCUSED_LABEL]: "none",
    },
    cursor: { default: null, ":disabled": "not-allowed", ":is([data-disabled])": "not-allowed" },
    opacity: { default: null, ":disabled": 0.5, ":is([data-disabled])": 0.5 },
    "::after": {
      content: '""',
      position: "absolute",
      left: "-0.75rem",
      right: "-0.75rem",
      top: "-0.5rem",
      bottom: "-0.5rem",
    },
  },
  indicator: {
    display: "flex",
    width: "1rem",
    height: "1rem",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "0.5rem",
    height: "0.5rem",
    translate: "-50% -50%",
    borderRadius: "9999px",
    backgroundColor: colors.primaryForeground,
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type RadioGroupProps = Omit<RadioGroupPrimitive.Props, "class"> & XStyle

function RadioGroup(props: RadioGroupProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.group, props.xstyle)
  return <RadioGroupPrimitive data-slot="radio-group" {...rest} class={cx(attrs().class, props.class)} />
}

type RadioGroupItemProps = Omit<RadioPrimitive.Root.Props, "class"> & XStyle

function RadioGroupItem(props: RadioGroupItemProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.item, props.xstyle)
  return (
    <RadioPrimitive.Root data-slot="radio-group-item" {...rest} class={cx(attrs().class, props.class)}>
      <RadioPrimitive.Indicator data-slot="radio-group-indicator" class={stylex.attrs(styles.indicator).class}>
        <span {...stylex.attrs(styles.dot)} />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
