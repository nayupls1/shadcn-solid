import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { ChevronDown } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"

// Port of shadcn/ui's base-vega `native-select` (see the Tailwind variant for the source classes).
const shadowXs = "0 1px 2px 0 rgb(0 0 0 / 0.05)"
const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const invalidRing = `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`
const invalidBorder = `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`

const styles = stylex.create({
  wrapper: {
    position: "relative",
    // `w-fit`, plus a Field's `*:w-full` (vertical; responsive below its `@md`).
    width: {
      default: "fit-content",
      ":is([data-slot=field][data-orientation=vertical] > *)": "100%",
      ":is([data-slot=field][data-orientation=responsive] > *)": "100%",
      "@container field-group (min-width: 28rem)": {
        default: "fit-content",
        ":is([data-slot=field][data-orientation=vertical] > *)": "100%",
        ":is([data-slot=field][data-orientation=responsive] > *)": "auto",
      },
    },
    opacity: { default: null, ":has(select:disabled)": 0.5 },
  },
  select: {
    height: "2.25rem",
    width: "100%",
    minWidth: 0,
    appearance: "none",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: colors.input,
      ":focus-visible:not([aria-invalid=true])": colors.ring,
      ":is([aria-invalid=true])": invalidBorder,
    },
    backgroundColor: {
      default: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
      ":hover": `light-dark(transparent, color-mix(in oklch, ${colors.input} 50%, transparent))`,
    },
    paddingBlock: "0.25rem",
    paddingRight: "2rem",
    paddingLeft: "0.625rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: "inherit",
    boxShadow: {
      default: shadowXs,
      ":focus-visible:not([aria-invalid=true])": `${focusRing}, ${shadowXs}`,
      ":is([aria-invalid=true])": `${invalidRing}, ${shadowXs}`,
    },
    transitionProperty: "color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    userSelect: "none",
    pointerEvents: { default: null, ":disabled": "none" },
    cursor: { default: null, ":disabled": "not-allowed" },
    "::selection": { backgroundColor: colors.primary, color: colors.primaryForeground },
    "::placeholder": { color: colors.mutedForeground },
  },
  selectSm: { height: "2rem" },
  icon: {
    pointerEvents: "none",
    position: "absolute",
    top: "50%",
    right: "0.625rem",
    width: "1rem",
    height: "1rem",
    transform: "translateY(-50%)",
    color: colors.mutedForeground,
    userSelect: "none",
  },
  option: { backgroundColor: "Canvas", color: "CanvasText" },
})

type NativeSelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "size" | "class" | "style"> & {
  class?: string
  style?: JSX.CSSProperties | string
  size?: "sm" | "default"
  /** StyleX overrides for the wrapper, merged last (like `class`, which also goes on the wrapper). */
  xstyle?: stylex.StyleXStyles
}

function NativeSelect(props: NativeSelectProps) {
  const rest = omit(props, "class", "style", "size", "xstyle")
  const size = () => props.size ?? "default"
  const sm = () => size() === "sm"
  const attrs = () => stylex.attrs(styles.wrapper, props.xstyle)
  return (
    <div
      data-slot="native-select-wrapper"
      data-size={size()}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      <select
        data-slot="native-select"
        data-size={size()}
        {...rest}
        {...stylex.attrs(styles.select, sm() && styles.selectSm)}
      />
      <Icon icon={ChevronDown} aria-hidden="true" data-slot="native-select-icon" {...stylex.attrs(styles.icon)} />
    </div>
  )
}

type NativeSelectOptionProps = Omit<JSX.OptionHTMLAttributes<HTMLOptionElement>, "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function NativeSelectOption(props: NativeSelectOptionProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <option
      data-slot="native-select-option"
      {...rest}
      class={cx(stylex.attrs(styles.option, props.xstyle).class, props.class)}
    />
  )
}

type NativeSelectOptGroupProps = Omit<JSX.OptgroupHTMLAttributes<HTMLOptGroupElement>, "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function NativeSelectOptGroup(props: NativeSelectOptGroupProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <optgroup
      data-slot="native-select-optgroup"
      {...rest}
      class={cx(stylex.attrs(styles.option, props.xstyle).class, props.class)}
    />
  )
}

export {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  type NativeSelectProps,
  type NativeSelectOptionProps,
  type NativeSelectOptGroupProps,
}
