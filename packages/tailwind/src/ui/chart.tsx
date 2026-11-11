import { createContext, createMemo, createSignal, createUniqueId, For, omit, onSettled, Show, useContext, type Component } from "solid-js"
import { Dynamic, type JSX } from "@solidjs/web"
import { cn } from "../lib/utils"
import {
  ChartSizeContext,
  Legend,
  Tooltip,
  useLegendState,
  useTooltipState,
  type LegendPayloadItem,
  type TooltipPayloadItem,
} from "../lib/chart-primitives"

// shadcn's chart API over lib/chart-primitives.tsx (small SVG charts) instead of recharts.

// Format: { THEME_NAME: CSS_SELECTOR }
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

type ChartContainerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string
  config: ChartConfig
  initialDimension?: { width: number; height: number }
}

function ChartContainer(props: ChartContainerProps) {
  const rest = omit(props, "id", "class", "children", "config", "initialDimension")
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

  return (
    <ChartContext
      value={{
        get config() {
          return props.config
        },
      }}
    >
      <div
        data-slot="chart"
        data-chart={chartId()}
        class={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          props.class,
        )}
        {...rest}
      >
        <ChartStyle id={chartId()} config={props.config} />
        <div
          ref={responsive}
          class="recharts-responsive-container"
          style={{ width: "100%", height: "100%", "min-width": "0", position: "relative" }}
        >
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

    return Object.entries(THEMES)
      .map(
        ([theme, prefix]) => `
${prefix} [data-chart=${props.id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`,
      )
      .join("\n")
  })

  return (
    <Show when={css()}>
      <style>{css()}</style>
    </Show>
  )
}

const ChartTooltip = Tooltip

type ChartTooltipContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "color"> & {
  class?: string
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
      return <div class={cn("font-medium", props.labelClassName)}>{props.labelFormatter(value, payload())}</div>
    }

    if (!value) {
      return null
    }

    return <div class={cn("font-medium", props.labelClassName)}>{value}</div>
  }

  const nestLabel = () => payload().length === 1 && indicator() !== "dot"

  return (
    <Show when={active() && payload().length}>
      <div
        class={cn(
          "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          props.class,
        )}
      >
        {!nestLabel() ? tooltipLabel() : null}
        <div class="grid gap-1.5">
          <For each={payload().filter((item) => item.type !== "none")}>
            {(item, index) => {
              const key = () => `${props.nameKey ?? item.name ?? item.dataKey ?? "value"}`
              const itemConfig = () => getPayloadConfigFromPayload(chart.config, item, key())
              const indicatorColor = () => props.color ?? (item.payload?.fill as string | undefined) ?? item.color

              return (
                <div
                  class={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                    indicator() === "dot" && "items-center",
                  )}
                >
                  <Show
                    when={props.formatter && item?.value !== undefined && item.name}
                    fallback={
                      <>
                        <Show
                          when={itemConfig()?.icon}
                          fallback={
                            <Show when={!props.hideIndicator}>
                              <div
                                class={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
                                  "h-2.5 w-2.5": indicator() === "dot",
                                  "w-1": indicator() === "line",
                                  "w-0 border-[1.5px] border-dashed bg-transparent": indicator() === "dashed",
                                  "my-0.5": nestLabel() && indicator() === "dashed",
                                })}
                                style={{ "--color-bg": indicatorColor(), "--color-border": indicatorColor() }}
                              />
                            </Show>
                          }
                        >
                          {(icon) => <Dynamic component={icon()} />}
                        </Show>
                        <div
                          class={cn("flex flex-1 justify-between leading-none", nestLabel() ? "items-end" : "items-center")}
                        >
                          <div class="grid gap-1.5">
                            {nestLabel() ? tooltipLabel() : null}
                            <span class="text-muted-foreground">{itemConfig()?.label ?? item.name}</span>
                          </div>
                          <Show when={item.value != null}>
                            <span class="font-mono font-medium text-foreground tabular-nums">
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

type ChartLegendContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string
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

  return (
    <Show when={payload().length}>
      <div class={cn("flex items-center justify-center gap-4", verticalAlign() === "top" ? "pb-3" : "pt-3", props.class)}>
        <For each={payload().filter((item) => item.type !== "none")}>
          {(item) => {
            const key = () => `${props.nameKey ?? item.dataKey ?? "value"}`
            const itemConfig = () => getPayloadConfigFromPayload(chart.config, item, key())

            return (
              <div class={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}>
                <Show
                  when={!props.hideIcon && itemConfig()?.icon}
                  fallback={<div class="h-2 w-2 shrink-0 rounded-[2px]" style={{ "background-color": item.color }} />}
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
