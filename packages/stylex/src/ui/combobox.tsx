import { omit, Show } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Combobox as ComboboxPrimitive } from "base-ui-solidjs/combobox"
import { Check, ChevronDown, X } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { comboboxContentMarker } from "../lib/markers.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"
import { Button } from "./button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./input-group"

// Port of shadcn/ui's base-vega `combobox` (see the Tailwind variant for the source classes).
// The popup's `*:data-[slot=input-group]:` overrides live in InputGroup
// (`:is([data-slot=combobox-content] > *)`); `group-data-empty/combobox-content:flex` on
// ComboboxEmpty is `:is([data-slot=combobox-content][data-empty] *)`.
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
  triggerIcon: { pointerEvents: "none", width: "1rem", height: "1rem", color: colors.mutedForeground },
  noPointer: { pointerEvents: "none" },
  inputGroup: { width: "auto" },
  // InputGroupButton rendering the trigger: `group-has-data-[slot=combobox-clear]/input-group:hidden
  // data-pressed:bg-transparent`, on top of the ghost button's backgrounds.
  inputTrigger: {
    display: { default: null, ":is([data-slot=input-group]:has([data-slot=combobox-clear]) *)": "none" },
    backgroundColor: {
      default: "transparent",
      ":hover:not([data-pressed])": `light-dark(${colors.muted}, color-mix(in oklch, ${colors.muted} 50%, transparent))`,
      ":is([aria-expanded=true]):not([data-pressed])": colors.muted,
    },
  },
  positioner: { isolation: "isolate", zIndex: 50 },
  popup: {
    position: "relative",
    maxHeight: "var(--available-height)",
    width: "var(--anchor-width)",
    maxWidth: "var(--available-width)",
    minWidth: {
      default: "calc(var(--anchor-width) + 1.75rem)",
      ":is([data-chips=true])": "var(--anchor-width)",
    },
    transformOrigin: "var(--transform-origin)",
    overflow: "hidden",
    borderRadius: radius.md,
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
    boxShadow: `${ring1}, ${shadowMd}`,
    outline: "none",
    animationDuration: "100ms",
    animationTimingFunction: "ease",
    animationName: {
      default: null,
      ":is([data-open][data-side=bottom])": enterFromTop,
      ":is([data-open][data-side=top])": enterFromBottom,
      ":is([data-open][data-side=left])": enterFromRight,
      ":is([data-open][data-side=inline-start])": enterFromRight,
      ":is([data-open][data-side=right])": enterFromLeft,
      ":is([data-open][data-side=inline-end])": enterFromLeft,
      ":is([data-closed])": exit,
    },
  },
  list: {
    maxHeight: "min(calc(18rem - 2.25rem), calc(var(--available-height) - 2.25rem))",
    scrollPaddingBlock: "0.25rem",
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: { default: "0.25rem", ":is([data-empty])": 0 },
    scrollbarWidth: "none",
    "::-webkit-scrollbar": { display: "none" },
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
    backgroundColor: { default: null, ":is([data-highlighted])": colors.accent },
    color: { default: null, ":is([data-highlighted])": colors.accentForeground },
    pointerEvents: { default: null, ":is([data-disabled])": "none" },
    opacity: { default: null, ":is([data-disabled])": 0.5 },
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
  label: {
    paddingInline: "0.5rem",
    paddingBlock: "0.375rem",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    color: colors.mutedForeground,
  },
  empty: {
    display: { default: "none", ":is([data-slot=combobox-content][data-empty] *)": "flex" },
    width: "100%",
    justifyContent: "center",
    paddingBlock: "0.5rem",
    textAlign: "center",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.mutedForeground,
  },
  separator: {
    marginInline: "-0.25rem",
    marginBlock: "0.25rem",
    height: "1px",
    backgroundColor: colors.border,
  },
  chips: {
    display: "flex",
    minHeight: "2.25rem",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.375rem",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: colors.input,
      ":focus-within:not(:has([aria-invalid=true]))": colors.ring,
      ":has([aria-invalid=true])": invalidBorder,
    },
    backgroundColor: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
    backgroundClip: "padding-box",
    paddingInline: { default: "0.625rem", ":has([data-slot=combobox-chip])": "0.375rem" },
    paddingBlock: "0.375rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    boxShadow: {
      default: shadowXs,
      ":focus-within:not(:has([aria-invalid=true]))": `${focusRing}, ${shadowXs}`,
      ":has([aria-invalid=true])": `${invalidRing}, ${shadowXs}`,
    },
    transitionProperty: "color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  chip: {
    display: "flex",
    height: "1.375rem",
    width: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    borderRadius: radius.sm,
    backgroundColor: colors.muted,
    paddingLeft: "0.375rem",
    paddingRight: { default: "0.375rem", ":has([data-slot=combobox-chip-remove])": 0 },
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
    color: colors.foreground,
    pointerEvents: { default: null, ":has(:disabled)": "none" },
    cursor: { default: null, ":has(:disabled)": "not-allowed" },
    opacity: { default: null, ":has(:disabled)": 0.5 },
  },
  chipRemove: {
    marginLeft: "-0.25rem",
    opacity: { default: 0.5, ":hover": 1 },
  },
  chipsInput: {
    minWidth: "4rem",
    flex: "1 1 0%",
    outline: "none",
  },
})

type XStyle = {
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

const Combobox = ComboboxPrimitive.Root

function ComboboxValue(props: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

type ComboboxTriggerProps = Omit<ComboboxPrimitive.Trigger.Props, "class"> & XStyle & { class?: string }

// No `omit` here: as InputGroupButton's render target it receives Base UI's reactive props proxy,
// and enumerating its keys in the component body is an untracked read.
function ComboboxTrigger(props: ComboboxTriggerProps) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      {...props}
      {...({ xstyle: undefined } as object)}
      class={cx(stylex.attrs(props.xstyle).class, props.class)}
    >
      {props.children}
      <Icon icon={ChevronDown} {...stylex.attrs(styles.triggerIcon)} />
    </ComboboxPrimitive.Trigger>
  )
}

type ComboboxClearProps = Omit<ComboboxPrimitive.Clear.Props, "class"> & { class?: string }

function ComboboxClear(props: ComboboxClearProps) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={(p) => <InputGroupButton variant="ghost" size="icon-xs" {...(p as object)} />}
      {...props}
    >
      <Icon icon={X} {...stylex.attrs(styles.noPointer)} />
    </ComboboxPrimitive.Clear>
  )
}

type ComboboxInputProps = Omit<ComboboxPrimitive.Input.Props, "class"> &
  XStyle & {
    class?: string
    showTrigger?: boolean
    showClear?: boolean
  }

function ComboboxInput(props: ComboboxInputProps) {
  const rest = omit(props, "class", "children", "disabled", "showTrigger", "showClear", "xstyle")
  const disabled = () => props.disabled ?? false
  return (
    <InputGroup class={props.class} xstyle={[styles.inputGroup, props.xstyle]}>
      {/* Render functions, not `render={<InputGroupInput />}`: Base UI components return accessors,
          not DOM nodes, so an element would be treated as a render function and lose its props. */}
      <ComboboxPrimitive.Input render={(p) => <InputGroupInput {...(p as object)} disabled={disabled()} />} {...rest} />
      <InputGroupAddon align="inline-end">
        <Show when={props.showTrigger ?? true}>
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            render={(p) => <ComboboxTrigger {...(p as object)} />}
            data-slot="input-group-button"
            xstyle={styles.inputTrigger}
            disabled={disabled()}
          />
        </Show>
        <Show when={props.showClear}>
          <ComboboxClear disabled={disabled()} />
        </Show>
      </InputGroupAddon>
      {props.children}
    </InputGroup>
  )
}

type ComboboxContentProps = Omit<ComboboxPrimitive.Popup.Props, "class"> &
  Pick<ComboboxPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "anchor"> &
  XStyle & {
    class?: string
  }

function ComboboxContent(props: ComboboxContentProps) {
  const rest = omit(props, "class", "style", "side", "sideOffset", "align", "alignOffset", "anchor", "xstyle")
  const attrs = () => stylex.attrs(comboboxContentMarker, styles.popup, props.xstyle)
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={props.side ?? "bottom"}
        sideOffset={props.sideOffset ?? 6}
        align={props.align ?? "start"}
        alignOffset={props.alignOffset ?? 0}
        anchor={props.anchor}
        {...stylex.attrs(styles.positioner)}
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={String(!!props.anchor)}
          {...rest}
          class={cx(attrs().class, props.class)}
          style={mergeStyle(attrs().style, props.style)}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

type ComboboxListProps = Omit<ComboboxPrimitive.List.Props, "class"> & XStyle & { class?: string }

function ComboboxList(props: ComboboxListProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.list, props.xstyle)
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type ComboboxItemProps = Omit<ComboboxPrimitive.Item.Props, "class"> & XStyle & { class?: string }

function ComboboxItem(props: ComboboxItemProps) {
  const rest = omit(props, "class", "style", "children", "xstyle")
  const attrs = () => stylex.attrs(styles.item, props.xstyle)
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      {props.children}
      <ComboboxPrimitive.ItemIndicator render={<span {...stylex.attrs(styles.itemIndicator)} />}>
        <Icon icon={Check} {...stylex.attrs(styles.noPointer)} />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

type ComboboxGroupProps = Omit<ComboboxPrimitive.Group.Props, "class"> & XStyle & { class?: string }

function ComboboxGroup(props: ComboboxGroupProps) {
  const rest = omit(props, "class", "xstyle")
  return <ComboboxPrimitive.Group data-slot="combobox-group" {...rest} class={cx(stylex.attrs(props.xstyle).class, props.class)} />
}

type ComboboxLabelProps = Omit<ComboboxPrimitive.GroupLabel.Props, "class"> & XStyle & { class?: string }

function ComboboxLabel(props: ComboboxLabelProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.label, props.xstyle)
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

function ComboboxCollection(props: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
}

type ComboboxEmptyProps = Omit<ComboboxPrimitive.Empty.Props, "class"> & XStyle & { class?: string }

function ComboboxEmpty(props: ComboboxEmptyProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.empty, props.xstyle)
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type ComboboxSeparatorProps = Omit<ComboboxPrimitive.Separator.Props, "class"> & XStyle & { class?: string }

function ComboboxSeparator(props: ComboboxSeparatorProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.separator, props.xstyle)
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type ComboboxChipsProps = Omit<ComboboxPrimitive.Chips.Props, "class"> & XStyle & { class?: string }

function ComboboxChips(props: ComboboxChipsProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.chips, props.xstyle)
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

type ComboboxChipProps = Omit<ComboboxPrimitive.Chip.Props, "class"> &
  XStyle & {
    class?: string
    showRemove?: boolean
  }

function ComboboxChip(props: ComboboxChipProps) {
  const rest = omit(props, "class", "style", "children", "showRemove", "xstyle")
  const attrs = () => stylex.attrs(styles.chip, props.xstyle)
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      {props.children}
      <Show when={props.showRemove ?? true}>
        <ComboboxPrimitive.ChipRemove
          render={(p) => <Button variant="ghost" size="icon-xs" {...(p as object)} xstyle={styles.chipRemove} />}
          data-slot="combobox-chip-remove"
        >
          <Icon icon={X} {...stylex.attrs(styles.noPointer)} />
        </ComboboxPrimitive.ChipRemove>
      </Show>
    </ComboboxPrimitive.Chip>
  )
}

type ComboboxChipsInputProps = Omit<ComboboxPrimitive.Input.Props, "class"> & XStyle & { class?: string }

function ComboboxChipsInput(props: ComboboxChipsInputProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const attrs = () => stylex.attrs(styles.chipsInput, props.xstyle)
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    />
  )
}

/**
 * An anchor for `ComboboxContent`, usually the chips container:
 *
 *   const anchor = useComboboxAnchor()
 *   <ComboboxChips ref={anchor}>…</ComboboxChips>
 *   <ComboboxContent anchor={anchor}>…</ComboboxContent>
 *
 * Solid calls it as a callback ref with the element; Base UI calls it without arguments to read
 * the element. `anchor.current` is the element too (React's ref shape).
 */
type ComboboxAnchor = ((element?: HTMLDivElement | null) => HTMLDivElement | null) & {
  current: HTMLDivElement | null
}

function useComboboxAnchor(): ComboboxAnchor {
  const anchor = ((element?: HTMLDivElement | null) => {
    if (element !== undefined) anchor.current = element
    return anchor.current
  }) as ComboboxAnchor
  anchor.current = null
  return anchor
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
