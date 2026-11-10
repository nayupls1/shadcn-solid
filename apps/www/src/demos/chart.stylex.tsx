import { createSignal, For } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shadcn-solid/stylex/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  type ChartConfig,
} from "@shadcn-solid/stylex/ui/chart"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"
import { chartData, chartTotals, formatLabel, formatTick } from "./lib/chart-data"

const chartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const SM = "@media (min-width: 40rem)"

export default function ChartDemo() {
  const [activeChart, setActiveChart] = createSignal<"desktop" | "mobile">("desktop")

  return (
    // `width: 100%`: shadcn's docs preview stretches the card; the demo pane centers its content.
    <Card xstyle={styles.card}>
      <CardHeader xstyle={styles.header}>
        <div {...stylex.attrs(styles.heading)}>
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>Showing total visitors for the last 3 months</CardDescription>
        </div>
        <div {...stylex.attrs(styles.toggles)}>
          <For each={["desktop", "mobile"] as const}>
            {(chart, index) => (
              <button
                data-active={String(activeChart() === chart)}
                {...stylex.attrs(styles.toggle, index() > 0 && styles.toggleEven, activeChart() === chart && styles.toggleActive)}
                onClick={() => setActiveChart(chart)}
              >
                <span {...stylex.attrs(styles.toggleLabel)}>{chartConfig[chart].label}</span>
                <span {...stylex.attrs(styles.toggleValue)}>{chartTotals[chart].toLocaleString()}</span>
              </button>
            )}
          </For>
        </div>
      </CardHeader>
      <CardContent xstyle={styles.content}>
        <ChartContainer config={chartConfig} xstyle={styles.chart}>
          <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={formatTick} />
            <ChartTooltip
              content={<ChartTooltipContent xstyle={styles.tooltip} nameKey="views" labelFormatter={formatLabel} />}
            />
            <Bar dataKey={activeChart()} fill={`var(--color-${activeChart()})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const styles = stylex.create({
  card: { width: "100%", paddingTop: 0, paddingBottom: "1rem" },
  header: {
    display: "flex",
    flexDirection: { default: "column", [SM]: "row" },
    alignItems: "stretch",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    padding: 0,
    paddingInline: 0,
  },
  heading: {
    display: "flex",
    flex: "1 1 0%",
    flexDirection: "column",
    justifyContent: "center",
    gap: "0.25rem",
    paddingInline: "1.5rem",
    paddingTop: { default: "1rem", [SM]: 0 },
    paddingBottom: { default: "0.75rem", [SM]: 0 },
  },
  toggles: { display: "flex" },
  toggle: {
    position: "relative",
    zIndex: 30,
    display: "flex",
    flex: "1 1 0%",
    flexDirection: "column",
    justifyContent: "center",
    gap: "0.25rem",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: colors.border,
    borderTopWidth: { default: 1, [SM]: 0 },
    borderLeftWidth: { default: 0, [SM]: 1 },
    backgroundColor: "transparent",
    color: "inherit",
    fontFamily: "inherit",
    paddingInline: { default: "1.5rem", [SM]: "2rem" },
    paddingBlock: { default: "1rem", [SM]: "1.5rem" },
    textAlign: "left",
    cursor: "pointer",
  },
  toggleEven: { borderLeftWidth: 1 },
  toggleActive: { backgroundColor: `color-mix(in oklch, ${colors.muted} 50%, transparent)` },
  toggleLabel: { fontSize: "0.75rem", lineHeight: "1rem", color: colors.mutedForeground },
  toggleValue: {
    fontSize: { default: "1.125rem", [SM]: "1.875rem" },
    lineHeight: 1,
    fontWeight: 700,
  },
  content: { paddingInline: { default: "0.5rem", [SM]: "1.5rem" }, paddingBlock: { default: 0, [SM]: "1.5rem" } },
  chart: { aspectRatio: "auto", height: "250px", width: "100%" },
  tooltip: { width: "150px" },
})
