import { useTranslation } from "react-i18next"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface OverviewChartProps {
  data: Record<string, number>
}

const MONTH_KEYS_BY_LOCALE: Record<string, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
}

export function OverviewChart({ data }: OverviewChartProps) {
  const { i18n } = useTranslation()
  const monthKeys = MONTH_KEYS_BY_LOCALE[i18n.language] ?? MONTH_KEYS_BY_LOCALE.en

  const chartData = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const monthIdx = parseInt(month.split("-")[1], 10) - 1
      return { name: monthKeys[monthIdx] ?? month, total: count }
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
