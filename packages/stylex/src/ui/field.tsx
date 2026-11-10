import { children as resolveChildren, createMemo, For, omit, Show } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "../tokens.stylex"
import { fieldGroupMarker, fieldLabelMarker, fieldMarker, groupMarker, peerMarker } from "../lib/markers.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"
import { Label, type LabelProps } from "./label"
import { Separator } from "./separator"

// Port of shadcn/ui's base-vega `field` family (see the Tailwind variant for the source classes).
//
// StyleX can't style children from the parent, so the parent's child variants move to the
// children: `*:w-full` on a vertical Field becomes a `:is([data-slot=field][data-orientation=vertical] > *)`
// condition on the parts that go in a field (labels, descriptions, inputs, select triggers…),
// `*:data-[slot=field]:p-3` on FieldLabel becomes a condition on Field, and so on.
// `group/field` conditions use `[data-slot=field]` ancestors, which is what the group marks.
const inVerticalField = ":is([data-slot=field][data-orientation=vertical] > *)"
const inHorizontalField = ":is([data-slot=field][data-orientation=horizontal] > *)"
const inResponsiveField = ":is([data-slot=field][data-orientation=responsive] > *)"
const fieldGroupMd = "@container field-group (min-width: 28rem)"
const inDisabledField = ":is([data-slot=field][data-disabled=true] *)"

const styles = stylex.create({
  fieldSet: {
    display: "flex",
    flexDirection: "column",
    gap: {
      default: "1.5rem",
      ":has(> [data-slot=checkbox-group])": "0.75rem",
      ":has(> [data-slot=radio-group])": "0.75rem",
    },
    // fieldset defaults
    margin: 0,
    padding: 0,
    borderWidth: 0,
    minWidth: 0,
  },
  legend: { marginBottom: "0.75rem", fontWeight: 500, padding: 0 },
  legendLegend: { fontSize: "1rem", lineHeight: "1.5rem" },
  legendLabel: { fontSize: "0.875rem", lineHeight: "1.25rem" },
  fieldGroup: {
    containerType: "inline-size",
    containerName: "field-group",
    display: "flex",
    width: "100%",
    flexDirection: "column",
    gap: {
      default: "1.75rem",
      ":is([data-slot=checkbox-group])": "0.75rem",
      ":is([data-slot=field-group] > *)": "1rem",
    },
  },
  field: {
    display: "flex",
    width: "100%",
    gap: "0.75rem",
    color: { default: null, ":is([data-invalid=true])": colors.destructive },
    // `*:data-[slot=field]:p-3` on FieldLabel
    padding: { default: null, ":is([data-slot=field-label] > *)": "0.75rem" },
  },
  fieldVertical: { flexDirection: "column" },
  fieldHorizontal: {
    flexDirection: "row",
    alignItems: { default: "center", ":has(> [data-slot=field-content])": "flex-start" },
  },
  fieldResponsive: {
    flexDirection: { default: "column", [fieldGroupMd]: "row" },
    alignItems: {
      default: null,
      [fieldGroupMd]: { default: "center", ":has(> [data-slot=field-content])": "flex-start" },
    },
  },
  content: {
    display: "flex",
    flex: "1 1 0%",
    flexDirection: "column",
    gap: "0.25rem",
    lineHeight: 1.375,
    width: {
      default: null,
      [inVerticalField]: "100%",
      [inResponsiveField]: { default: "100%", [fieldGroupMd]: "auto" },
    },
  },
  label: {
    display: "flex",
    gap: "0.5rem",
    lineHeight: 1.375,
    width: {
      default: "fit-content",
      ":has(> [data-slot=field])": "100%",
      [inVerticalField]: "100%",
      [inResponsiveField]: { default: "100%", [fieldGroupMd]: "auto" },
    },
    flex: {
      default: null,
      [inHorizontalField]: "1 1 auto",
      [inResponsiveField]: { default: null, [fieldGroupMd]: "1 1 auto" },
    },
    flexDirection: { default: null, ":has(> [data-slot=field])": "column" },
    borderRadius: { default: null, ":has(> [data-slot=field])": radius.md },
    borderStyle: { default: null, ":has(> [data-slot=field])": "solid" },
    borderWidth: { default: null, ":has(> [data-slot=field])": "1px" },
    borderColor: {
      default: colors.border,
      ":has([data-checked])": `light-dark(color-mix(in oklch, ${colors.primary} 30%, transparent), color-mix(in oklch, ${colors.primary} 20%, transparent))`,
      ":has(> [data-slot=field]):has(:focus-visible)": colors.ring,
    },
    backgroundColor: {
      default: null,
      ":has([data-checked])": `light-dark(color-mix(in oklch, ${colors.primary} 5%, transparent), color-mix(in oklch, ${colors.primary} 10%, transparent))`,
      ":has(> [data-slot=field]):not(:has(:disabled, [data-disabled])):hover": `color-mix(in oklch, ${colors.muted} 50%, transparent)`,
    },
    boxShadow: {
      default: null,
      ":has(> [data-slot=field]):has(:focus-visible)": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
    },
    // Label's own `group-data-[disabled=true]` / `peer-disabled` opacity plus FieldLabel's.
    opacity: {
      default: null,
      [inDisabledField]: 0.5,
      [stylex.when.ancestor(":is([data-disabled=true])", groupMarker)]: 0.5,
      [stylex.when.siblingBefore(":disabled", peerMarker)]: 0.5,
    },
  },
  title: {
    display: "flex",
    width: {
      default: "fit-content",
      [inVerticalField]: "100%",
      [inResponsiveField]: { default: "100%", [fieldGroupMd]: "auto" },
    },
    flex: {
      default: null,
      [inHorizontalField]: "1 1 auto",
      [inResponsiveField]: { default: null, [fieldGroupMd]: "1 1 auto" },
    },
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    opacity: { default: null, [inDisabledField]: 0.5 },
  },
  description: {
    textAlign: "left",
    fontSize: "0.875rem",
    lineHeight: 1.5,
    fontWeight: 400,
    color: colors.mutedForeground,
    textWrap: { default: null, ":is([data-slot=field]:has([data-orientation=horizontal]) *)": "balance" },
    marginTop: {
      default: null,
      // Tailwind applies the legend rule over `last:` / `nth-last-2:`.
      ":is([data-variant=legend] + *)": "-0.375rem",
      ":nth-last-child(2):not([data-variant=legend] + *)": "-0.25rem",
      ":last-child:not([data-variant=legend] + *)": 0,
    },
    marginBottom: 0,
    width: {
      default: null,
      [inVerticalField]: "100%",
      [inResponsiveField]: { default: "100%", [fieldGroupMd]: "auto" },
    },
  },
  separator: {
    position: "relative",
    marginBlock: "-0.5rem",
    height: "1.25rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  separatorLine: { position: "absolute", inset: 0, top: "50%" },
  separatorContent: {
    position: "relative",
    marginInline: "auto",
    display: "block",
    width: "fit-content",
    backgroundColor: colors.background,
    paddingInline: "0.5rem",
    color: colors.mutedForeground,
  },
  error: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 400,
    color: colors.destructive,
    width: {
      default: null,
      [inVerticalField]: "100%",
      [inResponsiveField]: { default: "100%", [fieldGroupMd]: "auto" },
    },
  },
  errorList: {
    marginLeft: "1rem",
    display: "flex",
    listStyleType: "disc",
    flexDirection: "column",
    gap: "0.25rem",
  },
})

type XStyle = {
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style"> &
  XStyle & { class?: string; style?: JSX.CSSProperties | string }

function sx(props: { class?: string; style?: JSX.CSSProperties | string }, attrs: ReturnType<typeof stylex.attrs>) {
  return { class: cx(attrs.class, props.class), style: mergeStyle(attrs.style, props.style) }
}

type FieldSetProps = Omit<JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>, "class" | "style"> &
  XStyle & { class?: string; style?: JSX.CSSProperties | string }

function FieldSet(props: FieldSetProps) {
  const rest = omit(props, "class", "style", "xstyle")
  return <fieldset data-slot="field-set" {...rest} {...sx(props, stylex.attrs(styles.fieldSet, props.xstyle))} />
}

type FieldLegendProps = Omit<JSX.HTMLAttributes<HTMLLegendElement>, "class" | "style"> &
  XStyle & { class?: string; style?: JSX.CSSProperties | string; variant?: "legend" | "label" }

function FieldLegend(props: FieldLegendProps) {
  const rest = omit(props, "class", "style", "variant", "xstyle")
  const isLabel = () => props.variant === "label"
  const attrs = () => stylex.attrs(styles.legend, isLabel() ? styles.legendLabel : styles.legendLegend, props.xstyle)
  return <legend data-slot="field-legend" data-variant={props.variant ?? "legend"} {...rest} {...sx(props, attrs())} />
}

function FieldGroup(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  return (
    <div data-slot="field-group" {...rest} {...sx(props, stylex.attrs(fieldGroupMarker, styles.fieldGroup, props.xstyle))} />
  )
}

type FieldOrientation = "vertical" | "horizontal" | "responsive"
const orientationStyles = {
  vertical: styles.fieldVertical,
  horizontal: styles.fieldHorizontal,
  responsive: styles.fieldResponsive,
}

type FieldProps = DivProps & { orientation?: FieldOrientation | null }

function Field(props: FieldProps) {
  const rest = omit(props, "class", "style", "orientation", "xstyle")
  const orientation = () => props.orientation ?? "vertical"
  const orientationStyle = () => orientationStyles[orientation()]
  const attrs = () => stylex.attrs(fieldMarker, styles.field, orientationStyle(), props.xstyle)
  return <div role="group" data-slot="field" data-orientation={orientation()} {...rest} {...sx(props, attrs())} />
}

function FieldContent(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  return <div data-slot="field-content" {...rest} {...sx(props, stylex.attrs(styles.content, props.xstyle))} />
}

function FieldLabel(props: LabelProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <Label
      data-slot="field-label"
      {...rest}
      class={cx(stylex.attrs(fieldLabelMarker).class, props.class)}
      xstyle={[styles.label, props.xstyle]}
    />
  )
}

function FieldTitle(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  return <div data-slot="field-label" {...rest} {...sx(props, stylex.attrs(styles.title, props.xstyle))} />
}

type FieldDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class" | "style"> &
  XStyle & { class?: string; style?: JSX.CSSProperties | string }

/** shadcn's `[&>a]` link styles can't be expressed in StyleX; style links inside it yourself. */
function FieldDescription(props: FieldDescriptionProps) {
  const rest = omit(props, "class", "style", "xstyle")
  return <p data-slot="field-description" {...rest} {...sx(props, stylex.attrs(styles.description, props.xstyle))} />
}

function FieldSeparator(props: DivProps) {
  const rest = omit(props, "class", "style", "children", "xstyle")
  const content = resolveChildren(() => props.children)
  return (
    <div
      data-slot="field-separator"
      data-content={String(!!content())}
      {...rest}
      {...sx(props, stylex.attrs(styles.separator, props.xstyle))}
    >
      <Separator xstyle={styles.separatorLine} />
      <Show when={content()}>
        <span data-slot="field-separator-content" {...stylex.attrs(styles.separatorContent)}>
          {content()}
        </span>
      </Show>
    </div>
  )
}

type FieldErrorProps = DivProps & {
  errors?: Array<{ message?: string } | undefined>
}

function FieldError(props: FieldErrorProps) {
  const rest = omit(props, "class", "style", "children", "errors", "xstyle")
  const resolved = resolveChildren(() => props.children)
  const uniqueErrors = createMemo(() => [...new Map((props.errors ?? []).map((error) => [error?.message, error])).values()])
  const content = createMemo((): JSX.Element => {
    const children = resolved()
    if (children) return children
    if (!props.errors?.length) return null
    const errors = uniqueErrors()
    if (errors.length == 1) return errors[0]?.message
    return (
      <ul {...stylex.attrs(styles.errorList)}>
        <For each={errors}>{(error) => (error?.message ? <li>{error.message}</li> : null)}</For>
      </ul>
    )
  })

  return (
    <Show when={content()}>
      <div role="alert" data-slot="field-error" {...rest} {...sx(props, stylex.attrs(styles.error, props.xstyle))}>
        {content()}
      </div>
    </Show>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
