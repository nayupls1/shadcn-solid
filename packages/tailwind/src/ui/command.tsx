import { omit } from "solid-js"
import type { ComponentProps, JSX } from "@solidjs/web"
import { Check, Search } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import {
  CommandEmptyPrimitive,
  CommandGroupPrimitive,
  CommandInputPrimitive,
  CommandItemPrimitive,
  CommandListPrimitive,
  CommandRoot,
  CommandSeparatorPrimitive,
  type CommandGroupPrimitiveProps,
  type CommandInputPrimitiveProps,
  type CommandItemPrimitiveProps,
  type CommandListPrimitiveProps,
  type CommandRootProps,
  type CommandSeparatorPrimitiveProps,
} from "../lib/cmdk"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"
import { InputGroup, InputGroupAddon } from "./input-group"

// shadcn's command is built on cmdk (React-only); ../lib/cmdk is a Solid port of its parts.

type WithClass<P> = Omit<P, "class"> & { class?: string }

function Command(props: WithClass<CommandRootProps>) {
  const rest = omit(props, "class")
  return (
    <CommandRoot
      data-slot="command"
      class={cn("flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground", props.class)}
      {...rest}
    />
  )
}

type CommandDialogProps = Omit<ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  class?: string
  showCloseButton?: boolean
  children: JSX.Element
}

function CommandDialog(props: CommandDialogProps) {
  const rest = omit(props, "title", "description", "children", "class", "showCloseButton")
  return (
    <Dialog {...rest}>
      <DialogHeader class="sr-only">
        <DialogTitle>{props.title ?? "Command Palette"}</DialogTitle>
        <DialogDescription>{props.description ?? "Search for a command to run..."}</DialogDescription>
      </DialogHeader>
      <DialogContent
        class={cn("top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0", props.class)}
        showCloseButton={props.showCloseButton ?? false}
      >
        {props.children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput(props: WithClass<CommandInputPrimitiveProps>) {
  const rest = omit(props, "class")
  return (
    <div data-slot="command-input-wrapper" class="p-1 pb-0">
      <InputGroup class="h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandInputPrimitive
          data-slot="command-input"
          class={cn("w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50", props.class)}
          {...rest}
        />
        <InputGroupAddon>
          <Icon icon={Search} class="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList(props: WithClass<CommandListPrimitiveProps>) {
  const rest = omit(props, "class")
  return (
    <CommandListPrimitive
      data-slot="command-list"
      class={cn("no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", props.class)}
      {...rest}
    />
  )
}

function CommandEmpty(props: WithClass<ComponentProps<typeof CommandEmptyPrimitive>>) {
  const rest = omit(props, "class")
  return <CommandEmptyPrimitive data-slot="command-empty" class={cn("py-6 text-center text-sm", props.class)} {...rest} />
}

function CommandGroup(props: WithClass<CommandGroupPrimitiveProps>) {
  const rest = omit(props, "class")
  return (
    <CommandGroupPrimitive
      data-slot="command-group"
      class={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        props.class,
      )}
      {...rest}
    />
  )
}

function CommandSeparator(props: WithClass<CommandSeparatorPrimitiveProps>) {
  const rest = omit(props, "class")
  return (
    <CommandSeparatorPrimitive data-slot="command-separator" class={cn("-mx-1 h-px w-auto bg-border", props.class)} {...rest} />
  )
}

function CommandItem(props: WithClass<CommandItemPrimitiveProps>) {
  const rest = omit(props, "class", "children")
  return (
    <CommandItemPrimitive
      data-slot="command-item"
      class={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:**:[svg]:text-foreground",
        props.class,
      )}
      {...rest}
    >
      {props.children}
      <Icon
        icon={Check}
        class="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
      />
    </CommandItemPrimitive>
  )
}

function CommandShortcut(props: Omit<ComponentProps<"span">, "class"> & { class?: string }) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="command-shortcut"
      class={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground",
        props.class,
      )}
      {...rest}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
