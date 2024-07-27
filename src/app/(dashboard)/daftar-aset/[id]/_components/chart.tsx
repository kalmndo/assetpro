"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { RouterOutputs } from "@/trpc/react"

const chartConfig = {
  in: {
    label: "In",
    color: "hsl(var(--chart-1))",
  },
  out: {
    label: "Out",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function PergerakanStokChart({ data }: { data: RouterOutputs['kartuStok']['get']['pergerakanStok'] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="in" fill="var(--color-in)" radius={4} />
        <Bar dataKey="out" fill="var(--color-out)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
