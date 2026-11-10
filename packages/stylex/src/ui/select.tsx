import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Select as SelectPrimitive } from "base-ui-solidjs/select"
import { Check, ChevronDown, ChevronUp } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"
import { buttonGroupItemStyles } from "./button-group"

// Port of shadcn/ui's base-vega `select` (see the Tailwind variant for the source classes).
// tw-animate-css's `animate-in fade-in-0 zoom-in-95 slide-in-from-*-2` / `animate-out fade-out-0
// zoom-out-95` become one keyframe per side; `data-[align-trigger=true]:animate-none` turns them off.
const shadowXs = "0 1px 2px 0 rgb(0 0 0 / 0.05)"
const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const invalidRing = `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`
const invalidBorder = `light-dark(${colors.destructive}, color-mix(in oklch, ${colors.destructive} 50%, transparent))`
const shadowMd = "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
const ring1 = `0 0 0 1px color-mix(in oklch, ${colors.foreground} 10%, transparent)`

const enterFromTop = stylex.keyframes({
  from: { opacity: 0, transform: "translate3d(0, -0.5rem, 0) scale3d(0.95, 0.95, 0.95)" },
})
const enterFromBottom = stylex.keyframes({
  from: { opacity: 0, transform: "translate3d(0, 0.5rem, 0) scale3d(0.95, 0.95, 0.95)" },
})
const enterFromLeft = stylex.keyframes({
  from: { opacity: 0, transform: "translate3d(-0.5rem, 0, 0) scale3d(0.95, 0.95, 0.95)" },
})
const enterFromRight = stylex.keyframes({
  from: { opacity: 0, transform: "translate3d(0.5rem, 0, 0) scale3d(0.95, 0.95, 0.95)" },
})
const exit = stylex.keyframes({
  to: { opacity: 0, transform: "scale3d(0.95, 0.95, 0.95)" },
})

const styles = stylex.create({
  group: { scrollMarginBlock: "0.25rem", padding: "0.25rem" },
  value: {
    display: "flex",
    flex: "1 1 0%",
    textAlign: "left",
    // The trigger's `*:data-[slot=select-value]:` styles.
    alignItems: { default: null, ":is([data-slot=select-trigger] > *)": "center" },
    gap: { default: null, ":is([data-slot=select-trigger] > *)": "0.375rem" },
    overflow: { default: null, ":is([data-slot=select-trigger] > *)": "hidden" },
    WebkitLineClamp: { default: null, ":is([data-slot=select-trigger] > *)": 1 },
  },
  trigger: {
    display: "flex",
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.375rem",
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
    paddingBlock: "0.5rem",
    paddingRight: "0.5rem",
    paddingLeft: "0.625rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    whiteSpace: "nowrap",
    color: { default: "inherit", ":is([data-placeholder])": colors.mutedForeground },
    boxShadow: {
      default: shadowXs,
      ":focus-visible:not([aria-invalid=true])": `${focusRing}, ${shadowXs}`,
      ":is([aria-invalid=true])": `${invalidRing}, ${shadowXs}`,
    },
    transitionProperty: "color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    cursor: { default: null, ":disabled": "not-allowed" },
    opacity: { default: null, ":disabled": 0.5 },
  },
  triggerDefault: { height: "2.25rem" },
  triggerSm: { height: "2rem" },
  triggerIcon: {
    pointerEvents: "none",
    flexShrink: 0,
    width: "1rem",
    height: "1rem",
    color: colors.mutedForeground,
  },
  positioner: { isolation: "isolate", zIndex: 50 },
  popup: {
    position: "relative",
    isolation: "isolate",
    zIndex: 50,
    maxHeight: "var(--available-height)",
    width: "var(--anchor-width)",
    minWidth: "9rem",
    transformOrigin: "var(--transform-origin)",
    overflowX: "hidden",
    overflowY: "auto",
    borderRadius: radius.md,
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    boxShadow: `${ring1}, ${shadowMd}`,
    outline: "none",
    animationDuration: "100ms",
    animationTimingFunction: "ease",
    animationName: {
      default: null,
      ":is([data-open][data-side=bottom]):not([data-align-trigger=true])": enterFromTop,
      ":is([data-open][data-side=top]):not([data-align-trigger=true])": enterFromBottom,
      ":is([data-open][data-side=left]):not([data-align-trigger=true])": enterFromRight,
      ":is([data-open][data-side=inline-start]):not([data-align-trigger=true])": enterFromRight,
      ":is([data-open][data-side=right]):not([data-align-trigger=true])": enterFromLeft,
      ":is([data-open][data-side=inline-end]):not([data-align-trigger=true])": enterFromLeft,
      ":is([data-closed]):not([data-align-trigger=true])": exit,
    },
  },
  label: {
    paddingInline: "0.5rem",
    paddingBlock: "0.375rem",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    color: colors.mutedForeground,
  },
  item: {
    position: "relative",
    display: "flex",
    width: "100%",
    cursor: "default",
    alignItems: "center",
    gap: "0.5rem",
    borderRadius: radius.sm,
    paddingBlock: "0.375rem",
    paddingRight: "2rem",
    paddingLeft: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    outline: "2px solid transparent",
    outlineOffset: "2px",
    userSelect: "none",
    backgroundColor: { default: null, ":focus": colors.accent },
    color: { default: null, ":focus": colors.accentForeground },
    pointerEvents: { default: null, ":is([data-disabled])": "none" },
    opacity: { default: null, ":is([data-disabled])": 0.5 },
  },
  itemText: {
    display: "flex",
    flex: "1 1 0%",
    flexShrink: 0,
    gap: "0.5rem",
    whiteSpace: "nowrap",
  },
  itemIndicator: {
    pointerEvents: "none",
    position: "absolute",
    right: "0.5rem",
    display: "flex",
    width: "1rem",
    height: "1rem",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    pointerEvents: "none",
    marginInline: "-0.25rem",
    marginBlock: "0.25rem",
    height: "1px",
    backgroundColor: colors.border,
  },
  scrollButton: {
    zIndex: 10,
    display: "flex",
    width: "100%",
    cursor: "default",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.popover,
    paddingBlock: "0.25rem",
  },
  scrollUp: { top: 0 },
  scrollDown: { bottom: 0 },
  noPointer: { pointerEvents: "none" },
})

type XStyle = {
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

const Select = SelectPrimitive.Root

type SelectGroupProps = Omit<SelectPrimitive.Group.Props, "class"> & XStyle & { class?: string }

function SelectGroup(props: SelectGroupProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.group, props.xstyle)
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type SelectValueProps = Omit<SelectPrimitive.Value.Props, "class"> & XStyle & { class?: string }

function SelectValue(props: SelectValueProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.value, props.xstyle)
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type SelectTriggerProps = Omit<SelectPrimitive.Trigger.Props, "class"> &
  XStyle & {
    class?: string
    size?: "sm" | "default"
  }

/** Tailwind's `[&_svg]` icon sizing can't be expressed in StyleX; `Icon` defaults to 16px instead. */
function SelectTrigger(props: SelectTriggerProps) {
  const rest = omit(props, "class", "style", "size", "children", "xstyle")
  const sm = () => props.size === "sm"
  // The button group's child rules (see button-group.tsx) apply when a trigger sits in a `ButtonGroup`.
  const attrs = () =>
    stylex.attrs(styles.trigger, sm() ? styles.triggerSm : styles.triggerDefault, buttonGroupItemStyles.item, props.xstyle)
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={props.size ?? "default"}
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      {props.children}
      <SelectPrimitive.Icon render={<Icon icon={ChevronDown} {...stylex.attrs(styles.triggerIcon)} />} />
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps = Omit<SelectPrimitive.Popup.Props, "class"> &
  Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"> &
  XStyle & {
    class?: string
  }

function SelectContent(props: SelectContentProps) {
  const rest = omit(
    props,
    "class",
    "style",
    "children",
    "side",
    "sideOffset",
    "align",
    "alignOffset",
    "alignItemWithTrigger",
    "xstyle",
  )
  const alignItemWithTrigger = () => props.alignItemWithTrigger ?? true
  const attrs = () => stylex.attrs(styles.popup, props.xstyle)
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 4}
        align={props.align ?? "center"}
        alignOffset={props.alignOffset ?? 0}
        alignItemWithTrigger={alignItemWithTrigger()}
        {...stylex.attrs(styles.positioner)}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={String(alignItemWithTrigger())}
          {...rest}
          class={cx(attrs().class, props.class)}
          style={mergeStyle(attrs().style, props.style)}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{props.children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

type SelectLabelProps = Omit<SelectPrimitive.GroupLabel.Props, "class"> & XStyle & { class?: string }

function SelectLabel(props: SelectLabelProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.label, props.xstyle)
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type SelectItemProps = Omit<SelectPrimitive.Item.Props, "class"> & XStyle & { class?: string }

function SelectItem(props: SelectItemProps) {
  const rest = omit(props, "class", "style", "children", "xstyle")
  const attrs = () => stylex.attrs(styles.item, props.xstyle)
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      <SelectPrimitive.ItemText {...stylex.attrs(styles.itemText)}>{props.children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator render={<span {...stylex.attrs(styles.itemIndicator)} />}>
        <Icon icon={Check} {...stylex.attrs(styles.noPointer)} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

type SelectSeparatorProps = Omit<SelectPrimitive.Separator.Props, "class"> & XStyle & { class?: string }

function SelectSeparator(props: SelectSeparatorProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.separator, props.xstyle)
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type SelectScrollUpButtonProps = Omit<SelectPrimitive.ScrollUpArrow.Props, "class"> & XStyle & { class?: string }

function SelectScrollUpButton(props: SelectScrollUpButtonProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.scrollButton, styles.scrollUp, props.xstyle)
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      <Icon icon={ChevronUp} />
    </SelectPrimitive.ScrollUpArrow>
  )
}

type SelectScrollDownButtonProps = Omit<SelectPrimitive.ScrollDownArrow.Props, "class"> & XStyle & { class?: string }

function SelectScrollDownButton(props: SelectScrollDownButtonProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.scrollButton, styles.scrollDown, props.xstyle)
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      <Icon icon={ChevronDown} />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
