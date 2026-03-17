import { router } from "@inertiajs/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/common/StatusBadge"
import { getInitials } from "@/lib/utils"
import { routes } from "@/lib/routes"
import type { RequestListItem } from "@/types/pages"

interface RecentRequestsProps {
  requests: RequestListItem[]
}

export function RecentRequests({ requests }: RecentRequestsProps) {
  return (
    <div className="space-y-8">
      {requests.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => router.visit(routes.request(r.id))}
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
