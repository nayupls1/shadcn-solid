import { omit, Show } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "../tokens.stylex"
import { sxMerge } from "../lib/sx"
import * as ResizablePrimitive from "../lib/resizable-panels"

// Port of shadcn/ui's base-vega `resizable` (see the Tailwind variant for the source classes) over
// lib/resizable-panels.tsx, a small Solid stand-in for react-resizable-panels. The handle's
// `aria-[orientation=horizontal]:` rules are picked from the group's orientation.

const styles = stylex.create({
  group: { display: "flex", width: "100%", height: "100%" },
  groupVertical: { flexDirection: "column" },
  handle: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
    outline: "none",
    boxShadow: { default: null, ":focus-visible": `0 0 0 1px ${colors.ring}` },
    "::after": { content: "''", position: "absolute", top: 0, bottom: 0 },
  },
  // Horizontal group: a vertical line.
  handleInHorizontal: {
    width: "1px",
    "::after": { left: "50%", width: "0.25rem", transform: "translateX(-50%)" },
  },
  // Vertical group: a horizontal line (`aria-orientation="horizontal"`).
  handleInVertical: {
    height: "1px",
    width: "100%",
    "::after": { left: 0, height: "0.25rem", width: "100%", transform: "translateY(-50%)" },
  },
  grip: {
    zIndex: 10,
    display: "flex",
    height: "1.5rem",
    width: "0.25rem",
    flexShrink: 0,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  gripRotated: { transform: "rotate(90deg)" },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type ResizablePanelGroupProps = Omit<ResizablePrimitive.GroupProps, "class"> & XStyle

function ResizablePanelGroup(props: ResizablePanelGroupProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () =>
    sxMerge(
      [styles.group, props.orientation === "vertical" && styles.groupVertical, props.xstyle],
      props.class,
      props.style,
    )
  return <ResizablePrimitive.Group data-slot="resizable-panel-group" {...rest} class={a().class} style={a().style} />
}

type ResizablePanelProps = Omit<ResizablePrimitive.PanelProps, "class"> & XStyle

function ResizablePanel(props: ResizablePanelProps) {
  const rest = omit(props, "class", "xstyle")
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      {...rest}
      class={sxMerge([props.xstyle], props.class).class}
    />
  )
}

type ResizableHandleProps = Omit<ResizablePrimitive.SeparatorProps, "class"> & XStyle & { withHandle?: boolean }

function ResizableHandle(props: ResizableHandleProps) {
  const rest = omit(props, "class", "style", "xstyle", "withHandle")
  const orientation = ResizablePrimitive.useGroupOrientation()
  const a = () =>
    sxMerge(
      [
        styles.handle,
        orientation() === "vertical" ? styles.handleInVertical : styles.handleInHorizontal,
        props.xstyle,
      ],
      props.class,
      props.style,
    )
  return (
    <ResizablePrimitive.Separator data-slot="resizable-handle" {...rest} class={a().class} style={a().style}>
      <Show when={props.withHandle}>
        <div {...stylex.attrs(styles.grip, orientation() === "vertical" && styles.gripRotated)} />
      </Show>
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
