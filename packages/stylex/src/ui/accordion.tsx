import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Accordion as AccordionPrimitive } from "base-ui-solidjs/accordion"
import { ChevronDown, ChevronUp } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { sxMerge } from "../lib/sx"

// Port of shadcn/ui's base-vega `accordion` (see the Tailwind variant for the source classes).
// `group-aria-expanded/accordion-trigger:` becomes `stylex.when.ancestor("[aria-expanded=true]")`
// with the trigger as the default marker. The content's `[&_a]`/`[&_p]` descendant rules have no
// StyleX equivalent: style links and paragraphs inside the content directly.

const accordionDown = stylex.keyframes({
  from: { height: 0 },
  to: { height: "var(--accordion-panel-height, auto)" },
})

const accordionUp = stylex.keyframes({
  from: { height: "var(--accordion-panel-height, auto)" },
  to: { height: 0 },
})

const styles = stylex.create({
  root: { display: "flex", width: "100%", flexDirection: "column" },
  item: {
    borderBottomWidth: { default: 1, ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
  },
  header: { display: "flex" },
  trigger: {
    position: "relative",
    display: "flex",
    flex: "1 1 0%",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: "transparent", ":focus-visible": colors.ring },
    paddingBlock: "1rem",
    paddingInline: 0,
    backgroundColor: "transparent",
    color: "inherit",
    textAlign: "left",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    textDecorationLine: { default: null, ":hover": "underline" },
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
    },
    pointerEvents: { default: null, ":is([aria-disabled=true])": "none" },
    opacity: { default: null, ":is([aria-disabled=true])": 0.5 },
  },
  icon: {
    pointerEvents: "none",
    flexShrink: 0,
    marginLeft: "auto",
    width: "1rem",
    height: "1rem",
    color: colors.mutedForeground,
  },
  iconDown: {
    display: {
      default: "block",
      [stylex.when.ancestor("[aria-expanded=true]")]: "none",
    },
  },
  iconUp: {
    display: {
      default: "none",
      [stylex.when.ancestor("[aria-expanded=true]")]: "inline",
    },
  },
  panel: {
    overflow: "hidden",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    animationName: {
      default: null,
      ":is([data-open])": accordionDown,
      ":is([data-closed])": accordionUp,
    },
    animationDuration: "0.2s",
    animationTimingFunction: "ease-out",
  },
  content: {
    height: "var(--accordion-panel-height)",
    paddingTop: 0,
    paddingBottom: "1rem",
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type AccordionProps = Omit<AccordionPrimitive.Root.Props, "class"> & XStyle

function Accordion(props: AccordionProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.root, props.xstyle], props.class, props.style)
  return <AccordionPrimitive.Root data-slot="accordion" {...rest} class={a().class} style={a().style} />
}

type AccordionItemProps = Omit<AccordionPrimitive.Item.Props, "class"> & XStyle

function AccordionItem(props: AccordionItemProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.item, props.xstyle], props.class, props.style)
  return <AccordionPrimitive.Item data-slot="accordion-item" {...rest} class={a().class} style={a().style} />
}

type AccordionTriggerProps = Omit<AccordionPrimitive.Trigger.Props, "class"> & XStyle

function AccordionTrigger(props: AccordionTriggerProps) {
  const rest = omit(props, "class", "style", "xstyle", "children")
  const a = () => sxMerge([stylex.defaultMarker(), styles.trigger, props.xstyle], props.class, props.style)
  return (
    <AccordionPrimitive.Header {...stylex.attrs(styles.header)}>
      <AccordionPrimitive.Trigger data-slot="accordion-trigger" {...rest} class={a().class} style={a().style}>
        {props.children}
        <Icon icon={ChevronDown} data-slot="accordion-trigger-icon" {...stylex.attrs(styles.icon, styles.iconDown)} />
        <Icon icon={ChevronUp} data-slot="accordion-trigger-icon" {...stylex.attrs(styles.icon, styles.iconUp)} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

type AccordionContentProps = Omit<AccordionPrimitive.Panel.Props, "class"> & XStyle

function AccordionContent(props: AccordionContentProps) {
  // Like shadcn: `class` (and `xstyle`) style the inner wrapper, other props go to the panel.
  const rest = omit(props, "class", "xstyle", "children")
  const a = () => sxMerge([styles.content, props.xstyle], props.class)
  return (
    <AccordionPrimitive.Panel data-slot="accordion-content" {...rest} {...stylex.attrs(styles.panel)}>
      <div class={a().class} style={a().style}>
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
