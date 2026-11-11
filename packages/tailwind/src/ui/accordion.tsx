import { omit } from "solid-js"
import { Accordion as AccordionPrimitive } from "base-ui-solidjs/accordion"
import { ChevronDown, ChevronUp } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"

type AccordionProps = Omit<AccordionPrimitive.Root.Props, "class"> & { class?: string }

function Accordion(props: AccordionProps) {
  const rest = omit(props, "class")
  return <AccordionPrimitive.Root data-slot="accordion" class={cn("flex w-full flex-col", props.class)} {...rest} />
}

type AccordionItemProps = Omit<AccordionPrimitive.Item.Props, "class"> & { class?: string }

function AccordionItem(props: AccordionItemProps) {
  const rest = omit(props, "class")
  return <AccordionPrimitive.Item data-slot="accordion-item" class={cn("not-last:border-b", props.class)} {...rest} />
}

type AccordionTriggerProps = Omit<AccordionPrimitive.Trigger.Props, "class"> & { class?: string }

function AccordionTrigger(props: AccordionTriggerProps) {
  const rest = omit(props, "class", "children")
  return (
    <AccordionPrimitive.Header class="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        class={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-md border border-transparent py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          props.class,
        )}
        {...rest}
      >
        {props.children}
        <Icon
          icon={ChevronDown}
          data-slot="accordion-trigger-icon"
          class="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <Icon
          icon={ChevronUp}
          data-slot="accordion-trigger-icon"
          class="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

type AccordionContentProps = Omit<AccordionPrimitive.Panel.Props, "class"> & { class?: string }

function AccordionContent(props: AccordionContentProps) {
  const rest = omit(props, "class", "children")
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      class="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...rest}
    >
      <div
        class={cn(
          "h-(--accordion-panel-height) pt-0 pb-4 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          props.class,
        )}
      >
        {props.children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
}
