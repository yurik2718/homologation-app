// Model type declarations — added per step

export interface ChatMessage {
  id: number
  body: string
  createdAt: string
  user: {
    id: number
    name: string
    avatarUrl: string | null
  }
  attachments: Array<{
    id: number
    filename: string
  }>
}

export interface ConversationListItem {
  id: number
  type: "request" | "teacher_student"
  title: string
  otherUser: { id: number; name: string; avatarUrl: string | null } | null
  lastMessage: { body: string; createdAt: string } | null
  unread: boolean
  lastMessageAt: string | null
}

export interface ConversationFull {
  id: number
  type: "request" | "teacher_student"
  title: string
  otherUser: { id: number; name: string; avatarUrl: string | null } | null
  messages: ChatMessage[]
}
