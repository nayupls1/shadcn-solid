import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Radio as RadioPrimitive } from "base-ui-solidjs/radio"
import { RadioGroup as RadioGroupPrimitive } from "base-ui-solidjs/radio-group"
import { colors } from "../tokens.stylex"
import { fieldLabelMarker, peerMarker } from "../lib/markers.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"

// Port of shadcn/ui's base-vega `radio-group` (see the Tailwind variant for the source classes).
const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const invalidRing = `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`
const invalidBorder = `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`

const styles = stylex.create({
  group: { display: "grid", width: "100%", gap: "0.75rem" },
  item: {
    position: "relative",
    display: "flex",
    aspectRatio: "1 / 1",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    borderRadius: "9999px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: colors.input,
      ":focus-visible:not([aria-invalid=true]):not([data-checked])": { default: colors.ring, [stylex.when.ancestor(":has(:focus-visible)", fieldLabelMarker)]: colors.input },
      ":is([aria-invalid=true]):not([data-checked])": invalidBorder,
      ":is([data-checked])": colors.primary,
    },
    backgroundColor: {
      default: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
      ":is([data-checked])": colors.primary,
    },
    color: { default: null, ":is([data-checked])": colors.primaryForeground },
    boxShadow: {
      default: null,
      ":focus-visible:not([aria-invalid=true])": { default: focusRing, [stylex.when.ancestor(":has(:focus-visible)", fieldLabelMarker)]: "none" },
      ":is([aria-invalid=true])": invalidRing,
    },
    outline: "none",
    cursor: { default: null, ":disabled": "not-allowed" },
    opacity: { default: null, ":disabled": 0.5 },
    "::after": {
      content: '""',
      position: "absolute",
      insetInline: "-0.75rem",
      insetBlock: "-0.5rem",
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
    transform: "translate(-50%, -50%)",
    borderRadius: "9999px",
    backgroundColor: colors.primaryForeground,
  },
})

type RadioGroupProps = Omit<RadioGroupPrimitive.Props, "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function RadioGroup(props: RadioGroupProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.group, props.xstyle)
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type RadioGroupItemProps = Omit<RadioPrimitive.Root.Props, "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function RadioGroupItem(props: RadioGroupItemProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(peerMarker, styles.item, props.xstyle)
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      <RadioPrimitive.Indicator data-slot="radio-group-indicator" {...stylex.attrs(styles.indicator)}>
        <span {...stylex.attrs(styles.dot)} />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem, type RadioGroupProps, type RadioGroupItemProps }
