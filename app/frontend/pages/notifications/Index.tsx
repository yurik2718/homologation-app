import { useState } from "react"
import { usePage, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Bell, CheckCheck } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormattedDate } from "@/components/common/FormattedDate"
import { cn } from "@/lib/utils"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { NotificationsIndexProps, NotificationItem } from "@/types/pages"

type FilterTab = "unread" | "all"

function NotificationRow({ notification }: { notification: NotificationItem }) {
  const isUnread = !notification.readAt

  // Always delegate to the controller: it marks as read (idempotent) and
  // computes the correct destination based on role + notifiable state.
  function handleClick() {
    router.patch(routes.notification(notification.id))
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors",
        isUnread
          ? "bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted/50 opacity-60"
      )}
      onClick={handleClick}
    >
      <span
        className={cn(
          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
          isUnread ? "bg-primary" : "bg-transparent"
        )}
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-snug", isUnread ? "font-medium" : "font-normal")}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notification.body}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          <FormattedDate date={notification.createdAt} />
        </p>
      </div>
    </div>
  )
}

export default function Index() {
  const { t } = useTranslation()
  const { notifications } = usePage<SharedProps & NotificationsIndexProps>().props
  const [filter, setFilter] = useState<FilterTab>("unread")

  const unreadNotifications = notifications.filter((n) => !n.readAt)
  const hasUnread = unreadNotifications.length > 0

  const visibleNotifications = filter === "unread" ? unreadNotifications : notifications

  function handleMarkAllRead() {
    router.post(routes.markAllRead)
  }

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t("notifications.title") }]}
    >
      <Main>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{t("notifications.title")}</h1>
            {hasUnread && (
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] gap-2 w-full sm:w-auto"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-4 w-4" />
                {t("notifications.mark_all_read")}
              </Button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              className="min-h-[44px] gap-1.5"
              onClick={() => setFilter("unread")}
            >
              {t("notifications.unread")}
              {hasUnread && (
                <span className={cn(
                  "text-xs rounded-full px-1.5 py-0.5",
                  filter === "unread" ? "bg-primary-foreground/20" : "bg-muted"
                )}>
                  {unreadNotifications.length}
                </span>
              )}
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              className="min-h-[44px] gap-1.5"
              onClick={() => setFilter("all")}
            >
              {t("notifications.all")}
              <span className={cn(
                "text-xs rounded-full px-1.5 py-0.5",
                filter === "all" ? "bg-primary-foreground/20" : "bg-muted"
              )}>
                {notifications.length}
              </span>
            </Button>
          </div>

          <Card>
            <CardContent className="p-2">
              {visibleNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold mb-1">
                    {filter === "unread"
                      ? t("notifications.no_unread")
                      : t("notifications.no_notifications")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filter === "unread"
                      ? t("notifications.no_unread_hint")
                      : t("notifications.no_notifications_hint")}
                  </p>
                  {filter === "unread" && notifications.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 min-h-[44px]"
                      onClick={() => setFilter("all")}
                    >
                      {t("notifications.view_all")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {visibleNotifications.map((n) => (
                    <NotificationRow key={n.id} notification={n} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
