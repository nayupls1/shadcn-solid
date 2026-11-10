import { createContext, createMemo, createSignal, createUniqueId, For, omit, onSettled, Show, useContext, type Component } from "solid-js"
import { Dynamic, type JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "../tokens.stylex"
import { sxMerge } from "../lib/sx"
import {
  ChartSizeContext,
  Legend,
  Tooltip,
  useLegendState,
  useTooltipState,
  type LegendPayloadItem,
  type TooltipPayloadItem,
} from "../lib/chart-primitives"

// Port of shadcn/ui's base-vega `chart` (see the Tailwind variant for the source classes) over
// lib/chart-primitives.tsx (small SVG charts) instead of recharts. ChartContainer's
// `[&_.recharts-…]` rules are applied by the primitives themselves. ChartStyle's `theme` colors
// use `light-dark()` instead of a `.dark` selector (StyleX's dark mode sets `color-scheme`).

const THEMES = { light: "", dark: ".dark" } as const

const INITIAL_DIMENSION = { width: 320, height: 200 } as const

export type ChartConfig = Record<
  string,
  {
    label?: JSX.Element
    icon?: Component
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
>

type ChartContextProps = {
  readonly config: ChartConfig
}

const ChartContext = createContext<ChartContextProps | null>(null)

function useChart() {
  const context = useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const styles = stylex.create({
  container: {
    display: "flex",
    aspectRatio: "16 / 9",
    justifyContent: "center",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  responsive: { width: "100%", height: "100%", minWidth: 0, position: "relative" },
  tooltip: {
    display: "grid",
    minWidth: "8rem",
    alignItems: "start",
    gap: "0.375rem",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: `color-mix(in oklch, ${colors.border} 50%, transparent)`,
    backgroundColor: colors.background,
    paddingInline: "0.625rem",
    paddingBlock: "0.375rem",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  label: { fontWeight: 500 },
  items: { display: "grid", gap: "0.375rem" },
  item: { display: "flex", width: "100%", flexWrap: "wrap", alignItems: "stretch", gap: "0.5rem" },
  itemCenter: { alignItems: "center" },
  indicator: {
    flexShrink: 0,
    borderRadius: "2px",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    backgroundColor: "var(--color-bg)",
  },
  indicatorDot: { width: "0.625rem", height: "0.625rem" },
  indicatorLine: { width: "0.25rem" },
  indicatorDashed: { width: 0, borderWidth: "1.5px", borderStyle: "dashed", backgroundColor: "transparent" },
  indicatorNested: { marginBlock: "0.125rem" },
  values: { display: "flex", flex: "1 1 0%", justifyContent: "space-between", lineHeight: 1 },
  valuesEnd: { alignItems: "flex-end" },
  valuesCenter: { alignItems: "center" },
  nameGroup: { display: "grid", gap: "0.375rem" },
  name: { color: colors.mutedForeground },
  value: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: 500,
    color: colors.foreground,
    fontVariantNumeric: "tabular-nums",
  },
  legend: { display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" },
  legendTop: { paddingBottom: "0.75rem" },
  legendBottom: { paddingTop: "0.75rem" },
  legendItem: { display: "flex", alignItems: "center", gap: "0.375rem" },
  swatch: { width: "0.5rem", height: "0.5rem", flexShrink: 0, borderRadius: "2px" },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type ChartContainerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> &
  XStyle & {
    config: ChartConfig
    initialDimension?: { width: number; height: number }
  }

function ChartContainer(props: ChartContainerProps) {
  const rest = omit(props, "id", "class", "style", "children", "config", "initialDimension", "xstyle")
  const uniqueId = createUniqueId()
  const chartId = () => `chart-${(typeof props.id === "string" && props.id) || uniqueId.replace(/:/g, "")}`
  const [size, setSize] = createSignal<{ width: number; height: number }>(props.initialDimension ?? INITIAL_DIMENSION)
  let responsive: HTMLDivElement | undefined

  // recharts' ResponsiveContainer: the chart takes the container's size.
  onSettled(() => {
    if (!responsive) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ width, height })
    })
    observer.observe(responsive)
    return () => observer.disconnect()
  })

  const a = () => sxMerge([styles.container, props.xstyle], props.class, props.style)

  return (
    <ChartContext
      value={{
        get config() {
          return props.config
        },
      }}
    >
      <div data-slot="chart" data-chart={chartId()} {...rest} class={a().class} style={a().style}>
        <ChartStyle id={chartId()} config={props.config} />
        <div ref={responsive} class="recharts-responsive-container" {...stylex.attrs(styles.responsive)}>
          <ChartSizeContext value={size}>{props.children}</ChartSizeContext>
        </div>
      </div>
    </ChartContext>
  )
}

function ChartStyle(props: { id: string; config: ChartConfig }) {
  const css = createMemo(() => {
    const colorConfig = Object.entries(props.config).filter(([, config]) => config.theme ?? config.color)

    if (!colorConfig.length) {
      return null
    }

    return `
[data-chart=${props.id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme ? `light-dark(${itemConfig.theme.light}, ${itemConfig.theme.dark})` : itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
  })

  return (
    <Show when={css()}>
      <style>{css()}</style>
    </Show>
  )
}

const ChartTooltip = Tooltip

type ChartTooltipContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "color"> &
  XStyle & {
    active?: boolean
    payload?: TooltipPayloadItem[]
    label?: unknown
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    labelFormatter?: (label: any, payload: TooltipPayloadItem[]) => JSX.Element
    labelClassName?: string
    /** StyleX overrides for the label. */
    labelXstyle?: stylex.StyleXStyles
    formatter?: (value: any, name: string, item: TooltipPayloadItem, index: number, payload: unknown) => JSX.Element
    color?: string
  }

/**
 * Like recharts, `active`/`payload`/`label` come from the chart's tooltip (through context) when
 * not passed, so `<ChartTooltip content={<ChartTooltipContent />} />` works as in shadcn.
 */
function ChartTooltipContent(props: ChartTooltipContentProps) {
  const chart = useChart()
  const tooltip = useTooltipState()
  const active = () => props.active ?? tooltip?.().active ?? false
  const payload = () => props.payload ?? tooltip?.().payload ?? []
  const label = () => props.label ?? tooltip?.().label
  const indicator = () => props.indicator ?? "dot"
  const labelAttrs = () => sxMerge([styles.label, props.labelXstyle], props.labelClassName)

  const tooltipLabel = () => {
    if (props.hideLabel || !payload().length) {
      return null
    }

    const [item] = payload()
    const key = `${props.labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(chart.config, item, key)
    const value =
      !props.labelKey && typeof label() === "string"
        ? (chart.config[label() as string]?.label ?? (label() as string))
        : itemConfig?.label

    if (props.labelFormatter) {
      return <div class={labelAttrs().class}>{props.labelFormatter(value, payload())}</div>
    }

    if (!value) {
      return null
    }

    return <div class={labelAttrs().class}>{value}</div>
  }

  const nestLabel = () => payload().length === 1 && indicator() !== "dot"
  const a = () => sxMerge([styles.tooltip, props.xstyle], props.class)

  return (
    <Show when={active() && payload().length}>
      <div class={a().class} style={a().style}>
        {!nestLabel() ? tooltipLabel() : null}
        <div {...stylex.attrs(styles.items)}>
          <For each={payload().filter((item) => item.type !== "none")}>
            {(item, index) => {
              const key = () => `${props.nameKey ?? item.name ?? item.dataKey ?? "value"}`
              const itemConfig = () => getPayloadConfigFromPayload(chart.config, item, key())
              const indicatorColor = () => props.color ?? (item.payload?.fill as string | undefined) ?? item.color

              return (
                <div class={sxMerge([styles.item, indicator() === "dot" && styles.itemCenter]).class}>
                  <Show
                    when={props.formatter && item?.value !== undefined && item.name}
                    fallback={
                      <>
                        <Show
                          when={itemConfig()?.icon}
                          fallback={
                            <Show when={!props.hideIndicator}>
                              <div
                                class={
                                  sxMerge([
                                    styles.indicator,
                                    indicator() === "dot" && styles.indicatorDot,
                                    indicator() === "line" && styles.indicatorLine,
                                    indicator() === "dashed" && styles.indicatorDashed,
                                    nestLabel() && indicator() === "dashed" && styles.indicatorNested,
                                  ]).class
                                }
                                style={{ "--color-bg": indicatorColor(), "--color-border": indicatorColor() }}
                              />
                            </Show>
                          }
                        >
                          {(icon) => <Dynamic component={icon()} />}
                        </Show>
                        <div class={sxMerge([styles.values, nestLabel() ? styles.valuesEnd : styles.valuesCenter]).class}>
                          <div {...stylex.attrs(styles.nameGroup)}>
                            {nestLabel() ? tooltipLabel() : null}
                            <span {...stylex.attrs(styles.name)}>{itemConfig()?.label ?? item.name}</span>
                          </div>
                          <Show when={item.value != null}>
                            <span {...stylex.attrs(styles.value)}>
                              {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)}
                            </span>
                          </Show>
                        </div>
                      </>
                    }
                  >
                    {props.formatter?.(item.value, item.name, item, index(), item.payload)}
                  </Show>
                </div>
              )
            }}
          </For>
        </div>
      </div>
    </Show>
  )
}

const ChartLegend = Legend

type ChartLegendContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> &
  XStyle & {
    hideIcon?: boolean
    nameKey?: string
    payload?: LegendPayloadItem[]
    verticalAlign?: "top" | "bottom"
  }

/** `payload`/`verticalAlign` come from the chart's legend (through context) when not passed. */
function ChartLegendContent(props: ChartLegendContentProps) {
  const chart = useChart()
  const legend = useLegendState()
  const payload = () => props.payload ?? legend?.().payload ?? []
  const verticalAlign = () => props.verticalAlign ?? legend?.().verticalAlign ?? "bottom"
  const a = () =>
    sxMerge(
      [styles.legend, verticalAlign() === "top" ? styles.legendTop : styles.legendBottom, props.xstyle],
      props.class,
    )

  return (
    <Show when={payload().length}>
      <div class={a().class} style={a().style}>
        <For each={payload().filter((item) => item.type !== "none")}>
          {(item) => {
            const key = () => `${props.nameKey ?? item.dataKey ?? "value"}`
            const itemConfig = () => getPayloadConfigFromPayload(chart.config, item, key())

            return (
              <div {...stylex.attrs(styles.legendItem)}>
                <Show
                  when={!props.hideIcon && itemConfig()?.icon}
                  fallback={<div {...stylex.attrs(styles.swatch)} style={{ "background-color": item.color }} />}
                >
                  {(icon) => <Dynamic component={icon()} />}
                </Show>
                {itemConfig()?.label}
              </div>
            )
          }}
        </For>
      </div>
    </Show>
  )
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key]
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }

// The SVG primitives, in place of recharts' components.
export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  type TooltipPayloadItem,
  type LegendPayloadItem,
} from "../lib/chart-primitives"
