import { createSignal, omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { OTPField } from "base-ui-solidjs/otp-field"
import { Minus } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"

// Port of shadcn/ui's base-vega `input-otp` (see the Tailwind variant for the source classes and
// for how shadcn's input-otp API maps onto Base UI's OTP Field).
const shadowXs = "0 1px 2px 0 rgb(0 0 0 / 0.05)"
const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const invalidRing = `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`

const styles = stylex.create({
  root: {
    display: "flex",
    alignItems: "center",
    opacity: { default: null, ":has(:disabled)": 0.5 },
  },
  group: {
    display: "flex",
    alignItems: "center",
    borderRadius: radius.md,
    borderColor: { default: null, ":has([aria-invalid=true])": colors.destructive },
    boxShadow: { default: null, ":has([aria-invalid=true])": invalidRing },
  },
  slot: {
    position: "relative",
    display: "flex",
    width: "2.25rem",
    height: "2.25rem",
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    borderTopWidth: "1px",
    borderBottomWidth: "1px",
    borderRightWidth: "1px",
    borderLeftWidth: { default: 0, ":first-child": "1px" },
    borderColor: {
      default: colors.input,
      ":is([data-active=true]):not([aria-invalid=true])": colors.ring,
      ":is([aria-invalid=true])": colors.destructive,
    },
    borderTopLeftRadius: { default: null, ":first-child": radius.md },
    borderBottomLeftRadius: { default: null, ":first-child": radius.md },
    borderTopRightRadius: { default: null, ":last-child": radius.md },
    borderBottomRightRadius: { default: null, ":last-child": radius.md },
    backgroundColor: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    textAlign: "center",
    boxShadow: {
      default: shadowXs,
      ":is([data-active=true]):not([aria-invalid=true])": `${focusRing}, ${shadowXs}`,
      ":is([data-active=true][aria-invalid=true])": `${invalidRing}, ${shadowXs}`,
    },
    zIndex: { default: null, ":is([data-active=true])": 10 },
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    cursor: { default: null, ":disabled": "not-allowed" },
  },
  separator: { display: "flex", alignItems: "center" },
})

type XStyle = {
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

type InputOTPProps = Omit<OTPField.Root.Props, "class" | "length" | "onValueChange"> &
  XStyle & {
    /** The number of slots (`input-otp`'s name for Base UI's `length`). */
    maxLength: number
    /** Classes for the container (`input-otp`'s `containerClassName`). */
    containerClass?: string
    class?: string
    /** Called with the new value (`input-otp`'s `onChange`). */
    onChange?: (value: string) => void
    /** Called when every slot is filled (`input-otp`'s `onComplete`). */
    onComplete?: (value: string) => void
    onValueChange?: OTPField.Root.Props["onValueChange"]
  }

function InputOTP(props: InputOTPProps) {
  const rest = omit(
    props,
    "class",
    "style",
    "containerClass",
    "maxLength",
    "onChange",
    "onComplete",
    "onValueChange",
    "xstyle",
  )
  const attrs = () => stylex.attrs(styles.root, props.xstyle)
  return (
    <OTPField.Root
      data-slot="input-otp"
      length={props.maxLength}
      validationType="none"
      inputMode="numeric"
      onValueChange={(value, details) => {
        props.onChange?.(value)
        props.onValueChange?.(value, details)
      }}
      onValueComplete={(value, details) => {
        props.onComplete?.(value)
        props.onValueComplete?.(value, details)
      }}
      {...rest}
      class={cx(attrs().class, props.containerClass, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style"> &
  XStyle & { class?: string; style?: JSX.CSSProperties | string }

function InputOTPGroup(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.group, props.xstyle)
  return (
    <div
      data-slot="input-otp-group"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type InputOTPSlotProps = Omit<OTPField.Input.Props, "class"> &
  XStyle & {
    /** The slot's position, kept for shadcn's API; Base UI orders slots by their position in the DOM. */
    index: number
    class?: string
  }

function InputOTPSlot(props: InputOTPSlotProps) {
  const rest = omit(props, "class", "style", "index", "onFocus", "onBlur", "xstyle")
  const [active, setActive] = createSignal(false)
  const attrs = () => stylex.attrs(styles.slot, props.xstyle)
  return (
    <OTPField.Input
      data-slot="input-otp-slot"
      data-active={String(active())}
      onFocus={(e) => {
        setActive(true)
        if (typeof props.onFocus === "function") props.onFocus(e)
      }}
      onBlur={(e) => {
        setActive(false)
        if (typeof props.onBlur === "function") props.onBlur(e)
      }}
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

function InputOTPSeparator(props: Omit<JSX.HTMLAttributes<HTMLDivElement>, "class">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props} {...stylex.attrs(styles.separator)}>
      <Icon icon={Minus} />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
