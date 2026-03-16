import { useTranslation } from "react-i18next"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FormattedDate } from "@/components/common/FormattedDate"
import { cn, getInitials } from "@/lib/utils"
import type { InboxConversation } from "@/types/pages"

interface ConversationItemProps {
  conversation: InboxConversation
  isSelected: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const { t } = useTranslation()
  const initials = getInitials(conversation.title)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full rounded-md px-2 py-2 text-start text-sm hover:bg-accent hover:text-accent-foreground",
        isSelected && "sm:bg-muted",
      )}
    >
      <div className="flex gap-2">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("truncate", conversation.unread && "font-semibold")}>
              {conversation.title}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="line-clamp-2 text-ellipsis text-muted-foreground group-hover:text-accent-foreground/90">
              {conversation.lastMessage?.body ?? t("chat.no_messages")}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              <FormattedDate date={conversation.lastMessage.createdAt} />
            </span>
          )}
          {conversation.unread && (
            <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />
          )}
        </div>
      </div>
    </button>
  )
}
