import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  submitted: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  in_review: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  awaiting_reply: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  awaiting_payment: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  payment_confirmed: "bg-green-100 text-green-700 hover:bg-green-100",
  in_progress: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  resolved: "bg-green-100 text-green-700 hover:bg-green-100",
  closed: "bg-gray-100 text-gray-700 hover:bg-gray-100",
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
