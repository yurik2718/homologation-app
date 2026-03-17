import { FormattedDate } from "@/components/common/FormattedDate"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types/models.d"

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "chat-box max-w-72 break-words px-3 py-2 shadow-lg sm:max-w-sm lg:max-w-md",
        isOwn
          ? "self-end rounded-[16px_16px_0_16px] bg-primary/90 text-primary-foreground/75"
          : "self-start rounded-[16px_16px_16px_0] bg-muted"
      )}
    >
      {!isOwn && (
        <span className="mb-0.5 block text-xs font-medium text-foreground/80">
          {message.user.name}
        </span>
      )}
      <p className="whitespace-pre-wrap">{message.body}</p>
      {message.attachments.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {message.attachments.map((a) => (
            <span key={a.id} className="rounded bg-background/20 px-2 py-0.5 text-xs">
              {a.filename}
            </span>
          ))}
        </div>
      )}
      <span
        className={cn(
          "mt-1 block text-xs font-light italic",
          isOwn
            ? "text-end text-primary-foreground/85"
            : "text-foreground/75"
        )}
      >
        <FormattedDate date={message.createdAt} mode="time" />
      </span>
    </div>
  )
}
