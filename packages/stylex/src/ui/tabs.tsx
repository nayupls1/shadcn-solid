import { createContext, omit, useContext } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Tabs as TabsPrimitive } from "base-ui-solidjs/tabs"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `tabs` (see the Tailwind variant for the source classes).
// `group-data-*/tabs` and `group-data-[variant]/tabs-list` conditions come from Base UI's state
// (`orientation`, `active`) through function `class`es, and from the list's variant via context.

type TabsListVariant = "default" | "line"

const TabsListContext = createContext<{ variant: () => TabsListVariant }>({ variant: () => "default" })

const styles = stylex.create({
  root: { display: "flex", gap: "0.5rem" },
  rootHorizontal: { flexDirection: "column" },
  list: {
    display: "inline-flex",
    width: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    padding: "3px",
    color: colors.mutedForeground,
  },
  listHorizontal: { height: "2.25rem" },
  listVertical: { height: "fit-content", flexDirection: "column" },
  listDefault: { backgroundColor: colors.muted },
  listLine: { gap: "0.25rem", backgroundColor: "transparent", borderRadius: 0 },
  trigger: {
    position: "relative",
    display: "inline-flex",
    height: "calc(100% - 1px)",
    flex: "1 1 0%",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: "transparent", ":focus-visible": colors.ring },
    backgroundColor: "transparent",
    paddingInline: "0.5rem",
    paddingBlock: "0.25rem",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
    color: {
      default: `light-dark(color-mix(in oklch, ${colors.foreground} 60%, transparent), ${colors.mutedForeground})`,
      ":hover": colors.foreground,
    },
    transitionProperty: "all",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`,
    },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: { default: null, ":focus-visible": "1px" },
    outlineColor: { default: null, ":focus-visible": colors.ring },
    paddingInlineEnd: { default: "0.5rem", ":has([data-icon=inline-end])": "0.375rem" },
    paddingInlineStart: { default: "0.5rem", ":has([data-icon=inline-start])": "0.375rem" },
    pointerEvents: { default: null, ":disabled": "none", ":is([aria-disabled=true])": "none" },
    opacity: { default: null, ":disabled": 0.5, ":is([aria-disabled=true])": 0.5 },
    "::after": {
      content: "''",
      position: "absolute",
      backgroundColor: colors.foreground,
      opacity: 0,
      transitionProperty: "opacity",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  triggerHorizontalAfter: {
    "::after": { left: 0, right: 0, bottom: "-5px", height: "0.125rem" },
  },
  triggerVertical: {
    width: "100%",
    justifyContent: "flex-start",
    "::after": { top: 0, bottom: 0, right: "-0.25rem", width: "0.125rem" },
  },
  triggerActive: {
    backgroundColor: `light-dark(${colors.background}, color-mix(in oklch, ${colors.input} 30%, transparent))`,
    color: colors.foreground,
    borderColor: { default: `light-dark(transparent, ${colors.input})`, ":focus-visible": colors.ring },
  },
  triggerActiveDefault: {
    boxShadow: {
      default: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      ":focus-visible": `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent), 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`,
    },
  },
  triggerActiveLine: {
    backgroundColor: "transparent",
    borderColor: { default: "transparent", ":focus-visible": colors.ring },
    "::after": { opacity: 1 },
  },
  content: { flex: "1 1 0%", fontSize: "0.875rem", lineHeight: "1.25rem", outline: "none" },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type TabsProps = Omit<TabsPrimitive.Root.Props, "class"> & XStyle

function Tabs(props: TabsProps) {
  const rest = omit(props, "class", "orientation", "xstyle")
  const horizontal = () => (props.orientation ?? "horizontal") === "horizontal"
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={props.orientation ?? "horizontal"}
      orientation={props.orientation ?? "horizontal"}
      {...rest}
      class={cx(stylex.attrs(styles.root, horizontal() && styles.rootHorizontal, props.xstyle).class, props.class)}
    />
  )
}

type TabsListProps = Omit<TabsPrimitive.List.Props, "class"> & XStyle & { variant?: TabsListVariant | null }

function TabsList(props: TabsListProps) {
  const rest = omit(props, "class", "variant", "xstyle")
  const variant = () => props.variant ?? "default"
  return (
    <TabsListContext value={{ variant }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant()}
        {...rest}
        class={(state) =>
          cx(
            stylex.attrs(
              styles.list,
              state.orientation === "vertical" ? styles.listVertical : styles.listHorizontal,
              variant() === "line" ? styles.listLine : styles.listDefault,
              props.xstyle,
            ).class,
            props.class,
          )
        }
      />
    </TabsListContext>
  )
}

/** The trigger styles for a tab state, for custom tab parts. */
function tabsTriggerStyles(opts: { orientation: string; active: boolean; variant: TabsListVariant }) {
  const vertical = opts.orientation === "vertical"
  return [
    styles.trigger,
    vertical ? styles.triggerVertical : styles.triggerHorizontalAfter,
    opts.active && styles.triggerActive,
    opts.active && (opts.variant === "line" ? styles.triggerActiveLine : styles.triggerActiveDefault),
  ]
}

type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, "class"> & XStyle

function TabsTrigger(props: TabsTriggerProps) {
  const rest = omit(props, "class", "xstyle")
  const list = useContext(TabsListContext)
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      {...rest}
      class={(state) =>
        cx(
          stylex.attrs(
            ...tabsTriggerStyles({ orientation: state.orientation, active: state.active, variant: list.variant() }),
            props.xstyle,
          ).class,
          props.class,
        )
      }
    />
  )
}

type TabsContentProps = Omit<TabsPrimitive.Panel.Props, "class"> & XStyle

function TabsContent(props: TabsContentProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      {...rest}
      class={cx(stylex.attrs(styles.content, props.xstyle).class, props.class)}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsTriggerStyles,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
  type TabsListVariant,
}
