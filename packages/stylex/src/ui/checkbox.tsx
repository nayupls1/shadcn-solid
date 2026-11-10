import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Checkbox as CheckboxPrimitive } from "base-ui-solidjs/checkbox"
import { Check } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors } from "../tokens.stylex"
import { fieldLabelMarker, fieldMarker, peerMarker } from "../lib/markers.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"

// Port of shadcn/ui's base-vega `checkbox` (see the Tailwind variant for the source classes).
// `data-checked` wins over `aria-invalid`, which wins over `focus-visible`, as in Tailwind.
// Inside a focused `FieldLabel` card the card draws the ring, so the checkbox drops its own.
const shadowXs = "0 1px 2px 0 rgb(0 0 0 / 0.05)"
const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const invalidRing = `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`
const invalidBorder = `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`

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
      default: shadowXs,
      ":focus-visible:not([aria-invalid=true])": { default: `${focusRing}, ${shadowXs}`, [stylex.when.ancestor(":has(:focus-visible)", fieldLabelMarker)]: shadowXs },
      ":is([aria-invalid=true])": `${invalidRing}, ${shadowXs}`,
    },
    // Field's `has-[>[data-slot=field-content]]:[&>[role=checkbox]]:mt-px` (horizontal/responsive).
    marginTop: {
      default: null,
      ":is([data-slot=field][data-orientation=horizontal]:has(> [data-slot=field-content]) > *)": "1px",
      "@container field-group (min-width: 28rem)": {
        default: null,
        ":is([data-slot=field][data-orientation=horizontal]:has(> [data-slot=field-content]) > *)": "1px",
        ":is([data-slot=field][data-orientation=responsive]:has(> [data-slot=field-content]) > *)": "1px",
      },
    },
    transitionProperty: "box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    cursor: { default: null, ":disabled": "not-allowed" },
    opacity: {
      default: null,
      ":disabled": 0.5,
      [stylex.when.ancestor(":has(:disabled)", fieldMarker)]: 0.5,
    },
    "::after": {
      content: '""',
      position: "absolute",
      insetInline: "-0.75rem",
      insetBlock: "-0.5rem",
    },
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
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(peerMarker, styles.root, props.xstyle)
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" {...stylex.attrs(styles.indicator)}>
        <Icon icon={Check} size={14} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, type CheckboxProps }
