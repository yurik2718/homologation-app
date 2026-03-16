import { useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import { useChannel } from "@/hooks/useActionCable"

interface NotificationPayload {
  id: number
  title: string
  body: string | null
  createdAt: string
  unreadCount: number
}

export function NotificationBell() {
  const { unreadNotificationsCount, auth } = usePage<SharedProps>().props
  const [unreadCount, setUnreadCount] = useState(unreadNotificationsCount)

  useChannel<NotificationPayload>(
    "NotificationChannel",
    {},
    (data) => {
      setUnreadCount(data.unreadCount)
    }
  )

  if (!auth.user) return null

  return (
    <Button variant="ghost" size="sm" className="h-8 w-8 px-0 relative" asChild>
      <Link href={routes.notifications}>
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
