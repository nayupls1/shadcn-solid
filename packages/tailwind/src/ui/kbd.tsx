import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { cn } from "../lib/utils"

type KbdProps = Omit<JSX.IntrinsicElements["kbd"], "class"> & { class?: string }

function Kbd(props: KbdProps) {
  const rest = omit(props, "class")
  return (
    <kbd
      data-slot="kbd"
      class={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        props.class,
      )}
      {...rest}
    />
  )
}

type KbdGroupProps = Omit<JSX.IntrinsicElements["div"], "class"> & { class?: string }

function KbdGroup(props: KbdGroupProps) {
  const rest = omit(props, "class")
  return (
    <kbd
      data-slot="kbd-group"
      class={cn("inline-flex items-center gap-1", props.class)}
      {...(rest as JSX.IntrinsicElements["kbd"])}
    />
  )
}

export { Kbd, KbdGroup, type KbdProps, type KbdGroupProps }
