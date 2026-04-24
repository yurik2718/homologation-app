import { useEffect, useMemo, useRef, useState } from "react"
import { Fragment } from "react/jsx-runtime"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, MessagesSquare, Info, Send, Search as SearchIcon } from "lucide-react"
import { cn, getInitials, formatDate, DATE_LOCALES } from "@/lib/utils"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useChannel } from "@/hooks/useActionCable"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { ContextPanel } from "@/components/chats/ContextPanel"
import { StatusBadge } from "@/components/common/StatusBadge"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"
import type { InboxIndexProps, InboxConversation, InboxConversationDetail } from "@/types/pages"
import type { ChatMessage } from "@/types/models.d"

type FilterType = "all" | "requests" | "teacher_chats" | "unread"

export default function ChatsIndex() {
  const { t, i18n } = useTranslation()
  const { conversations, selectedConversation: initialSelected = null } =
    usePage<SharedProps & InboxIndexProps>().props
  const { auth } = usePage<SharedProps>().props

  const [selected, setSelected] = useState<InboxConversationDetail | null>(initialSelected)
  const [mobileSelected, setMobileSelected] = useState<InboxConversationDetail | null>(
    initialSelected
  )
  const [contextOpen, setContextOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [messages, setMessages] = useState<ChatMessage[]>(initialSelected?.messages ?? [])
  const [msgBody, setMsgBody] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync messages when selected conversation changes from server
  useEffect(() => {
    if (selected?.messages) setMessages(selected.messages)
  }, [selected?.id])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "0"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [msgBody])

  // Persist each chat's draft under its own key. Immediate write on switch so we
  // capture the outgoing chat's text before loading the new one; debounced write
  // on keystroke to avoid hitting localStorage per character.
  const currentChatIdRef = useRef<number | null>(null)
  const persistHandleRef = useRef<number | null>(null)
  const msgBodyRef = useRef(msgBody)
  msgBodyRef.current = msgBody

  useEffect(() => {
    const prevId = currentChatIdRef.current
    const newId = selected?.id ?? null

    if (prevId !== newId) {
      if (persistHandleRef.current !== null) {
        window.clearTimeout(persistHandleRef.current)
        persistHandleRef.current = null
      }
      if (prevId !== null) {
        const prevKey = `chatDraft:${prevId}`
        if (msgBody) localStorage.setItem(prevKey, msgBody)
        else localStorage.removeItem(prevKey)
      }
      currentChatIdRef.current = newId
      setMsgBody(newId !== null ? (localStorage.getItem(`chatDraft:${newId}`) ?? "") : "")
    } else if (newId !== null) {
      if (persistHandleRef.current !== null) window.clearTimeout(persistHandleRef.current)
      const key = `chatDraft:${newId}`
      persistHandleRef.current = window.setTimeout(() => {
        if (msgBody) localStorage.setItem(key, msgBody)
        else localStorage.removeItem(key)
        persistHandleRef.current = null
      }, 300)
    }
  }, [selected?.id, msgBody])

  // Flush pending draft on tab close / unmount so a fast close after typing
  // doesn't drop the last 300ms of keystrokes.
  useEffect(() => {
    const flush = () => {
      if (persistHandleRef.current === null) return
      window.clearTimeout(persistHandleRef.current)
      persistHandleRef.current = null
      const id = currentChatIdRef.current
      if (id === null) return
      const key = `chatDraft:${id}`
      if (msgBodyRef.current) localStorage.setItem(key, msgBodyRef.current)
      else localStorage.removeItem(key)
    }
    window.addEventListener("beforeunload", flush)
    return () => {
      window.removeEventListener("beforeunload", flush)
      flush()
    }
  }, [])

  // Autofocus on chat open — but not on touch devices, where it opens the soft keyboard.
  useEffect(() => {
    if (!selected || loading) return
    if (!window.matchMedia("(pointer: fine)").matches) return
    textareaRef.current?.focus()
  }, [selected?.id, loading])

  // Subscribe to real-time messages (only when a conversation is selected)
  useChannel<ChatMessage>(
    "ConversationChannel",
    { id: selected?.id ?? 0 },
    (data) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev
        // Replace optimistic message (negative temp id) with the real one
        const tempIdx = prev.findIndex(
          (m) => m.id < 0 && m.body === data.body && m.user.id === data.user.id,
        )
        if (tempIdx !== -1) {
          const next = [...prev]
          next[tempIdx] = data
          return next
        }
        return [...prev, data]
      })
    },
    !!selected,
  )

  const handleSelect = (chatConv: InboxConversation) => {
    setLoading(true)
    router.visit(routes.chat(chatConv.id), {
      preserveState: true,
      only: ["selectedConversation", "conversations"],
      onSuccess: (page) => {
        const props = page.props as { selectedConversation?: InboxConversationDetail }
        if (props.selectedConversation) {
          setSelected(props.selectedConversation)
          setMobileSelected(props.selectedConversation)
        }
        setLoading(false)
      },
      onError: () => setLoading(false),
    })
  }

  const handleSend = () => {
    const trimmed = msgBody.trim()
    if (!trimmed || !selected) return
    const savedBody = trimmed
    setMsgBody("")

    // Optimistic update — show message instantly
    const optimisticId = -Date.now()
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      body: savedBody,
      createdAt: new Date().toISOString(),
      user: {
        id: auth.user!.id,
        name: auth.user!.name,
        avatarUrl: auth.user!.avatarUrl,
      },
      attachments: [],
    }
    setMessages((prev) => [...prev, optimisticMsg])

    router.post(
      routes.conversationMessages(selected.id),
      { body: savedBody },
      {
        preserveScroll: true,
        preserveState: true,
        onError: () => {
          // Remove optimistic message and restore input
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
          setMsgBody(savedBody)
        },
      },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Filter conversations
  const filtered = conversations.filter((c) => {
    if (filter === "requests" && c.type !== "request") return false
    if (filter === "teacher_chats" && c.type !== "teacher_student") return false
    if (filter === "unread" && !c.unread) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const filterCounts = useMemo(() => {
    const counts = { all: 0, requests: 0, teacher_chats: 0, unread: 0 }
    for (const c of conversations) {
      counts.all++
      if (c.type === "request") counts.requests++
      else if (c.type === "teacher_student") counts.teacher_chats++
      if (c.unread) counts.unread++
    }
    return counts
  }, [conversations])

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("chats.all") },
    { key: "requests", label: t("chats.requests_filter") },
    { key: "teacher_chats", label: t("chats.teacher_chats") },
    { key: "unread", label: t("chats.unread_only") },
  ]

  // Group messages by date (memoized)
  const loc = DATE_LOCALES[i18n.language] ?? es
  const groupedMessages = useMemo(
    () =>
      messages.reduce<Record<string, ChatMessage[]>>((acc, msg) => {
        const key = format(new Date(msg.createdAt), "d MMM, yyyy", { locale: loc })
        if (!acc[key]) acc[key] = []
        acc[key].push(msg)
        return acc
      }, {}),
    [messages, loc],
  )

  // For teacher_student chats the title already reads "Teacher — Student",
  // so we don't repeat it as the subtitle.
  const headerPrimary = selected
    ? (selected.context.type === "request"
        ? (selected.otherUser?.name ?? selected.title)
        : selected.title)
    : null
  const headerSubtitle = selected
    ? (selected.context.type === "request"
        ? selected.context.subject
        : t("chats.teacher_chat_label"))
    : null

  return (
    <AuthenticatedLayout breadcrumbs={[{ label: t("nav.chats") }]} fixedHeight>
      <Main fixed>
        <section className="flex flex-1 min-h-0">
          {/* ─── Left: Conversation List ─── */}
          <div className={cn(
            "flex w-full flex-col sm:w-64 lg:w-72 2xl:w-80 min-h-0 sm:border-r",
            mobileSelected && "hidden sm:flex"
          )}>
            {/* Header */}
            <div className="shrink-0 px-3 pt-2 pb-1">
              <div className="flex items-center gap-2 py-2">
                <h1 className="text-2xl font-bold tracking-tight">{t("chats.title")}</h1>
                <MessagesSquare size={20} className="text-muted-foreground" />
              </div>

              <label
                className={cn(
                  "focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden",
                  "flex h-9 w-full items-center rounded-md border border-border bg-muted/40 ps-2.5"
                )}
              >
                <SearchIcon size={14} className="me-2 text-muted-foreground" />
                <span className="sr-only">{t("common.search")}</span>
                <input
                  type="text"
                  className="w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden"
                  placeholder={t("chats.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            {/* Filters */}
            <div className="shrink-0 flex gap-1 px-3 py-1.5">
              {filters.map((f) => (
                <Button
                  key={f.key}
                  variant={filter === f.key ? "secondary" : "ghost"}
                  size="sm"
                  className="min-h-[44px] text-xs px-2.5 rounded-full sm:min-h-0 sm:h-7"
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                  {filterCounts[f.key] > 0 && (
                    <span className="ml-1 text-muted-foreground">
                      {filterCounts[f.key]}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* Conversation list */}
            <ScrollArea className="flex-1 min-h-0">
              {filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">{t("chats.no_conversations")}</p>
              ) : (
                <div className="px-1.5">
                  {filtered.map((c) => {
                    const isActive = selected?.id === c.id
                    // Prefer the other person's name — request-subject initials repeat
                    // across chats, so they're hard to scan by face.
                    const displayName = c.otherUser?.name ?? c.title
                    const initials = getInitials(displayName)
                    const preview = c.lastMessage
                      ? (c.lastMessage.authorIsMe
                          ? t("chats.you_prefix", { body: c.lastMessage.body })
                          : c.lastMessage.body)
                      : t("chat.no_messages")
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={cn(
                          "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-start transition-colors min-h-[44px]",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted/60"
                        )}
                        onClick={() => handleSelect(c)}
                      >
                        <Avatar className="size-10 shrink-0">
                          <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className={cn(
                              "truncate text-sm",
                              c.unread ? "font-semibold" : "font-medium"
                            )}>
                              {displayName}
                            </span>
                            {c.lastMessage && (
                              <span className="shrink-0 text-[11px] text-muted-foreground">
                                {formatDate(c.lastMessage.createdAt, "short", i18n.language, t("chats.yesterday"))}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className={cn(
                              "truncate text-xs",
                              c.unread
                                ? "font-medium text-foreground/80"
                                : "text-muted-foreground"
                            )}>
                              {preview}
                            </p>
                            {c.unreadCount > 0 && (
                              <span
                                role="status"
                                aria-label={t("chats.unread_count_sr", { count: c.unreadCount })}
                                className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
                              >
                                <span aria-hidden="true">
                                  {c.unreadCount > 99 ? "99+" : c.unreadCount}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* ─── Right: Chat Area ─── */}
          {selected ? (
            <div
              className={cn(
                "absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col bg-background sm:static sm:z-auto sm:flex",
                mobileSelected && "left-0 flex"
              )}
            >
              {loading ? (
                /* Loading skeleton */
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-3 border-b p-4">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 p-4">
                    <Skeleton className="ml-auto h-10 w-48 rounded-2xl" />
                    <Skeleton className="h-10 w-56 rounded-2xl" />
                    <Skeleton className="ml-auto h-10 w-40 rounded-2xl" />
                    <Skeleton className="h-10 w-64 rounded-2xl" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex flex-none items-center justify-between border-b bg-card/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="-ms-2 size-11 sm:hidden"
                        onClick={() => {
                          setMobileSelected(null)
                          setSelected(null)
                        }}
                      >
                        <ArrowLeft />
                      </Button>
                      <Avatar className="size-9 lg:size-10">
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(headerPrimary ?? selected.title)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold lg:text-base">
                            {headerPrimary}
                          </p>
                          {selected.context.type === "request" && (
                            <StatusBadge status={selected.context.status} />
                          )}
                        </div>
                        {headerSubtitle && (
                          <p className="truncate text-xs text-muted-foreground lg:text-sm">
                            {headerSubtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-9"
                      onClick={() => setContextOpen(!contextOpen)}
                    >
                      <Info size={18} className="text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Context panel (collapsible) */}
                  {contextOpen && (
                    <div className="shrink-0 border-b max-h-64 overflow-y-auto sm:max-h-72">
                      <ContextPanel key={selected.id} conversation={selected} />
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex flex-1 flex-col min-h-0">
                    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
                      <div className="flex flex-col justify-end gap-3 min-h-full">
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-muted p-3 mb-3">
                              <MessagesSquare className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t("chat.no_messages")}
                            </p>
                          </div>
                        ) : (
                          Object.keys(groupedMessages).map((key) => (
                            <Fragment key={key}>
                              <div className="flex justify-center py-2">
                                <span className="rounded-full bg-muted/80 px-3 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {key}
                                </span>
                              </div>
                              {groupedMessages[key].map((msg) => (
                                <MessageBubble
                                  key={msg.id}
                                  message={msg}
                                  isOwn={msg.user.id === auth.user?.id}
                                />
                              ))}
                            </Fragment>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Input */}
                    <div className="shrink-0 border-t bg-card/50 px-4 py-3">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSend()
                        }}
                        className="flex items-end gap-2"
                      >
                        <label className="flex-1 rounded-xl border border-input bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
                          <span className="sr-only">{t("chat.type_message")}</span>
                          <textarea
                            ref={textareaRef}
                            placeholder={t("chat.type_message")}
                            className="block w-full resize-none bg-inherit text-sm leading-5 focus-visible:outline-hidden"
                            rows={1}
                            value={msgBody}
                            onChange={(e) => setMsgBody(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ maxHeight: 120 }}
                          />
                        </label>
                        <Button
                          type="submit"
                          size="icon"
                          disabled={!msgBody.trim()}
                          className="size-10 shrink-0 rounded-full"
                        >
                          <Send size={18} />
                        </Button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="hidden flex-1 flex-col items-center justify-center sm:flex">
              <div className="rounded-full bg-muted p-5 mb-4">
                <MessagesSquare className="size-10 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold">{t("chats.your_messages")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("chats.select_chat")}
              </p>
            </div>
          )}
        </section>
      </Main>
    </AuthenticatedLayout>
  )
}
