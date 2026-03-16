import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_COLORS } from "@/lib/colors"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <Badge
      variant="secondary"
      className={cn(STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700")}
    >
      {t(`requests.status.${status}`)}
    </Badge>
  )
}
