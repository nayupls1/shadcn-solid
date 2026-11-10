import { createContext, createSignal, createUniqueId, omit, onSettled, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"

/**
 * A small Solid stand-in for `react-resizable-panels` (v4's `Group`/`Panel`/`Separator`), which
 * shadcn's `resizable` wraps. Sizes are percentages of the group: `defaultSize`, `minSize` and
 * `maxSize` take a number (percent), `"50%"` or `"200px"`. Separators resize the panels on either
 * side with the pointer or the keyboard (arrows by 10%, Home/End to the limits).
 */

export type Orientation = "horizontal" | "vertical"
export type SizeValue = number | `${number}%` | `${number}px`

type PanelEntry = {
  id: string
  defaultSize?: SizeValue
  minSize?: SizeValue
  maxSize?: SizeValue
  onResize?: (size: number) => void
}

type GroupContextValue = {
  orientation: () => Orientation
  registerPanel: (entry: PanelEntry) => number
  registerSeparator: () => number
  size: (index: number) => number | undefined
  panelId: (index: number) => string | undefined
  limits: (index: number) => { min: number; max: number }
  resize: (separator: number, deltaPercent: number, from?: number[]) => void
  setPair: (separator: number, before: number) => void
  sizes: () => number[]
  groupSize: () => number
}

const GroupContext = createContext<GroupContextValue>()

function useGroup() {
  const ctx = useContext(GroupContext)
  if (!ctx) throw new Error("Resizable panels and separators must be used within a <Group />")
  return ctx
}

/** The orientation of the enclosing group, as an accessor. */
export function useGroupOrientation() {
  return useGroup().orientation
}

/** The primitive's own inline styles plus a consumer `style` (object or string). */
function mergeStyle(base: Record<string, string | undefined>, extra: unknown): JSX.CSSProperties | string {
  if (typeof extra === "string" && extra) {
    const own = Object.entries(base)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}:${v}`)
      .join(";")
    return `${own};${extra}`
  }
  return { ...base, ...(typeof extra === "object" && extra ? extra : {}) } as JSX.CSSProperties
}

const STEP = 10
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export type GroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  orientation?: Orientation
  /** Called with the panel sizes (percentages) after every resize. */
  onLayoutChange?: (sizes: number[]) => void
}

export function Group(props: GroupProps) {
  const rest = omit(props, "orientation", "onLayoutChange", "ref", "style")
  const panels: PanelEntry[] = []
  let separators = 0
  let element: HTMLDivElement | undefined
  const [sizes, setSizes] = createSignal<number[]>([])
  const orientation = () => props.orientation ?? "horizontal"

  const groupSize = () => {
    if (!element) return 0
    const rect = element.getBoundingClientRect()
    return orientation() === "horizontal" ? rect.width : rect.height
  }

  const toPercent = (value: SizeValue | undefined, fallback: number) => {
    if (value === undefined) return fallback
    if (typeof value === "number") return value
    if (value.endsWith("%")) return parseFloat(value)
    const total = groupSize()
    return total > 0 ? (parseFloat(value) / total) * 100 : fallback
  }

  const limits = (index: number) => {
    const panel = panels[index]
    return { min: toPercent(panel?.minSize, 0), max: toPercent(panel?.maxSize, 100) }
  }

  const commit = (next: number[]) => {
    setSizes(next)
    next.forEach((size, i) => panels[i]?.onResize?.(size))
    props.onLayoutChange?.(next)
  }

  // Initial layout: explicit default sizes, the rest split evenly, then clamped to the limits.
  onSettled(() => {
    const given = panels.map((p) => (p.defaultSize === undefined ? undefined : toPercent(p.defaultSize, 0)))
    const used = given.reduce<number>((sum, s) => sum + (s ?? 0), 0)
    const free = given.filter((s) => s === undefined).length
    const initial = given.map((s, i) => clamp(s ?? Math.max(0, 100 - used) / free, limits(i).min, limits(i).max))
    setSizes(initial)
  })

  const resize = (separator: number, delta: number, from = sizes()) => {
    const a = separator
    const b = separator + 1
    if (from[a] === undefined || from[b] === undefined) return
    const total = from[a] + from[b]
    const la = limits(a)
    const lb = limits(b)
    const min = Math.max(la.min, total - lb.max)
    const max = Math.min(la.max, total - lb.min)
    const nextA = clamp(from[a] + delta, min, max)
    const next = [...from]
    next[a] = nextA
    next[b] = total - nextA
    commit(next)
  }

  const setPair = (separator: number, before: number) => {
    const current = sizes()
    resize(separator, before - (current[separator] ?? 0), current)
  }

  const ctx: GroupContextValue = {
    orientation,
    registerPanel: (entry) => panels.push(entry) - 1,
    registerSeparator: () => {
      separators++
      return panels.length - 1
    },
    size: (index) => sizes()[index],
    panelId: (index) => panels[index]?.id,
    limits,
    resize,
    setPair,
    sizes,
    groupSize,
  }

  return (
    <GroupContext value={ctx}>
      <div
        data-group=""
        aria-orientation={orientation()}
        {...rest}
        ref={(el: HTMLDivElement) => {
          element = el
          const ref = props.ref as ((el: HTMLDivElement) => void) | undefined
          if (typeof ref === "function") ref(el)
        }}
        style={mergeStyle(
          {
            display: "flex",
            "flex-direction": orientation() === "horizontal" ? "row" : "column",
            overflow: "hidden",
          },
          props.style,
        )}
      />
    </GroupContext>
  )
}

export type PanelProps = JSX.HTMLAttributes<HTMLDivElement> & {
  defaultSize?: SizeValue
  minSize?: SizeValue
  maxSize?: SizeValue
  onResize?: (size: number) => void
}

export function Panel(props: PanelProps) {
  const rest = omit(props, "defaultSize", "minSize", "maxSize", "onResize", "id", "style")
  const group = useGroup()
  const id = (typeof props.id === "string" && props.id) || `panel-${createUniqueId()}`
  const index = group.registerPanel({
    id,
    get defaultSize() {
      return props.defaultSize
    },
    get minSize() {
      return props.minSize
    },
    get maxSize() {
      return props.maxSize
    },
    onResize: (size) => props.onResize?.(size),
  })
  return (
    <div
      data-panel=""
      id={id}
      {...rest}
      style={mergeStyle(
        {
          // Before the first layout, fall back to the default size so nothing jumps.
          flex: `${group.size(index) ?? (typeof props.defaultSize === "number" ? props.defaultSize : parseFloat(String(props.defaultSize ?? 1)))} 1 0px`,
          overflow: "hidden",
        },
        props.style,
      )}
    />
  )
}

export type SeparatorProps = JSX.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }

export function Separator(props: SeparatorProps) {
  const rest = omit(props, "disabled", "onPointerDown", "onKeyDown")
  const group = useGroup()
  const index = group.registerSeparator()
  const [state, setState] = createSignal<"inactive" | "hover" | "active">("inactive")
  const horizontal = () => group.orientation() === "horizontal"

  const onPointerDown = (event: PointerEvent) => {
    if (props.disabled || event.button !== 0) return
    event.preventDefault()
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)
    target.focus()
    const start = horizontal() ? event.clientX : event.clientY
    const from = group.sizes()
    const total = group.groupSize()
    setState("active")
    const move = (e: PointerEvent) => {
      if (total <= 0) return
      const delta = (((horizontal() ? e.clientX : e.clientY) - start) / total) * 100
      group.resize(index, delta, from)
    }
    const up = (e: PointerEvent) => {
      target.releasePointerCapture(e.pointerId)
      target.removeEventListener("pointermove", move)
      target.removeEventListener("pointerup", up)
      target.removeEventListener("pointercancel", up)
      setState("inactive")
    }
    target.addEventListener("pointermove", move)
    target.addEventListener("pointerup", up)
    target.addEventListener("pointercancel", up)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (props.disabled) return
    const back = horizontal() ? "ArrowLeft" : "ArrowUp"
    const forward = horizontal() ? "ArrowRight" : "ArrowDown"
    if (event.key === back) group.resize(index, -STEP)
    else if (event.key === forward) group.resize(index, STEP)
    else if (event.key === "Home") group.setPair(index, group.limits(index).min)
    else if (event.key === "End") group.setPair(index, group.limits(index).max)
    else return
    event.preventDefault()
  }

  const value = () => group.size(index)

  return (
    <div
      role="separator"
      tabindex={props.disabled ? undefined : 0}
      data-separator={state()}
      data-disabled={props.disabled ? "" : undefined}
      aria-orientation={horizontal() ? "vertical" : "horizontal"}
      aria-controls={group.panelId(index)}
      aria-valuenow={value() === undefined ? undefined : Math.round(value()!)}
      aria-valuemin={Math.round(group.limits(index).min)}
      aria-valuemax={Math.round(group.limits(index).max)}
      {...rest}
      style={mergeStyle(
        {
          cursor: props.disabled ? undefined : horizontal() ? "col-resize" : "row-resize",
          "touch-action": "none",
          "user-select": "none",
        },
        props.style,
      )}
      onPointerEnter={() => state() === "inactive" && setState("hover")}
      onPointerLeave={() => state() === "hover" && setState("inactive")}
      onPointerDown={(event) => {
        const handler = props.onPointerDown
        if (typeof handler === "function") (handler as (e: PointerEvent) => void)(event)
        onPointerDown(event)
      }}
      onKeyDown={(event) => {
        const handler = props.onKeyDown
        if (typeof handler === "function") (handler as (e: KeyboardEvent) => void)(event)
        onKeyDown(event)
      }}
    />
  )
}
