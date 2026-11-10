import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"
import { Button, type ButtonProps } from "./button"
import { Input, type InputProps } from "./input"
import { Textarea, type TextareaProps } from "./textarea"

// Port of shadcn/ui's base-vega `input-group` (see the Tailwind variant for the source classes).
// The group's `has-[...]:*` classes are `:has(...)` conditions on the group itself; its
// `has-[...]:[&>input]:*` classes become conditions on InputGroupInput
// (`:is([data-slot=input-group]:has(> [data-align=block-end]) > *)`), and the addon's
// `group-data-[disabled=true]/input-group:*` a condition on the addon. Not ported: `[&>kbd]:rounded-*`
// (style the kbd itself), and `[.border-b]:pb-2`/`[.border-t]:pt-2` (Tailwind class hooks).

const SHADOW_XS = "0 1px 2px 0 rgb(0 0 0 / 0.05)"
const RADIUS_MINUS_5 = `calc(${radius.lg} - 5px)`

const styles = stylex.create({
  group: {
    position: "relative",
    display: "flex",
    height: {
      default: "2.25rem",
      ":has(> [data-align=block-end])": "auto",
      ":has(> [data-align=block-start])": "auto",
      ":has(> textarea)": "auto",
    },
    flexDirection: {
      default: null,
      ":has(> [data-align=block-end])": "column",
      ":has(> [data-align=block-start])": "column",
    },
    width: "100%",
    minWidth: 0,
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: {
      default: colors.input,
      ":has([data-slot=input-group-control]:focus-visible)": colors.ring,
      ":has([data-slot][aria-invalid=true])": colors.destructive,
      ":is([data-slot=combobox-content] *):focus-within": "inherit",
    },
    backgroundColor: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
    boxShadow: {
      default: SHADOW_XS,
      ":has([data-slot=input-group-control]:focus-visible)": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent), ${SHADOW_XS}`,
      ":has([data-slot][aria-invalid=true])": `0 0 0 3px light-dark(color-mix(in oklch, ${colors.destructive} 20%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent)), ${SHADOW_XS}`,
      ":is([data-slot=combobox-content] *):focus-within": SHADOW_XS,
    },
    transitionProperty: "color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    outlineStyle: "none",
  },
  addon: {
    display: "flex",
    height: "auto",
    cursor: "text",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    paddingBlock: "0.375rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    color: colors.mutedForeground,
    userSelect: "none",
    opacity: { default: null, ":is([data-slot=input-group][data-disabled=true] *)": 0.5 },
  },
  addonInlineStart: {
    order: -9999,
    paddingLeft: "0.5rem",
    marginLeft: { default: null, ":has(> button)": "-0.25rem", ":has(> kbd)": "-0.15rem" },
  },
  addonInlineEnd: {
    order: 9999,
    paddingRight: "0.5rem",
    marginRight: { default: null, ":has(> button)": "-0.25rem", ":has(> kbd)": "-0.15rem" },
  },
  addonBlockStart: {
    order: -9999,
    width: "100%",
    justifyContent: "flex-start",
    paddingInline: "0.625rem",
    paddingTop: "0.5rem",
  },
  addonBlockEnd: {
    order: 9999,
    width: "100%",
    justifyContent: "flex-start",
    paddingInline: "0.625rem",
    paddingBottom: "0.5rem",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    boxShadow: {
      default: "none",
      ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
    },
  },
  buttonXs: {
    height: "1.5rem",
    gap: "0.25rem",
    borderRadius: RADIUS_MINUS_5,
    paddingInline: "0.375rem",
  },
  buttonSm: {},
  buttonIconXs: {
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: RADIUS_MINUS_5,
    padding: 0,
  },
  buttonIconSm: {
    width: "2rem",
    height: "2rem",
    padding: 0,
  },
  text: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.mutedForeground,
  },
  input: {
    flex: "1 1 0%",
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    boxShadow: "none",
    // The group's `has-[>[data-align=*]]:[&>input]:*` paddings.
    paddingTop: { default: null, ":is([data-slot=input-group]:has(> [data-align=block-end]) > *)": "0.75rem" },
    paddingBottom: { default: null, ":is([data-slot=input-group]:has(> [data-align=block-start]) > *)": "0.75rem" },
    paddingInlineEnd: { default: null, ":is([data-slot=input-group]:has(> [data-align=inline-end]) > *)": "0.375rem" },
    paddingInlineStart: {
      default: null,
      ":is([data-slot=input-group]:has(> [data-align=inline-start]) > *)": "0.375rem",
    },
  },
  textarea: {
    flex: "1 1 0%",
    resize: "none",
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingBlock: "0.5rem",
    boxShadow: "none",
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }
type DivProps = Omit<ComponentProps<"div">, "class"> & XStyle

function InputGroup(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.group, props.xstyle)
  return <div data-slot="input-group" role="group" {...rest} class={cx(attrs().class, props.class)} />
}

const addonAlignStyles = {
  "inline-start": styles.addonInlineStart,
  "inline-end": styles.addonInlineEnd,
  "block-start": styles.addonBlockStart,
  "block-end": styles.addonBlockEnd,
}

type InputGroupAddonAlign = keyof typeof addonAlignStyles

/** Focuses the group's input when the addon itself (not a button in it) is clicked. */
function focusGroupInput(event: MouseEvent & { currentTarget: HTMLDivElement }) {
  if ((event.target as HTMLElement).closest("button")) {
    return
  }
  event.currentTarget.parentElement?.querySelector("input")?.focus()
}

function InputGroupAddon(props: DivProps & { align?: InputGroupAddonAlign | null }) {
  const rest = omit(props, "class", "xstyle", "align")
  const attrs = () => stylex.attrs(styles.addon, addonAlignStyles[props.align ?? "inline-start"], props.xstyle)
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={props.align ?? "inline-start"}
      onClick={focusGroupInput}
      {...rest}
      class={cx(attrs().class, props.class)}
    />
  )
}

const buttonSizeStyles = {
  xs: styles.buttonXs,
  sm: styles.buttonSm,
  "icon-xs": styles.buttonIconXs,
  "icon-sm": styles.buttonIconSm,
}

type InputGroupButtonProps = Omit<ButtonProps, "size" | "type"> & {
  size?: keyof typeof buttonSizeStyles | null
  type?: "button" | "submit" | "reset"
}

function InputGroupButton(props: InputGroupButtonProps) {
  const rest = omit(props, "type", "variant", "size", "xstyle")
  return (
    <Button
      type={props.type ?? "button"}
      data-size={props.size ?? "xs"}
      variant={props.variant ?? "ghost"}
      {...rest}
      xstyle={[styles.button, buttonSizeStyles[props.size ?? "xs"], props.xstyle]}
    />
  )
}

function InputGroupText(props: Omit<ComponentProps<"span">, "class"> & XStyle) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.text, props.xstyle)
  return <span {...rest} class={cx(attrs().class, props.class)} />
}

function InputGroupInput(props: InputProps) {
  const rest = omit(props, "xstyle")
  return <Input data-slot="input-group-control" {...rest} xstyle={[styles.input, props.xstyle]} />
}

function InputGroupTextarea(props: TextareaProps) {
  const rest = omit(props, "xstyle")
  return <Textarea data-slot="input-group-control" {...rest} xstyle={[styles.textarea, props.xstyle]} />
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea }
