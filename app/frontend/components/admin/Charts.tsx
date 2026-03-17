import { useTranslation } from "react-i18next"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Resolved hex — CSS variables don't work inside Recharts SVG context
const CHART_BLUE = "#3b82f6"

interface RequestsByMonthChartProps {
  data: Record<string, number>
}

export function RequestsByMonthChart({ data }: RequestsByMonthChartProps) {
  const { t, i18n } = useTranslation()

  const chartData = Object.entries(data).map(([month, count]) => ({ month, count }))

  function formatMonthLabel(month: string) {
    const [year, m] = month.split("-")
    return new Date(Number(year), Number(m) - 1, 1)
      .toLocaleDateString(i18n.language, { month: "short", year: "2-digit" })
  }

  const allZero = chartData.every((d) => d.count === 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{t("admin.charts.requests_over_time")}</CardTitle>
      </CardHeader>
      <CardContent>
        {allZero ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            {t("admin.charts.no_data")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickFormatter={formatMonthLabel}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(label: unknown) => formatMonthLabel(String(label))}
                formatter={(value: unknown) => [String(value), t("admin.charts.requests_label")]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={CHART_BLUE}
                strokeWidth={2}
                dot={{ r: 3, fill: CHART_BLUE, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  submitted: "#60a5fa",
  in_review: "#fbbf24",
  awaiting_reply: "#fb923c",
  awaiting_payment: "#a78bfa",
  payment_confirmed: "#34d399",
  in_progress: "#38bdf8",
  resolved: "#4ade80",
  closed: "#9ca3af",
}

interface RequestsByStatusChartProps {
  data: Record<string, number>
}

export function RequestsByStatusChart({ data }: RequestsByStatusChartProps) {
  const { t } = useTranslation()
  const chartData = Object.entries(data).map(([status, count]) => ({
    status: t(`requests.status.${status}`),
    count,
    color: STATUS_COLORS[status] ?? "#94a3b8",
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{t("admin.charts.by_status")}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            {t("admin.charts.no_data")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(value: unknown) => [String(value), t("admin.charts.requests_label")]} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
