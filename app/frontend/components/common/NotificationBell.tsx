import { Link } from "@inertiajs/react"
import { Bell } from "lucide-react"
import { usePage } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"

export function NotificationBell() {
  const { unreadNotificationsCount } = usePage<SharedProps>().props

  return (
    <Button variant="ghost" size="sm" className="h-8 w-8 px-0 relative" asChild>
      <Link href={routes.notifications}>
        <Bell className="size-4" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-medium">
            {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
