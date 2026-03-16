import { FormattedDate } from "@/components/common/FormattedDate"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"
import type { ChatMessage } from "@/types/models.d"

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const initials = getInitials(message.user.name)

  return (
    <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[75%] space-y-1", isOwn && "items-end")}>
        <div className={cn("flex items-baseline gap-2", isOwn && "flex-row-reverse")}>
          <span className="text-xs font-medium">{message.user.name}</span>
          <span className="text-xs text-muted-foreground">
            <FormattedDate date={message.createdAt} />
          </span>
        </div>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted",
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        </div>
        {message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {message.attachments.map((a) => (
              <span key={a.id} className="rounded bg-muted px-2 py-0.5 text-xs">
                {a.filename}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
