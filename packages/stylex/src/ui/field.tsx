import { children, createMemo, For, Match, omit, Show, Switch } from "solid-js"
import type { ComponentProps, JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"
import { Label, type LabelProps } from "./label"
import { Separator } from "./separator"

// Port of shadcn/ui's base-vega `field` (see the Tailwind variant for the source classes).
//
// Tailwind's group/peer/child selectors are rewritten as conditions on the element itself, keyed on
// shadcn's `data-slot`s (which is what the `group/field`, `group/field-group` classes stand for):
//   `group-data-[disabled=true]/field:x`   → `":is([data-slot=field][data-disabled=true] *)"`
//   `has-[>[data-slot=field-content]]:x`   → `":has(> [data-slot=field-content])"`
//   `*:data-[slot=field]:p-3` (on FieldLabel) → on Field: `":is([data-slot=field-label] > *)"`
//   `@md/field-group:x`                    → `"@container field-group (min-width: 28rem)"`
// Field's `*:w-full` / `@md/field-group:*:w-auto` / `*:data-[slot=field-label]:flex-auto` style the
// field's children, so they live on this file's parts (and Input/Textarea) instead: `childWidth`.
// Not portable: styles on children that aren't ours (`[&>[role=checkbox],[role=radio]]:mt-px`, the
// `[&>a]:underline` links in FieldDescription): style those elements directly.
const CONTAINER_MD = "@container field-group (min-width: 28rem)"

const styles = stylex.create({
  fieldSet: {
    display: "flex",
    flexDirection: "column",
    gap: {
      default: "1.5rem",
      ":has(> [data-slot=checkbox-group])": "0.75rem",
      ":has(> [data-slot=radio-group])": "0.75rem",
    },
  },
  legend: {
    marginBottom: "0.75rem",
    fontWeight: 500,
    fontSize: { default: null, ":is([data-variant=label])": "0.875rem", ":is([data-variant=legend])": "1rem" },
    lineHeight: { default: null, ":is([data-variant=label])": "1.25rem", ":is([data-variant=legend])": "1.5rem" },
  },
  group: {
    containerType: "inline-size",
    containerName: "field-group",
    display: "flex",
    width: "100%",
    flexDirection: "column",
    gap: {
      default: "1.75rem",
      ":is([data-slot=checkbox-group])": "0.75rem",
      // `*:data-[slot=field-group]:gap-4` on the parent group.
      ":is([data-slot=field-group] > *)": "1rem",
    },
  },
  field: {
    display: "flex",
    width: "100%",
    gap: "0.75rem",
    color: { default: null, ":is([data-invalid=true])": colors.destructive },
    // FieldLabel's `*:data-[slot=field]:p-3` (a field inside a choice-card label).
    padding: { default: null, ":is([data-slot=field-label] > *)": "0.75rem" },
  },
  vertical: {
    flexDirection: "column",
  },
  horizontal: {
    flexDirection: "row",
    alignItems: { default: "center", ":has(> [data-slot=field-content])": "flex-start" },
  },
  responsive: {
    flexDirection: { default: "column", [CONTAINER_MD]: "row" },
    alignItems: {
      default: null,
      [CONTAINER_MD]: { default: "center", ":has(> [data-slot=field-content])": "flex-start" },
    },
  },
  // Field's `*:w-full` (vertical, responsive) and `@md/field-group:*:w-auto` (responsive).
  childWidth: {
    width: {
      default: null,
      ":is([data-slot=field][data-orientation=vertical] > *)": "100%",
      ":is([data-slot=field][data-orientation=responsive] > *)": { default: "100%", [CONTAINER_MD]: "auto" },
    },
  },
  content: {
    display: "flex",
    flex: "1 1 0%",
    flexDirection: "column",
    gap: "0.25rem",
    lineHeight: 1.375,
  },
  label: {
    display: "flex",
    flexDirection: { default: null, ":has(> [data-slot=field])": "column" },
    gap: "0.5rem",
    lineHeight: 1.375,
    width: {
      default: "fit-content",
      ":is([data-slot=field][data-orientation=vertical] > *)": "100%",
      ":is([data-slot=field][data-orientation=responsive] > *)": { default: "100%", [CONTAINER_MD]: "auto" },
      ":has(> [data-slot=field])": "100%",
    },
    // Field's `*:data-[slot=field-label]:flex-auto` (horizontal, and responsive from @md).
    flex: {
      default: null,
      ":is([data-slot=field][data-orientation=horizontal] > *)": "1 1 auto",
      ":is([data-slot=field][data-orientation=responsive] > *)": { default: null, [CONTAINER_MD]: "1 1 auto" },
    },
    opacity: { default: null, ":is([data-slot=field][data-disabled=true] *)": 0.5 },
    borderRadius: { default: null, ":has(> [data-slot=field])": radius.md },
    borderWidth: { default: null, ":has(> [data-slot=field])": "1px" },
    borderStyle: { default: null, ":has(> [data-slot=field])": "solid" },
    borderColor: {
      default: null,
      ":has(> [data-slot=field])": colors.border,
      ":has([data-checked]:not([data-checked=false]))": `light-dark(color-mix(in oklch, ${colors.primary} 30%, transparent), color-mix(in oklch, ${colors.primary} 20%, transparent))`,
      ":has(> [data-slot=field]):has(:focus-visible)": colors.ring,
    },
    backgroundColor: {
      default: null,
      ":has([data-checked]:not([data-checked=false]))": `light-dark(color-mix(in oklch, ${colors.primary} 5%, transparent), color-mix(in oklch, ${colors.primary} 10%, transparent))`,
      ":has(> [data-slot=field]):not(:has(:disabled, [data-disabled])):hover": `color-mix(in oklch, ${colors.muted} 50%, transparent)`,
    },
    boxShadow: {
      default: null,
      ":has(> [data-slot=field]):has(:focus-visible)": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
    },
  },
  title: {
    display: "flex",
    width: {
      default: "fit-content",
      ":is([data-slot=field][data-orientation=vertical] > *)": "100%",
      ":is([data-slot=field][data-orientation=responsive] > *)": { default: "100%", [CONTAINER_MD]: "auto" },
    },
    flex: {
      default: null,
      ":is([data-slot=field][data-orientation=horizontal] > *)": "1 1 auto",
      ":is([data-slot=field][data-orientation=responsive] > *)": { default: null, [CONTAINER_MD]: "1 1 auto" },
    },
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    opacity: { default: null, ":is([data-slot=field][data-disabled=true] *)": 0.5 },
  },
  description: {
    textAlign: "left",
    fontSize: "0.875rem",
    lineHeight: 1.5,
    fontWeight: 400,
    color: colors.mutedForeground,
    // `group-has-data-horizontal/field:text-balance`
    textWrap: { default: null, ":is([data-slot=field]:has([data-orientation=horizontal]) *)": "balance" },
    marginTop: {
      default: null,
      ":is([data-variant=legend] + *)": "-0.375rem",
      ":last-child": 0,
      ":nth-last-child(2)": "-0.25rem",
    },
  },
  separator: {
    position: "relative",
    marginBlock: "-0.5rem",
    marginBottom: { default: null, ":is([data-slot=field-group][data-variant=outline] *)": "-0.5rem" },
    height: "1.25rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  separatorLine: {
    position: "absolute",
    inset: 0,
    top: "50%",
  },
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
  },
  errorList: {
    marginLeft: "1rem",
    display: "flex",
    listStyleType: "disc",
    flexDirection: "column",
    gap: "0.25rem",
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type FieldSetProps = Omit<ComponentProps<"fieldset">, "class"> & XStyle

function FieldSet(props: FieldSetProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.fieldSet, props.xstyle)
  return <fieldset data-slot="field-set" {...rest} class={cx(attrs().class, props.class)} />
}

type FieldLegendProps = Omit<ComponentProps<"legend">, "class"> &
  XStyle & {
    variant?: "legend" | "label"
  }

function FieldLegend(props: FieldLegendProps) {
  const rest = omit(props, "class", "xstyle", "variant")
  const attrs = () => stylex.attrs(styles.legend, props.xstyle)
  return (
    <legend
      data-slot="field-legend"
      data-variant={props.variant ?? "legend"}
      {...rest}
      class={cx(attrs().class, props.class)}
    />
  )
}

type DivProps = Omit<ComponentProps<"div">, "class"> & XStyle

function FieldGroup(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.group, props.xstyle)
  return <div data-slot="field-group" {...rest} class={cx(attrs().class, props.class)} />
}

const orientationStyles = {
  vertical: styles.vertical,
  horizontal: styles.horizontal,
  responsive: styles.responsive,
}

type FieldOrientation = keyof typeof orientationStyles

type FieldProps = DivProps & { orientation?: FieldOrientation | null }

function Field(props: FieldProps) {
  const rest = omit(props, "class", "xstyle", "orientation")
  const attrs = () => stylex.attrs(styles.field, orientationStyles[props.orientation ?? "vertical"], props.xstyle)
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={props.orientation ?? "vertical"}
      {...rest}
      class={cx(attrs().class, props.class)}
    />
  )
}

function FieldContent(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.content, styles.childWidth, props.xstyle)
  return <div data-slot="field-content" {...rest} class={cx(attrs().class, props.class)} />
}

function FieldLabel(props: LabelProps) {
  const rest = omit(props, "xstyle")
  return <Label data-slot="field-label" {...rest} xstyle={[styles.label, props.xstyle]} />
}

function FieldTitle(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.title, props.xstyle)
  return <div data-slot="field-label" {...rest} class={cx(attrs().class, props.class)} />
}

type FieldDescriptionProps = Omit<ComponentProps<"p">, "class"> & XStyle

function FieldDescription(props: FieldDescriptionProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.description, styles.childWidth, props.xstyle)
  return <p data-slot="field-description" {...rest} class={cx(attrs().class, props.class)} />
}

function FieldSeparator(props: DivProps & { children?: JSX.Element }) {
  const rest = omit(props, "class", "xstyle", "children")
  const content = children(() => props.children)
  const hasContent = () => content.toArray().length > 0
  const attrs = () => stylex.attrs(styles.separator, styles.childWidth, props.xstyle)
  return (
    <div
      data-slot="field-separator"
      data-content={String(hasContent())}
      {...rest}
      class={cx(attrs().class, props.class)}
    >
      <Separator xstyle={styles.separatorLine} />
      <Show when={hasContent()}>
        <span {...stylex.attrs(styles.separatorContent)} data-slot="field-separator-content">
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
  const rest = omit(props, "class", "xstyle", "children", "errors")
  const content = children(() => props.children)
  const hasChildren = () => content.toArray().length > 0
  const uniqueErrors = createMemo(() =>
    props.errors?.length ? [...new Map(props.errors.map((error) => [error?.message, error])).values()] : [],
  )
  // Mirrors shadcn: children win; one unique error renders its message; several render a list.
  const hasContent = () =>
    hasChildren() || (uniqueErrors().length === 1 ? !!uniqueErrors()[0]?.message : uniqueErrors().length > 1)
  const attrs = () => stylex.attrs(styles.error, styles.childWidth, props.xstyle)
  return (
    <Show when={hasContent()}>
      <div role="alert" data-slot="field-error" {...rest} class={cx(attrs().class, props.class)}>
        <Switch>
          <Match when={hasChildren()}>{content()}</Match>
          <Match when={uniqueErrors().length === 1}>{uniqueErrors()[0]?.message}</Match>
          <Match when={uniqueErrors().length > 1}>
            <ul {...stylex.attrs(styles.errorList)}>
              <For each={uniqueErrors()}>
                {(error) => (
                  <Show when={error?.message}>
                    <li>{error?.message}</li>
                  </Show>
                )}
              </For>
            </ul>
          </Match>
        </Switch>
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
