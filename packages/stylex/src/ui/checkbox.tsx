import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Checkbox as CheckboxPrimitive } from "base-ui-solidjs/checkbox"
import { Check } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors } from "../tokens.stylex"
import { cx } from "../lib/utils"

// Field conditions (`group-has-disabled/field:`, `group-has-[:focus-visible]/field-label:`) are
// ancestor conditions on the field parts' `stylex.defaultMarker()`.
const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const invalidRing = `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`

const styles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
      ":is([aria-invalid=true])": `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`,
      [stylex.when.ancestor(":has(:focus-visible)")]: colors.input,
    },
    backgroundColor: {
      default: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
      ":is([data-checked])": colors.primary,
    },
    color: { default: null, ":is([data-checked])": colors.primaryForeground },
    boxShadow: {
      default: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      ":focus-visible": focusRing,
      ":is([aria-invalid=true])": invalidRing,
      [stylex.when.ancestor(":has(:focus-visible)")]: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    },
    transitionProperty: "box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    cursor: { default: null, ":is([data-disabled])": "not-allowed" },
    opacity: { default: null, ":is([data-disabled])": 0.5, [stylex.when.ancestor(":has(:disabled)")]: 0.5 },
    "::after": {
      content: '""',
      position: "absolute",
      insetInline: "-0.75rem",
      insetBlock: "-0.5rem",
    },
  },
  // `data-checked:border-primary`, which also wins over the invalid and focused-field-label borders.
  checked: {
    borderColor: { default: colors.primary, ":focus-visible": colors.ring },
  },
  indicator: {
    display: "grid",
    placeContent: "center",
    color: "currentColor",
    transitionProperty: "none",
  },
})

type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function Checkbox(props: CheckboxProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      {...rest}
      class={(state) =>
        cx(
          stylex.attrs(stylex.defaultMarker(), styles.root, state.checked && styles.checked, props.xstyle)
            .class,
          props.class,
        )
      }
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" {...stylex.attrs(styles.indicator)}>
        <Icon icon={Check} size={14} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, type CheckboxProps }
