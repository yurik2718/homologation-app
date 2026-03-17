import { useState, useEffect, useRef, Fragment } from "react"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { es, enUS, ru } from "date-fns/locale"
import { useChannel } from "@/hooks/useActionCable"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import type { SharedProps } from "@/types/index"
import type { ChatMessage } from "@/types/models.d"

const DATE_LOCALES: Record<string, typeof es> = { es, en: enUS, ru }

interface ChatWindowProps {
  conversationId: number
  messages: ChatMessage[]
  postUrl: string
}

export function ChatWindow({ conversationId, messages: initialMessages, postUrl }: ChatWindowProps) {
  const { t, i18n } = useTranslation()
  const { auth } = usePage<SharedProps>().props
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Sync with server props on Inertia page visit
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Subscribe to real-time messages
  useChannel<ChatMessage>(
    "ConversationChannel",
    { id: conversationId },
    (data) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev
        return [...prev, data]
      })
    },
  )

  const handleSend = (body: string) => {
    router.post(postUrl, { body }, { preserveScroll: true })
  }

  // Group messages by date
  const loc = DATE_LOCALES[i18n.language] ?? es
  const grouped = messages.reduce<Record<string, ChatMessage[]>>((acc, msg) => {
    const key = format(new Date(msg.createdAt), "d MMM, yyyy", { locale: loc })
    if (!acc[key]) acc[key] = []
    acc[key].push(msg)
    return acc
  }, {})

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 rounded-md px-4 pt-0 pb-4">
      <div className="relative min-h-0 flex-1">
        <div className="flex h-full flex-col gap-4 overflow-y-auto py-2 pe-4">
          {messages.length === 0 ? (
            <p className="self-center text-center text-sm text-muted-foreground py-8">
              {t("chat.no_messages")}
            </p>
          ) : (
            Object.keys(grouped).map((dateKey) => (
              <Fragment key={dateKey}>
                <div className="text-center text-xs text-muted-foreground">{dateKey}</div>
                {grouped[dateKey].map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.user.id === auth.user?.id}
                  />
                ))}
              </Fragment>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  )
}
