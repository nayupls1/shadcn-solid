import { createSignal, omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { OTPField } from "base-ui-solidjs/otp-field"
import { Minus } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

// shadcn's input-otp API on Base UI's OTP Field. `input-otp` renders one hidden input under
// fake slots; Base UI renders one real input per slot, so each `InputOTPSlot` is an input (the
// browser draws the caret) and slots are matched to characters by their order, not `index`.

type InputOTPProps = Omit<OTPField.Root.Props, "class" | "length" | "onValueChange"> & {
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
  const rest = omit(props, "class", "containerClass", "maxLength", "onChange", "onComplete", "onValueChange")
  return (
    <OTPField.Root
      data-slot="input-otp"
      length={props.maxLength}
      validationType="none"
      inputMode="numeric"
      class={cn("cn-input-otp flex items-center has-disabled:opacity-50", props.containerClass, props.class)}
      onValueChange={(value, details) => {
        props.onChange?.(value)
        props.onValueChange?.(value, details)
      }}
      onValueComplete={(value, details) => {
        props.onComplete?.(value)
        props.onValueComplete?.(value, details)
      }}
      {...rest}
    />
  )
}

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & { class?: string }

function InputOTPGroup(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="input-otp-group"
      class={cn(
        "flex items-center rounded-md has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        props.class
      )}
      {...rest}
    />
  )
}

type InputOTPSlotProps = Omit<OTPField.Input.Props, "class"> & {
  /** The slot's position, kept for shadcn's API; Base UI orders slots by their position in the DOM. */
  index: number
  class?: string
}

function InputOTPSlot(props: InputOTPSlotProps) {
  const rest = omit(props, "class", "index", "onFocus", "onBlur")
  const [active, setActive] = createSignal(false)
  return (
    <OTPField.Input
      data-slot="input-otp-slot"
      data-active={String(active())}
      class={cn(
        "relative flex size-9 items-center justify-center border-y border-r border-input text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        "text-center disabled:cursor-not-allowed",
        props.class
      )}
      onFocus={(e) => {
        setActive(true)
        if (typeof props.onFocus === "function") props.onFocus(e)
      }}
      onBlur={(e) => {
        setActive(false)
        if (typeof props.onBlur === "function") props.onBlur(e)
      }}
      {...rest}
    />
  )
}

function InputOTPSeparator(props: Omit<JSX.HTMLAttributes<HTMLDivElement>, "class">) {
  return (
    <div
      data-slot="input-otp-separator"
      class="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <Icon icon={Minus} />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
