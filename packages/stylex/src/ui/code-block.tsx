import { children, createContext, createEffect, createSignal, For, omit, Show, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { Check, Copy } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { codeBlockMarker } from "../lib/markers.stylex"
import { sxMerge } from "../lib/sx"
import { Button, type ButtonProps } from "./button"

// Port of shadcn/ui's base-vega `code-block` (see the Tailwind variant for the source classes).
// `group-data-[size|variant]/code-block` and `in-data-[numbered|wrap]` come from context;
// `group-has-*`/`group-hover` are named-marker ancestor conditions. Not ported: the `scroll-fade-*`
// edge masks, and styles for arbitrary children (the title's `svg` spacing — give the icon
// `margin-inline-end: 0.375rem; vertical-align: middle`; floating actions style only
// `CodeBlockCopyButton`, not other buttons).

type CodeBlockVariant = "default" | "destructive"
type CodeBlockSize = "default" | "sm"

const CodeBlockContext = createContext<{ variant: () => CodeBlockVariant; size: () => CodeBlockSize }>({
  variant: () => "default",
  size: () => "default",
})
const ContentContext = createContext<{ numbered: () => boolean; wrap: () => boolean }>({
  numbered: () => false,
  wrap: () => false,
})
const InHeaderContext = createContext(false)
const FloatingActionsContext = createContext(false)

const styles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    width: "100%",
    minWidth: 0,
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: radius.lg,
    fontSize: { default: "0.875rem", ":is([data-size=sm])": "0.75rem" },
    lineHeight: { default: "1.25rem", ":is([data-size=sm])": "1rem" },
    borderWidth: 1,
    borderStyle: "solid",
    boxShadow: {
      default: null,
      ":has(> [data-slot=code-block-content]:focus-visible)": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
    },
  },
  rootDefault: {
    borderColor: { default: colors.input, ":has(> [data-slot=code-block-content]:focus-visible)": colors.ring },
    color: colors.foreground,
    backgroundColor: `light-dark(transparent, color-mix(in oklch, ${colors.input} 30%, transparent))`,
  },
  rootDestructive: {
    borderColor: `light-dark(color-mix(in oklch, ${colors.destructive} 30%, transparent), color-mix(in oklch, ${colors.destructive} 40%, transparent))`,
    color: colors.destructive,
  },
  header: {
    display: "flex",
    minWidth: 0,
    flexShrink: 0,
    alignItems: "center",
    gap: "0.5rem",
    paddingInline: "1rem",
    paddingTop: "1rem",
    color: colors.mutedForeground,
  },
  headerSm: { paddingInline: "0.75rem", paddingTop: "0.75rem" },
  destructiveText: { color: colors.destructive },
  title: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily:
      'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    color: colors.foreground,
  },
  titleSm: { fontSize: "0.75rem", lineHeight: "1rem" },
  actions: {
    marginBlock: "-0.25rem",
    marginInlineStart: "auto",
    marginInlineEnd: "-0.375rem",
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: "0.25rem",
  },
  actionsFloating: {
    position: "absolute",
    insetInlineEnd: "0.75rem",
    top: "0.75rem",
    zIndex: 10,
    margin: 0,
    opacity: {
      default: 0,
      [stylex.when.ancestor(":hover", codeBlockMarker)]: 1,
      [stylex.when.ancestor(":focus-within", codeBlockMarker)]: 1,
      "@media (pointer: coarse)": 1,
    },
    transitionProperty: "opacity",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  actionsFloatingSm: { insetInlineEnd: "0.5rem", top: "0.5rem" },
  floatingButton: {
    backgroundColor: colors.background,
    boxShadow: `0 0 0 1px color-mix(in oklch, ${colors.foreground} 10%, transparent)`,
  },
  content: {
    margin: 0,
    minHeight: 0,
    minWidth: 0,
    overflow: "auto",
    scrollbarWidth: "thin",
    paddingInline: "1rem",
    paddingTop: { default: "1rem", [stylex.when.ancestor(":has(> [data-slot=code-block-header])", codeBlockMarker)]: "0.5rem" },
    paddingBottom: { default: "1rem", [stylex.when.ancestor(":has(> [data-slot=code-block-footer])", codeBlockMarker)]: "0.5rem" },
    textAlign: "start",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: "1em",
    lineHeight: 1.625,
    outline: "none",
  },
  contentSm: {
    paddingInline: "0.75rem",
    paddingTop: { default: "0.75rem", [stylex.when.ancestor(":has(> [data-slot=code-block-header])", codeBlockMarker)]: "0.375rem" },
    paddingBottom: { default: "0.75rem", [stylex.when.ancestor(":has(> [data-slot=code-block-footer])", codeBlockMarker)]: "0.5rem" },
  },
  contentWrap: { overflowWrap: "break-word", whiteSpace: "pre-wrap" },
  code: {
    display: "grid",
    minHeight: "1lh",
    minWidth: "max-content",
    alignContent: "start",
    fontFamily: "inherit",
    fontSize: "inherit",
  },
  codeNumbered: { gridTemplateColumns: "auto 1fr" },
  codeWrap: { minWidth: 0 },
  line: {
    position: "relative",
    display: "block",
    minHeight: "1lh",
    marginInline: "-1rem",
    paddingInline: "1rem",
    "::before": { minWidth: "1.5rem", textAlign: "end", color: colors.mutedForeground },
    "::after": { position: "absolute", insetInlineStart: "0.25rem", top: 0, color: colors.mutedForeground, userSelect: "none" },
  },
  lineSm: { marginInline: "-0.75rem", paddingInline: "0.75rem" },
  lineNumbered: {
    gridColumn: "span 2 / span 2",
    display: "grid",
    gridTemplateColumns: "subgrid",
    columnGap: "0.75rem",
    counterIncrement: "line",
    "::before": { content: "counter(line)", userSelect: "none" },
  },
  lineAdded: { backgroundColor: colors.muted, "::after": { content: "'+'" } },
  lineRemoved: {
    backgroundColor: `color-mix(in oklch, ${colors.destructive} 10%, transparent)`,
    "::after": { content: "'−'", color: colors.destructive },
  },
  lineHighlighted: { backgroundColor: colors.muted },
  lineContent: { minWidth: 0 },
  footer: {
    display: "flex",
    minWidth: 0,
    flexShrink: 0,
    alignItems: "center",
    gap: "0.5rem",
    paddingInline: "1rem",
    paddingBottom: "1rem",
    color: colors.mutedForeground,
  },
  footerSm: { paddingInline: "0.75rem", paddingBottom: "0.75rem" },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }
type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & XStyle

type CodeBlockProps = DivProps & { variant?: CodeBlockVariant | null; size?: CodeBlockSize }

function CodeBlock(props: CodeBlockProps) {
  const rest = omit(props, "class", "style", "variant", "size", "xstyle")
  const ctx = { variant: () => props.variant ?? "default", size: () => props.size ?? "default" }
  const a = () =>
    sxMerge(
      [
        codeBlockMarker,
        styles.root,
        ctx.variant() === "destructive" ? styles.rootDestructive : styles.rootDefault,
        props.xstyle,
      ],
      props.class,
      props.style,
    )
  return (
    <CodeBlockContext value={ctx}>
      <div
        data-slot="code-block"
        data-variant={ctx.variant()}
        data-size={ctx.size()}
        {...rest}
        class={a().class}
        style={a().style}
      />
    </CodeBlockContext>
  )
}

function CodeBlockHeader(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const block = useContext(CodeBlockContext)
  const a = () =>
    sxMerge(
      [
        styles.header,
        block.size() === "sm" && styles.headerSm,
        block.variant() === "destructive" && styles.destructiveText,
        props.xstyle,
      ],
      props.class,
      props.style,
    )
  return (
    <InHeaderContext value={true}>
      <div data-slot="code-block-header" {...rest} class={a().class} style={a().style} />
    </InHeaderContext>
  )
}

function CodeBlockTitle(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const block = useContext(CodeBlockContext)
  const a = () =>
    sxMerge(
      [
        styles.title,
        block.size() === "sm" && styles.titleSm,
        block.variant() === "destructive" && styles.destructiveText,
        props.xstyle,
      ],
      props.class,
      props.style,
    )
  return <div data-slot="code-block-title" {...rest} class={a().class} style={a().style} />
}

function CodeBlockActions(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const block = useContext(CodeBlockContext)
  const floating = !useContext(InHeaderContext)
  const a = () =>
    sxMerge(
      [
        styles.actions,
        floating && styles.actionsFloating,
        floating && block.size() === "sm" && styles.actionsFloatingSm,
        props.xstyle,
      ],
      props.class,
      props.style,
    )
  return (
    <FloatingActionsContext value={floating}>
      <div data-slot="code-block-actions" {...rest} class={a().class} style={a().style} />
    </FloatingActionsContext>
  )
}

type CodeBlockCopyButtonProps = ButtonProps & { value: string }

function CodeBlockCopyButton(props: CodeBlockCopyButtonProps) {
  const rest = omit(props, "value", "variant", "size", "onClick", "xstyle")
  const floating = useContext(FloatingActionsContext)
  const [copied, setCopied] = createSignal(false)

  createEffect(copied, (isCopied) => {
    if (!isCopied) {
      return
    }

    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  })

  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        data-copied={copied() || undefined}
        variant={props.variant ?? "ghost"}
        size={props.size ?? "icon-xs"}
        aria-label={copied() ? "Copied" : "Copy"}
        xstyle={[floating && styles.floatingButton, props.xstyle]}
        onClick={(event: MouseEvent) => {
          const onClick = props.onClick
          if (typeof onClick === "function") (onClick as (event: MouseEvent) => void)(event)
          navigator.clipboard
            .writeText(props.value)
            .then(() => setCopied(true))
            .catch(() => {})
        }}
        {...rest}
      >
        <Show when={copied()} fallback={<Icon icon={Copy} size={12} />}>
          <Icon icon={Check} size={12} />
        </Show>
      </Button>
      <span aria-live="polite" {...stylex.attrs(styles.srOnly)}>
        {copied() ? "Copied" : ""}
      </span>
    </>
  )
}

type CodeBlockContentProps = Omit<JSX.HTMLAttributes<HTMLPreElement>, "class" | "style"> &
  XStyle & {
    style?: JSX.CSSProperties
    wrap?: boolean
    lineNumbers?: boolean
    startLine?: number
  }

function CodeBlockContent(props: CodeBlockContentProps) {
  const rest = omit(props, "class", "children", "style", "wrap", "lineNumbers", "startLine", "xstyle")
  const block = useContext(CodeBlockContext)
  const ctx = { numbered: () => !!props.lineNumbers, wrap: () => !!props.wrap }
  const a = () =>
    sxMerge(
      [styles.content, block.size() === "sm" && styles.contentSm, ctx.wrap() && styles.contentWrap, props.xstyle],
      props.class,
      { "counter-reset": `line ${(props.startLine ?? 1) - 1}`, ...props.style },
    )
  return (
    <ContentContext value={ctx}>
      <pre
        data-slot="code-block-content"
        data-wrap={props.wrap || undefined}
        data-numbered={props.lineNumbers || undefined}
        dir="ltr"
        tabindex={0}
        {...rest}
        class={a().class}
        style={a().style}
      >
        <code
          data-slot="code-block-code"
          {...stylex.attrs(styles.code, ctx.numbered() && styles.codeNumbered, ctx.wrap() && styles.codeWrap)}
        >
          <CodeBlockContentChildren numbered={ctx.numbered()}>{props.children}</CodeBlockContentChildren>
        </code>
      </pre>
    </ContentContext>
  )
}

// Resolves the content's children inside the context provider, so `CodeBlockLine`s see it.
function CodeBlockContentChildren(props: { numbered: boolean; children?: JSX.Element }) {
  const resolved = children(() => props.children)
  const lines = () => {
    const value = resolved()
    return props.numbered && typeof value === "string" ? value.replace(/\n$/, "").split("\n") : null
  }
  return (
    <Show when={lines()} fallback={resolved()}>
      {(split) => <For each={split()}>{(line) => <CodeBlockLine>{line}</CodeBlockLine>}</For>}
    </Show>
  )
}

type CodeBlockLineVariant = "default" | "added" | "removed" | "highlighted"

type CodeBlockLineProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> &
  XStyle & { variant?: CodeBlockLineVariant | null }

const lineVariantStyles = {
  default: null,
  added: styles.lineAdded,
  removed: styles.lineRemoved,
  highlighted: styles.lineHighlighted,
}

function isEmptyLine(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)
}

function CodeBlockLine(props: CodeBlockLineProps) {
  const rest = omit(props, "class", "style", "variant", "children", "xstyle")
  const block = useContext(CodeBlockContext)
  const content = useContext(ContentContext)
  const resolved = children(() => props.children)
  const a = () =>
    sxMerge(
      [
        styles.line,
        block.size() === "sm" && styles.lineSm,
        content.numbered() && styles.lineNumbered,
        lineVariantStyles[props.variant ?? "default"],
        props.xstyle,
      ],
      props.class,
      props.style,
    )
  return (
    <span data-slot="code-block-line" data-variant={props.variant ?? "default"} {...rest} class={a().class} style={a().style}>
      {/* An empty line holds a newline so copying a selection keeps blank lines. */}
      <span data-slot="code-block-line-content" {...stylex.attrs(styles.lineContent)}>
        {isEmptyLine(resolved()) ? "\n" : resolved()}
      </span>
    </span>
  )
}

function CodeBlockFooter(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const block = useContext(CodeBlockContext)
  const a = () =>
    sxMerge([styles.footer, block.size() === "sm" && styles.footerSm, props.xstyle], props.class, props.style)
  return <div data-slot="code-block-footer" {...rest} class={a().class} style={a().style} />
}

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
  CodeBlockFooter,
  type CodeBlockProps,
  type CodeBlockContentProps,
  type CodeBlockLineProps,
  type CodeBlockCopyButtonProps,
}
