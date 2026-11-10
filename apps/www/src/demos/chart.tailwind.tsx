import { createSignal, For } from "solid-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shadcn-solid/tailwind/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  type ChartConfig,
} from "@shadcn-solid/tailwind/ui/chart"
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

export default function ChartDemo() {
  const [activeChart, setActiveChart] = createSignal<"desktop" | "mobile">("desktop")

  return (
    // `w-full`: shadcn's docs preview stretches the card; the demo pane centers its content.
    <Card class="w-full py-0 pb-4">
      <CardHeader class="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div class="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>Showing total visitors for the last 3 months</CardDescription>
        </div>
        <div class="flex">
          <For each={["desktop", "mobile"] as const}>
            {(chart) => (
              <button
                data-active={String(activeChart() === chart)}
                class="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span class="text-xs text-muted-foreground">{chartConfig[chart].label}</span>
                <span class="text-lg leading-none font-bold sm:text-3xl">{chartTotals[chart].toLocaleString()}</span>
              </button>
            )}
          </For>
        </div>
      </CardHeader>
      <CardContent class="px-2 sm:p-6">
        <ChartContainer config={chartConfig} class="aspect-auto h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={formatTick} />
            <ChartTooltip content={<ChartTooltipContent class="w-[150px]" nameKey="views" labelFormatter={formatLabel} />} />
            <Bar dataKey={activeChart()} fill={`var(--color-${activeChart()})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
