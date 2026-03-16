import { useState, useEffect, useRef } from "react"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { useChannel } from "@/hooks/useActionCable"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SharedProps } from "@/types/index"
import type { ChatMessage } from "@/types/models.d"

interface ChatWindowProps {
  conversationId: number
  messages: ChatMessage[]
  postUrl: string
}

export function ChatWindow({ conversationId, messages: initialMessages, postUrl }: ChatWindowProps) {
  const { t } = useTranslation()
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
        // Avoid duplicates (message may arrive via both Inertia reload and WebSocket)
        if (prev.some((m) => m.id === data.id)) return prev
        return [...prev, data]
      })
    },
  )

  const handleSend = (body: string) => {
    router.post(postUrl, { body }, { preserveScroll: true })
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {t("chat.no_messages")}
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.user.id === auth.user?.id}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </ScrollArea>
      <div className="border-t p-3">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  )
}
