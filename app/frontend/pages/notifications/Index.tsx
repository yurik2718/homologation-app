import { usePage, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormattedDate } from "@/components/common/FormattedDate"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { NotificationsIndexProps, NotificationItem } from "@/types/pages"

function notificationUrl(n: NotificationItem): string | null {
  switch (n.notifiableType) {
    case "HomologationRequest":
      return routes.request(n.notifiableId)
    case "Lesson":
      return routes.lesson(n.notifiableId)
    case "Message":
      return routes.conversations
    default:
      return null
  }
}

function NotificationRow({ notification }: { notification: NotificationItem }) {
  const url = notificationUrl(notification)

  function handleClick() {
    if (!notification.readAt) {
      router.patch(routes.notification(notification.id))
    } else if (url) {
      router.visit(url)
    }
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${!notification.readAt ? "bg-muted/30" : ""}`}
      onClick={handleClick}
    >
      {!notification.readAt && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
      {notification.readAt && <span className="mt-1.5 h-2 w-2 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{notification.title}</p>
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

  function handleMarkAllRead() {
    router.post(routes.markAllRead)
  }

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t("nav.notifications") }]}
    >
      <Main>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{t("notifications.title")}</h1>
            {notifications.some((n) => !n.readAt) && (
              <Button variant="outline" size="sm" className="min-h-[44px]" onClick={handleMarkAllRead}>
                {t("notifications.mark_all_read")}
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-2">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  {t("notifications.no_notifications")}
                </p>
              ) : (
                <div className="divide-y">
                  {notifications.map((n) => (
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
