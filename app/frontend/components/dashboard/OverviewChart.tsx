import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface OverviewChartProps {
  data: Record<string, number>
}

export function OverviewChart({ data }: OverviewChartProps) {

  const MONTH_KEYS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  const chartData = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const monthIdx = parseInt(month.split("-")[1], 10) - 1
      return { name: MONTH_KEYS[monthIdx] ?? month, total: count }
    })

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
