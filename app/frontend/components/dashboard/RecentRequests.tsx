import { useTranslation } from "react-i18next"
import { router } from "@inertiajs/react"
import { FileText } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/common/StatusBadge"
import { getInitials } from "@/lib/utils"
import { routes } from "@/lib/routes"
import type { RequestListItem } from "@/types/pages"

interface RecentRequestsProps {
  requests: RequestListItem[]
}

export function RecentRequests({ requests }: RecentRequestsProps) {
  const { t } = useTranslation()

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{t("common.no_results")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {requests.map((r) => (
        <div
          key={r.id}
          role="button"
          tabIndex={0}
          className="flex items-center gap-4 cursor-pointer rounded-md -mx-2 px-2 py-1 transition-colors hover:bg-muted/50"
          onClick={() => router.visit(routes.request(r.id))}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              router.visit(routes.request(r.id))
            }
          }}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(r.user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-wrap items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm leading-none font-medium">{r.user.name}</p>
              <p className="text-sm text-muted-foreground truncate max-w-48">
                {r.subject}
              </p>
            </div>
            <StatusBadge status={r.status} />
          </div>
        </div>
      ))}
    </div>
  )
}
