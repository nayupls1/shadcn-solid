import {
  createContext,
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  useContext,
  type Accessor,
} from "solid-js"
import { Portal, type JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors } from "../tokens.stylex"

// The StyleX package can't style these through ChartContainer's `[&_.recharts-…]` selectors, so the
// elements carry those styles themselves.
const styles = stylex.create({
  tickText: { fill: colors.mutedForeground },
  gridLine: { stroke: `color-mix(in oklch, ${colors.border} 50%, transparent)` },
  cursorRect: { fill: colors.muted },
  cursorLine: { stroke: colors.border },
  surface: { outline: "none" },
  layer: { outline: "none" },
})
const sx = (style: stylex.StyleXStyles) => stylex.attrs(style).class ?? ""

/**
 * StyleX copy of the Tailwind package's lib/chart-primitives.tsx. Small SVG chart primitives standing in for the parts of recharts that shadcn's chart demos use:
 * `BarChart`/`LineChart`/`AreaChart`, `Bar`/`Line`/`Area`, `XAxis`/`YAxis`/`CartesianGrid`,
 * `Tooltip` and `Legend` (wrapped as `ChartTooltip`/`ChartLegend` in ui/chart.tsx). Horizontal
 * layout with a category x axis and a linear y axis from 0. They render recharts' class names
 * (`recharts-cartesian-grid`, `recharts-tooltip-cursor`, ...) so ChartContainer's classes apply.
 */

export type Datum = Record<string, unknown>

export type TooltipPayloadItem = {
  dataKey: string
  name: string
  value: unknown
  color: string
  fill?: string
  type?: "none"
  payload: Datum
}

export type LegendPayloadItem = { dataKey: string; value: string; color: string; type?: "none" }

type SeriesKind = "bar" | "line" | "area"
type Series = {
  id: number
  kind: SeriesKind
  dataKey: string
  name?: string
  color: () => string
  stackId?: string
  hide?: boolean
}

type Margin = { top?: number; right?: number; bottom?: number; left?: number }

type ChartState = {
  kind: SeriesKind
  data: () => Datum[]
  series: Accessor<Series[]>
  register: (series: Series) => () => void
  setXKey: (key: string) => void
  xKey: () => string | undefined
  setYAxisWidth: (width: number) => void
  plot: () => { x: number; y: number; width: number; height: number }
  /** Category band: start x and width for a datum index. */
  band: (index: number) => { x: number; width: number }
  /** Center x of a datum index. */
  xAt: (index: number) => number
  yScale: (value: number) => number
  yTicks: () => number[]
  stackBase: (series: Series, index: number) => number
  activeIndex: () => number | undefined
  setActiveIndex: (index: number | undefined) => void
  pointer: () => { x: number; y: number } | undefined
  size: () => { width: number; height: number }
  legendHeight: () => number
  setLegendHeight: (height: number) => void
  tooltipPayload: () => TooltipPayloadItem[]
  legendPayload: () => LegendPayloadItem[]
  label: () => unknown
  /** HTML layer above the SVG: the tooltip and legend render here (through a Portal). */
  overlay: HTMLDivElement
}

const ChartStateContext = createContext<ChartState>()

/** The size the chart container gives its chart (ResponsiveContainer). */
export const ChartSizeContext = createContext<() => { width: number; height: number }>(() => ({
  width: 320,
  height: 200,
}))

function useChartState() {
  const state = useContext(ChartStateContext)
  if (!state) throw new Error("Chart parts must be used inside a BarChart, LineChart or AreaChart")
  return state
}

// --- scales -----------------------------------------------------------------------------------

/** d3-style "nice" tick step. */
function tickStep(start: number, stop: number, count: number) {
  const step0 = Math.abs(stop - start) / Math.max(0, count)
  let step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10))
  const error = step0 / step1
  if (error >= Math.sqrt(50)) step1 *= 10
  else if (error >= Math.sqrt(10)) step1 *= 5
  else if (error >= Math.sqrt(2)) step1 *= 2
  return stop < start ? -step1 : step1
}

function niceTicks(max: number, count = 5) {
  if (!(max > 0)) return [0, 1]
  const step = tickStep(0, max, count - 1)
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Number(v.toFixed(10)))
  return ticks
}

// --- curves -----------------------------------------------------------------------------------

export type CurveType = "linear" | "monotone" | "natural" | "step"
type Point = [number, number]

function linearPath(points: Point[]) {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("")
}

function stepPath(points: Point[]) {
  let d = ""
  points.forEach(([x, y], i) => {
    if (i === 0) d += `M${x},${y}`
    else {
      const [px] = points[i - 1]
      const mx = (px + x) / 2
      d += `H${mx}V${y}H${x}`
    }
  })
  return d
}

// Monotone cubic interpolation (d3's curveMonotoneX).
function monotonePath(points: Point[]) {
  const n = points.length
  if (n < 3) return linearPath(points)
  const slopes: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    slopes.push((y1 - y0) / (x1 - x0 || 1))
  }
  const tangents: number[] = [slopes[0]]
  for (let i = 1; i < n - 1; i++) {
    const s0 = slopes[i - 1]
    const s1 = slopes[i]
    if (s0 * s1 <= 0) tangents.push(0)
    else {
      const h0 = points[i][0] - points[i - 1][0]
      const h1 = points[i + 1][0] - points[i][0]
      const p = (s0 * h1 + s1 * h0) / (h0 + h1)
      tangents.push((Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)))
    }
  }
  tangents.push(slopes[n - 2])
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    const dx = (x1 - x0) / 3
    d += `C${x0 + dx},${y0 + dx * tangents[i]},${x1 - dx},${y1 - dx * tangents[i + 1]},${x1},${y1}`
  }
  return d
}

// Natural cubic spline (d3's curveNatural), per coordinate.
function naturalControlPoints(values: number[]) {
  const n = values.length - 1
  const a: number[] = []
  const b: number[] = []
  const r: number[] = []
  a[0] = 0
  b[0] = 2
  r[0] = values[0] + 2 * values[1]
  for (let i = 1; i < n - 1; ++i) {
    a[i] = 1
    b[i] = 4
    r[i] = 4 * values[i] + 2 * values[i + 1]
  }
  a[n - 1] = 2
  b[n - 1] = 7
  r[n - 1] = 8 * values[n - 1] + values[n]
  for (let i = 1; i < n; ++i) {
    const m = a[i] / b[i - 1]
    b[i] -= m
    r[i] -= m * r[i - 1]
  }
  a[n - 1] = r[n - 1] / b[n - 1]
  for (let i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i]
  b[n - 1] = (values[n] + a[n - 1]) / 2
  for (let i = 0; i < n - 1; ++i) b[i] = 2 * values[i + 1] - a[i + 1]
  return [a, b]
}

function naturalPath(points: Point[]) {
  if (points.length < 3) return linearPath(points)
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const [ax, bx] = naturalControlPoints(xs)
  const [ay, by] = naturalControlPoints(ys)
  let d = `M${xs[0]},${ys[0]}`
  for (let i = 0; i < points.length - 1; i++) {
    d += `C${ax[i]},${ay[i]},${bx[i]},${by[i]},${xs[i + 1]},${ys[i + 1]}`
  }
  return d
}

function curvePath(points: Point[], type: CurveType = "linear") {
  if (points.length === 0) return ""
  if (type === "monotone") return monotonePath(points)
  if (type === "natural") return naturalPath(points)
  if (type === "step") return stepPath(points)
  return linearPath(points)
}

// --- chart roots ------------------------------------------------------------------------------

export type CartesianChartProps = {
  data: Datum[]
  margin?: Margin
  accessibilityLayer?: boolean
  class?: string
  children?: JSX.Element
  /** Gap between categories, as a fraction of the band (recharts' barCategoryGap "10%"). */
  barCategoryGap?: number
  /** Gap between bars in a category, in px. */
  barGap?: number
}

function createCartesianChart(kind: SeriesKind) {
  return function CartesianChart(props: CartesianChartProps) {
    const size = useContext(ChartSizeContext)
    const [series, setSeries] = createSignal<Series[]>([], { ownedWrite: true })
    const [xKey, setXKey] = createSignal<string | undefined>(undefined, { ownedWrite: true })
    const [yAxisWidth, setYAxisWidth] = createSignal(0, { ownedWrite: true })
    const [activeIndex, setActiveIndex] = createSignal<number | undefined>(undefined)
    const [pointer, setPointer] = createSignal<{ x: number; y: number }>()
    const [legendHeight, setLegendHeight] = createSignal(0, { ownedWrite: true })
    let nextId = 0

    const margin = () => ({ top: 5, right: 5, bottom: 5, left: 5, ...props.margin })
    const data = () => props.data ?? []
    const visibleSeries = () => series().filter((s) => !s.hide)

    const plot = createMemo(() => {
      const m = margin()
      const { width, height } = size()
      const axisHeight = 30
      const x = m.left + yAxisWidth()
      const y = m.top
      return {
        x,
        y,
        width: Math.max(0, width - x - m.right),
        height: Math.max(0, height - legendHeight() - y - m.bottom - (xKey() !== undefined ? axisHeight : 0)),
      }
    })

    const stacks = createMemo(() => {
      // Cumulative values per stack and datum, in series order.
      const bases = new Map<number, number[]>()
      const totals = new Map<string, number[]>()
      for (const s of visibleSeries()) {
        if (!s.stackId) continue
        const running = totals.get(s.stackId) ?? data().map(() => 0)
        bases.set(s.id, [...running])
        totals.set(
          s.stackId,
          running.map((v, i) => v + (Number(data()[i]?.[s.dataKey]) || 0)),
        )
      }
      return { bases, totals }
    })

    const yMax = createMemo(() => {
      let max = 0
      for (const s of visibleSeries()) {
        for (const d of data()) max = Math.max(max, Number(d[s.dataKey]) || 0)
      }
      for (const totals of stacks().totals.values()) for (const t of totals) max = Math.max(max, t)
      return max
    })

    const yTicks = createMemo(() => niceTicks(yMax(), 5))

    const yScale = (value: number) => {
      const p = plot()
      const top = yTicks()[yTicks().length - 1] || 1
      return p.y + p.height - (value / top) * p.height
    }

    const band = (index: number) => {
      const p = plot()
      const n = Math.max(1, data().length)
      const width = p.width / n
      return { x: p.x + index * width, width }
    }

    // Lines and areas place points at band centers, like recharts with a category axis.
    const xAt = (index: number) => {
      const b = band(index)
      return b.x + b.width / 2
    }

    const tooltipPayload = createMemo((): TooltipPayloadItem[] => {
      const index = activeIndex()
      if (index === undefined) return []
      const datum = data()[index]
      if (!datum) return []
      return visibleSeries().map((s) => ({
        dataKey: s.dataKey,
        name: s.name ?? s.dataKey,
        value: datum[s.dataKey],
        color: s.color(),
        fill: s.kind === "line" ? undefined : s.color(),
        payload: datum,
      }))
    })

    const legendPayload = createMemo((): LegendPayloadItem[] =>
      series().map((s) => ({ dataKey: s.dataKey, value: s.name ?? s.dataKey, color: s.color() })),
    )

    const overlay = (
      <div class="recharts-overlay" style={{ position: "absolute", inset: "0", "pointer-events": "none" }} />
    ) as HTMLDivElement

    const state: ChartState = {
      overlay,
      kind,
      data,
      series: visibleSeries,
      register: (entry) => {
        entry.id = nextId++
        setSeries((prev) => [...prev, entry])
        return () => setSeries((prev) => prev.filter((s) => s !== entry))
      },
      setXKey,
      xKey,
      setYAxisWidth,
      plot,
      band,
      xAt,
      yScale,
      yTicks,
      stackBase: (s, index) => stacks().bases.get(s.id)?.[index] ?? 0,
      activeIndex,
      setActiveIndex,
      pointer,
      size,
      legendHeight,
      setLegendHeight,
      tooltipPayload,
      legendPayload,
      label: () => {
        const index = activeIndex()
        const key = xKey()
        return index === undefined || key === undefined ? undefined : data()[index]?.[key]
      },
    }

    const indexAt = (x: number) => {
      const p = plot()
      if (x < p.x || x > p.x + p.width || data().length === 0) return undefined
      return Math.min(data().length - 1, Math.floor(((x - p.x) / p.width) * data().length))
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      setPointer({ x, y })
      setActiveIndex(indexAt(x))
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!props.accessibilityLayer) return
      const n = data().length
      if (event.key === "ArrowRight") setActiveIndex((i) => Math.min(n - 1, (i ?? -1) + 1))
      else if (event.key === "ArrowLeft") setActiveIndex((i) => Math.max(0, (i ?? n) - 1))
      else return
      event.preventDefault()
    }

    return (
      <ChartStateContext value={state}>
        <div
          class={["recharts-wrapper", props.class].filter(Boolean).join(" ")}
          style={{ position: "relative", width: `${size().width}px`, height: `${size().height}px` }}
          onPointerMove={onPointerMove}
          onPointerLeave={() => {
            setActiveIndex(undefined)
            setPointer(undefined)
          }}
        >
          <svg
            class={`recharts-surface ${sx(styles.surface)}`}
            width={size().width}
            height={size().height}
            viewBox={`0 0 ${size().width} ${size().height}`}
            role={props.accessibilityLayer ? "application" : undefined}
            tabindex={props.accessibilityLayer ? 0 : undefined}
            onKeyDown={onKeyDown}
            onBlur={() => setActiveIndex(undefined)}
            style={{ display: "block", overflow: "visible" }}
          >
            {props.children}
          </svg>
          {overlay}
        </div>
      </ChartStateContext>
    )
  }
}

export const BarChart = createCartesianChart("bar")
export const LineChart = createCartesianChart("line")
export const AreaChart = createCartesianChart("area")

// --- series -----------------------------------------------------------------------------------

function useSeries(
  kind: SeriesKind,
  props: { dataKey: string; name?: string; stackId?: string; hide?: boolean },
  color: () => string,
) {
  const chart = useChartState()
  // Getters, so a changing `dataKey`/`fill` (e.g. the interactive bar chart) stays tracked.
  const series: Series = {
    id: -1,
    kind,
    get dataKey() {
      return props.dataKey
    },
    get name() {
      return props.name
    },
    get stackId() {
      return props.stackId
    },
    get hide() {
      return props.hide
    },
    color,
  }
  const unregister = chart.register(series)
  onSettled(() => unregister)
  return { chart, series }
}

type Radius = number | [number, number, number, number]

function roundedRect(x: number, y: number, w: number, h: number, radius: Radius = 0) {
  if (h <= 0 || w <= 0) return ""
  const [tl, tr, br, bl] = (Array.isArray(radius) ? radius : [radius, radius, radius, radius]).map((r) =>
    Math.max(0, Math.min(r, w / 2, h / 2)),
  )
  return [
    `M${x + tl},${y}`,
    `H${x + w - tr}`,
    tr ? `A${tr},${tr} 0 0 1 ${x + w},${y + tr}` : "",
    `V${y + h - br}`,
    br ? `A${br},${br} 0 0 1 ${x + w - br},${y + h}` : "",
    `H${x + bl}`,
    bl ? `A${bl},${bl} 0 0 1 ${x},${y + h - bl}` : "",
    `V${y + tl}`,
    tl ? `A${tl},${tl} 0 0 1 ${x + tl},${y}` : "",
    "Z",
  ].join("")
}

export type BarProps = {
  dataKey: string
  name?: string
  fill?: string
  radius?: Radius
  stackId?: string
  hide?: boolean
  fillOpacity?: number
}

export function Bar(props: BarProps) {
  const { chart, series } = useSeries("bar", props, () => props.fill ?? "#8884d8")

  // Bars of one category: stacks share a slot, other bars get their own.
  const slots = createMemo(() => {
    const keys: string[] = []
    for (const s of chart.series()) {
      if (s.kind !== "bar") continue
      const key = s.stackId ? `stack:${s.stackId}` : `bar:${s.id}`
      if (!keys.includes(key)) keys.push(key)
    }
    return keys
  })

  const self = () => (chart.series().includes(series) ? series : undefined)

  const geometry = (index: number) => {
    const s = self()
    if (!s) return ""
    const band = chart.band(index)
    const gap = 4
    const inner = band.width * 0.8
    const count = slots().length
    const width = Math.max(1, (inner - gap * (count - 1)) / count)
    const slot = slots().indexOf(s.stackId ? `stack:${s.stackId}` : `bar:${s.id}`)
    const x = band.x + band.width * 0.1 + slot * (width + gap)
    const base = chart.stackBase(s, index)
    const value = Number(chart.data()[index]?.[props.dataKey]) || 0
    const y0 = chart.yScale(base)
    const y1 = chart.yScale(base + value)
    return roundedRect(x, Math.min(y0, y1), width, Math.abs(y0 - y1), props.radius)
  }

  return (
    <Show when={!props.hide}>
      <g class="recharts-layer recharts-bar">
        <For each={chart.data()}>
          {(_, index) => (
            <path
              class="recharts-rectangle"
              d={geometry(index())}
              fill={props.fill ?? "#8884d8"}
              fill-opacity={props.fillOpacity}
            />
          )}
        </For>
      </g>
    </Show>
  )
}

export type LineProps = {
  dataKey: string
  name?: string
  type?: CurveType
  stroke?: string
  strokeWidth?: number
  dot?: boolean
  hide?: boolean
}

export function Line(props: LineProps) {
  const { chart } = useSeries("line", props, () => props.stroke ?? "#3182bd")
  const points = () =>
    chart.data().map((d, i): Point => [chart.xAt(i), chart.yScale(Number(d[props.dataKey]) || 0)])
  return (
    <Show when={!props.hide}>
      <g class="recharts-layer recharts-line">
        <path
          class="recharts-curve recharts-line-curve"
          d={curvePath(points(), props.type ?? "linear")}
          fill="none"
          stroke={props.stroke ?? "#3182bd"}
          stroke-width={props.strokeWidth ?? 1}
        />
        <Show when={props.dot !== false}>
          <For each={points()} keyed={false}>
            {(point) => (
              <circle
                class="recharts-dot"
                cx={point()[0]}
                cy={point()[1]}
                r={3}
                fill="#fff"
                stroke={props.stroke ?? "#3182bd"}
                stroke-width={props.strokeWidth ?? 1}
              />
            )}
          </For>
        </Show>
      </g>
    </Show>
  )
}

export type AreaProps = {
  dataKey: string
  name?: string
  type?: CurveType
  fill?: string
  fillOpacity?: number
  stroke?: string
  strokeWidth?: number
  stackId?: string
  hide?: boolean
}

export function Area(props: AreaProps) {
  const { chart, series } = useSeries("area", props, () => props.stroke ?? props.fill ?? "#3182bd")
  const self = () => (chart.series().includes(series) ? series : undefined)
  const top = () =>
    chart.data().map((d, i): Point => {
      const s = self()
      const base = s ? chart.stackBase(s, i) : 0
      return [chart.xAt(i), chart.yScale(base + (Number(d[props.dataKey]) || 0))]
    })
  const bottom = () =>
    chart.data().map((_, i): Point => {
      const s = self()
      return [chart.xAt(i), chart.yScale(s ? chart.stackBase(s, i) : 0)]
    })
  const areaPath = () => {
    const t = top()
    if (t.length === 0) return ""
    const b = bottom().reverse()
    const stacked = !!props.stackId
    const lower = stacked ? curvePath(b, props.type ?? "linear").replace(/^M/, "L") : `L${b[0][0]},${b[0][1]}L${b[b.length - 1][0]},${b[b.length - 1][1]}`
    return `${curvePath(t, props.type ?? "linear")}${lower}Z`
  }
  return (
    <Show when={!props.hide}>
      <g class="recharts-layer recharts-area">
        <path class="recharts-curve recharts-area-area" d={areaPath()} fill={props.fill ?? "#3182bd"} fill-opacity={props.fillOpacity ?? 0.6} stroke="none" />
        <path
          class="recharts-curve recharts-area-curve"
          d={curvePath(top(), props.type ?? "linear")}
          fill="none"
          stroke={props.stroke ?? props.fill ?? "#3182bd"}
          stroke-width={props.strokeWidth ?? 1}
        />
      </g>
    </Show>
  )
}

// --- axes and grid ----------------------------------------------------------------------------

export type XAxisProps = {
  dataKey: string
  tickLine?: boolean
  axisLine?: boolean
  tickMargin?: number
  minTickGap?: number
  tickFormatter?: (value: any, index: number) => string
  hide?: boolean
}

export function XAxis(props: XAxisProps) {
  const chart = useChartState()
  chart.setXKey(props.dataKey)

  // Like recharts' default interval ("preserveEnd"): skip labels that would overlap.
  const ticks = createMemo(() => {
    const labels = chart.data().map((d, i) => {
      const value = d[props.dataKey]
      return props.tickFormatter ? props.tickFormatter(value, i) : String(value ?? "")
    })
    const minGap = props.minTickGap ?? 5
    const shown: { index: number; label: string }[] = []
    let lastEnd = Infinity
    for (let i = labels.length - 1; i >= 0; i--) {
      const width = labels[i].length * 6.5
      const center = chart.xAt(i)
      if (center + width / 2 + minGap <= lastEnd) {
        shown.unshift({ index: i, label: labels[i] })
        lastEnd = center - width / 2
      }
    }
    return shown
  })

  const y = () => chart.plot().y + chart.plot().height
  return (
    <Show when={!props.hide}>
      <g class="recharts-layer recharts-cartesian-axis recharts-xAxis xAxis">
        <Show when={props.axisLine !== false}>
          <line
            class="recharts-cartesian-axis-line"
            x1={chart.plot().x}
            x2={chart.plot().x + chart.plot().width}
            y1={y()}
            y2={y()}
            stroke="#666"
          />
        </Show>
        <g class="recharts-cartesian-axis-ticks">
          <For each={ticks()} keyed={(tick) => tick.index}>
            {(tickAccessor) => (
              <g class="recharts-layer recharts-cartesian-axis-tick">
                <Show when={props.tickLine !== false}>
                  <line
                    class="recharts-cartesian-axis-tick-line"
                    x1={chart.xAt(tickAccessor().index)}
                    x2={chart.xAt(tickAccessor().index)}
                    y1={y()}
                    y2={y() + 6}
                    stroke="#666"
                  />
                </Show>
                <text
                  class={`recharts-text recharts-cartesian-axis-tick-value ${sx(styles.tickText)}`}
                  x={chart.xAt(tickAccessor().index)}
                  y={y() + (props.tickLine !== false ? 6 : 0) + (props.tickMargin ?? 2)}
                  text-anchor="middle"
                  dominant-baseline="hanging"
                  fill="#666"
                >
                  {tickAccessor().label}
                </text>
              </g>
            )}
          </For>
        </g>
      </g>
    </Show>
  )
}

export type YAxisProps = {
  tickLine?: boolean
  axisLine?: boolean
  tickMargin?: number
  tickFormatter?: (value: number, index: number) => string
  width?: number
  hide?: boolean
}

export function YAxis(props: YAxisProps) {
  const chart = useChartState()
  if (!props.hide) chart.setYAxisWidth(props.width ?? 60)
  const x = () => chart.plot().x
  return (
    <Show when={!props.hide}>
      <g class="recharts-layer recharts-cartesian-axis recharts-yAxis yAxis">
        <Show when={props.axisLine !== false}>
          <line
            class="recharts-cartesian-axis-line"
            x1={x()}
            x2={x()}
            y1={chart.plot().y}
            y2={chart.plot().y + chart.plot().height}
            stroke="#666"
          />
        </Show>
        <For each={chart.yTicks()}>
          {(tick, index) => (
            <g class="recharts-layer recharts-cartesian-axis-tick">
              <text
                class={`recharts-text recharts-cartesian-axis-tick-value ${sx(styles.tickText)}`}
                x={x() - (props.tickLine !== false ? 6 : 0) - (props.tickMargin ?? 2)}
                y={chart.yScale(tick)}
                text-anchor="end"
                dominant-baseline="middle"
                fill="#666"
              >
                {props.tickFormatter ? props.tickFormatter(tick, index()) : String(tick)}
              </text>
            </g>
          )}
        </For>
      </g>
    </Show>
  )
}

export type CartesianGridProps = { vertical?: boolean; horizontal?: boolean; strokeDasharray?: string }

export function CartesianGrid(props: CartesianGridProps) {
  const chart = useChartState()
  return (
    <g class="recharts-cartesian-grid">
      <Show when={props.horizontal !== false}>
        <g class="recharts-cartesian-grid-horizontal">
          <For each={chart.yTicks()}>
            {(tick) => (
              <line
                x1={chart.plot().x}
                x2={chart.plot().x + chart.plot().width}
                y1={chart.yScale(tick)}
                y2={chart.yScale(tick)}
                stroke="#ccc"
                class={sx(styles.gridLine)}
                stroke-dasharray={props.strokeDasharray}
                fill="none"
              />
            )}
          </For>
        </g>
      </Show>
      <Show when={props.vertical !== false}>
        <g class="recharts-cartesian-grid-vertical">
          <For each={chart.data()}>
            {(_, index) => (
              <line
                x1={chart.xAt(index())}
                x2={chart.xAt(index())}
                y1={chart.plot().y}
                y2={chart.plot().y + chart.plot().height}
                stroke="#ccc"
                class={sx(styles.gridLine)}
                stroke-dasharray={props.strokeDasharray}
                fill="none"
              />
            )}
          </For>
        </g>
      </Show>
    </g>
  )
}

// --- tooltip and legend -----------------------------------------------------------------------

/** What tooltip content receives (recharts passes these to `content`). */
export type TooltipState = { active: boolean; payload: TooltipPayloadItem[]; label: unknown }
export const TooltipStateContext = createContext<() => TooltipState>()
export const LegendStateContext = createContext<() => { payload: LegendPayloadItem[]; verticalAlign: "top" | "bottom" }>()

export type TooltipProps = {
  /** Rendered while a category is active; reads `TooltipStateContext` (e.g. `<ChartTooltipContent />`). */
  content?: JSX.Element
  cursor?: boolean
}

export function Tooltip(props: TooltipProps) {
  const chart = useChartState()
  const state = (): TooltipState => ({
    active: chart.activeIndex() !== undefined,
    payload: chart.tooltipPayload(),
    label: chart.label(),
  })
  const [box, setBox] = createSignal({ width: 0, height: 0 })
  let el: HTMLDivElement | undefined

  const position = () => {
    const p = chart.pointer()
    const index = chart.activeIndex()
    const size = chart.size()
    const x = p?.x ?? (index !== undefined ? chart.xAt(index) : 0)
    const y = p?.y ?? chart.plot().y
    const { width, height } = box()
    let left = x + 10
    if (left + width > size.width) left = Math.max(0, x - 10 - width)
    let top = y + 10
    if (top + height > size.height) top = Math.max(0, size.height - height)
    return { left, top }
  }

  onSettled(() => {
    if (!el) return
    const observer = new ResizeObserver(() => {
      if (el) setBox({ width: el.offsetWidth, height: el.offsetHeight })
    })
    observer.observe(el)
    return () => observer.disconnect()
  })

  const cursor = () => {
    const index = chart.activeIndex()
    if (index === undefined || props.cursor === false) return null
    const plot = chart.plot()
    if (chart.kind === "bar") {
      const band = chart.band(index)
      return <rect class={`recharts-rectangle recharts-tooltip-cursor ${sx(styles.cursorRect)}`} x={band.x} y={plot.y} width={band.width} height={plot.height} fill="#ccc" />
    }
    const x = chart.xAt(index)
    return <path class={`recharts-curve recharts-tooltip-cursor ${sx(styles.cursorLine)}`} d={`M${x},${plot.y}L${x},${plot.y + plot.height}`} stroke="#ccc" fill="none" />
  }

  return (
    <TooltipStateContext value={state}>
      {/* The cursor goes behind the series: Tooltip is placed before them in recharts' layers. */}
      <g class="recharts-tooltip-cursor-layer">{cursor()}</g>
      <Portal mount={chart.overlay}>
        <HtmlBox
          ref={(node) => (el = node)}
          class="recharts-tooltip-wrapper"
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            transform: `translate(${position().left}px, ${position().top}px)`,
            visibility: state().active ? "visible" : "hidden",
            "pointer-events": "none",
            "white-space": "nowrap",
            width: "max-content",
          }}
        >
          {props.content}
        </HtmlBox>
      </Portal>
    </TooltipStateContext>
  )
}

export type LegendProps = { content?: JSX.Element; verticalAlign?: "top" | "bottom" }

export function Legend(props: LegendProps) {
  const chart = useChartState()
  let el: HTMLDivElement | undefined
  onSettled(() => {
    if (!el) return
    const observer = new ResizeObserver(() => {
      if (el) chart.setLegendHeight(el.offsetHeight)
    })
    observer.observe(el)
    return () => observer.disconnect()
  })
  const top = () => ((props.verticalAlign ?? "bottom") === "top" ? 0 : chart.size().height - chart.legendHeight())
  return (
    <LegendStateContext value={() => ({ payload: chart.legendPayload(), verticalAlign: props.verticalAlign ?? "bottom" })}>
      <Portal mount={chart.overlay}>
        <HtmlBox
          ref={(node) => (el = node)}
          class="recharts-legend-wrapper"
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: `${chart.size().width}px`,
            transform: `translateY(${top()}px)`,
            "pointer-events": "auto",
          }}
        >
          {props.content}
        </HtmlBox>
      </Portal>
    </LegendStateContext>
  )
}

/** The tooltip's and legend's wrapper in the overlay. */
function HtmlBox(props: { ref: (el: HTMLDivElement) => void; class: string; style: JSX.CSSProperties; children?: JSX.Element }) {
  return (
    <div ref={props.ref} class={props.class} style={props.style}>
      {props.children}
    </div>
  )
}

export function useTooltipState() {
  return useContext(TooltipStateContext)
}

export function useLegendState() {
  return useContext(LegendStateContext)
}

