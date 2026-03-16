import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { FormattedDate } from "@/components/common/FormattedDate"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { routes } from "@/lib/routes"
import { cn, getInitials } from "@/lib/utils"
import type { SharedProps } from "@/types/index"
import type { ChatIndexProps } from "@/types/pages"

export default function ChatIndex() {
  const { t } = useTranslation()
  const { conversations } = usePage<SharedProps & ChatIndexProps>().props

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t("nav.chat")}</h1>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {t("chat.no_messages")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const initials = conv.otherUser ? getInitials(conv.otherUser.name) : "?"

            return (
              <Card
                key={conv.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent/50",
                  conv.unread && "border-primary/50",
                )}
                onClick={() => router.visit(routes.conversation(conv.id))}
              >
                <CardContent className="flex items-center gap-3 py-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-sm">{conv.title}</span>
                      {conv.lastMessage && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          <FormattedDate date={conv.lastMessage.createdAt} />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.lastMessage?.body ?? t("chat.no_messages")}
                      </p>
                      {conv.unread && (
                        <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
