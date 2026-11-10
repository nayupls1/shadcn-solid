import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { ChevronDown } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

type NativeSelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "size" | "class"> & {
  class?: string
  size?: "sm" | "default"
}

function NativeSelect(props: NativeSelectProps) {
  const rest = omit(props, "class", "size")
  const size = () => props.size ?? "default"
  return (
    <div
      class={cn("group/native-select relative w-fit has-[select:disabled]:opacity-50", props.class)}
      data-slot="native-select-wrapper"
      data-size={size()}
    >
      <select
        data-slot="native-select"
        data-size={size()}
        class="h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent py-1 pr-8 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=sm]:h-8 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        {...rest}
      />
      <Icon
        icon={ChevronDown}
        class="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

type NativeSelectOptionProps = Omit<JSX.OptionHTMLAttributes<HTMLOptionElement>, "class"> & { class?: string }

function NativeSelectOption(props: NativeSelectOptionProps) {
  const rest = omit(props, "class")
  return <option data-slot="native-select-option" class={cn("bg-[Canvas] text-[CanvasText]", props.class)} {...rest} />
}

type NativeSelectOptGroupProps = Omit<JSX.OptgroupHTMLAttributes<HTMLOptGroupElement>, "class"> & { class?: string }

function NativeSelectOptGroup(props: NativeSelectOptGroupProps) {
  const rest = omit(props, "class")
  return (
    <optgroup data-slot="native-select-optgroup" class={cn("bg-[Canvas] text-[CanvasText]", props.class)} {...rest} />
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
