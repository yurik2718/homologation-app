import { ChatWindow } from "@/components/chat/ChatWindow"
import { routes } from "@/lib/routes"
import type { InboxConversationDetail } from "@/types/pages"

interface ChatPanelProps {
  conversation: InboxConversationDetail
}

export function ChatPanel({ conversation }: ChatPanelProps) {
  return (
    <ChatWindow
      conversationId={conversation.id}
      messages={conversation.messages}
      postUrl={routes.conversationMessages(conversation.id)}
    />
  )
}
