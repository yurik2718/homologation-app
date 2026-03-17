import { useEffect, useState } from "react"
import { Fragment } from "react/jsx-runtime"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { es, enUS, ru } from "date-fns/locale"
import { ArrowLeft, MessagesSquare, Info, Send } from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Header } from "@/components/layout/Header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Search as SearchIcon } from "lucide-react"
import { useChannel } from "@/hooks/useActionCable"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { ContextPanel } from "@/components/chats/ContextPanel"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"
import type { InboxIndexProps, InboxConversation, InboxConversationDetail } from "@/types/pages"
import type { ChatMessage } from "@/types/models.d"

const DATE_LOCALES: Record<string, typeof es> = { es, en: enUS, ru }

type FilterType = "all" | "requests" | "teacher_chats" | "unread"

export default function ChatsIndex() {
  const { t, i18n } = useTranslation()
  const { conversations, selectedConversation: initialSelected = null } =
    usePage<SharedProps & InboxIndexProps>().props
  const { auth } = usePage<SharedProps>().props

  // Sync locale (normally done in AuthenticatedLayout)
  useEffect(() => {
    const locale = auth.user?.locale
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
  }, [auth.user?.locale, i18n])

  const [selected, setSelected] = useState<InboxConversationDetail | null>(initialSelected)
  const [mobileSelected, setMobileSelected] = useState<InboxConversationDetail | null>(
    initialSelected
  )
  const [contextOpen, setContextOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [messages, setMessages] = useState<ChatMessage[]>(initialSelected?.messages ?? [])
  const [msgBody, setMsgBody] = useState("")

  // Sync messages when selected conversation changes from server
  useEffect(() => {
    if (selected?.messages) setMessages(selected.messages)
  }, [selected?.messages])

  // Subscribe to real-time messages
  useChannel<ChatMessage>(
    "ConversationChannel",
    { id: selected?.id ?? 0 },
    (data) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev
        return [...prev, data]
      })
    },
  )

  const handleSelect = (chatConv: InboxConversation) => {
    router.visit(routes.chat(chatConv.id), {
      preserveState: true,
      only: ["selectedConversation", "conversations"],
      onSuccess: (page) => {
        const props = page.props as { selectedConversation?: InboxConversationDetail }
        if (props.selectedConversation) {
          setSelected(props.selectedConversation)
          setMobileSelected(props.selectedConversation)
        }
      },
    })
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = msgBody.trim()
    if (!trimmed || !selected) return
    router.post(routes.conversationMessages(selected.id), { body: trimmed }, { preserveScroll: true })
    setMsgBody("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
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

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("chats.all") },
    { key: "requests", label: t("chats.requests_filter") },
    { key: "teacher_chats", label: t("chats.teacher_chats") },
    { key: "unread", label: t("chats.unread_only") },
  ]

  // Group messages by date
  const loc = DATE_LOCALES[i18n.language] ?? es
  const currentMessage = messages.reduce<Record<string, ChatMessage[]>>((acc, msg) => {
    const key = format(new Date(msg.createdAt), "d MMM, yyyy", { locale: loc })
    if (!acc[key]) acc[key] = []
    acc[key].push(msg)
    return acc
  }, {})

  const subtitle = selected
    ? selected.context.type === "request"
      ? selected.context.subject
      : [selected.context.teacherName, selected.context.studentName].filter(Boolean).join(" — ")
    : null

  return (
    <section className="flex h-full gap-6">
      {/* Left Side */}
      <div className={cn(
        "flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80",
        mobileSelected && "hidden sm:flex"
      )}>
        <div className="sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none">
          <div className="flex items-center justify-between py-2">
            <div className="flex gap-2">
              <h1 className="text-2xl font-bold">{t("chats.title")}</h1>
              <MessagesSquare size={20} />
            </div>
          </div>

          <label
            className={cn(
              "focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden",
              "flex h-10 w-full items-center space-x-0 rounded-md border border-border ps-2"
            )}
          >
            <SearchIcon size={15} className="me-2 text-muted-foreground" />
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
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="-mx-3 h-full overflow-scroll p-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("chats.no_conversations")}</p>
          ) : (
            filtered.map((c) => {
              const initials = getInitials(c.title)
              return (
                <Fragment key={c.id}>
                  <button
                    type="button"
                    className={cn(
                      "group flex w-full rounded-md px-2 py-2 text-start text-sm hover:bg-accent hover:text-accent-foreground",
                      selected?.id === c.id && "sm:bg-muted"
                    )}
                    onClick={() => handleSelect(c)}
                  >
                    <div className="flex gap-2">
                      <Avatar>
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className={cn("col-start-2 row-span-2 font-medium", c.unread && "font-semibold")}>
                          {c.title}
                        </span>
                        <span className="col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground group-hover:text-accent-foreground/90">
                          {c.lastMessage?.body ?? t("chat.no_messages")}
                        </span>
                      </div>
                    </div>
                  </button>
                  <Separator className="my-1" />
                </Fragment>
              )
            })
          )}
        </ScrollArea>
      </div>

      {/* Right Side */}
      {selected ? (
        <div
          className={cn(
            "absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border bg-background shadow-sm sm:static sm:z-auto sm:flex sm:rounded-md",
            mobileSelected && "start-0 flex"
          )}
        >
          {/* Top Part */}
          <div className="mb-1 flex flex-none justify-between bg-card p-4 shadow-lg sm:rounded-t-md">
            {/* Left */}
            <div className="flex gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="-ms-2 h-full sm:hidden"
                onClick={() => {
                  setMobileSelected(null)
                  setSelected(null)
                }}
              >
                <ArrowLeft />
              </Button>
              <div className="flex items-center gap-2 lg:gap-4">
                <Avatar className="size-9 lg:size-11">
                  <AvatarFallback className="text-xs">
                    {getInitials(selected.title)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="col-start-2 row-span-2 text-sm font-medium lg:text-base">
                    {selected.title}
                  </span>
                  {subtitle && (
                    <span className="col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-nowrap text-ellipsis text-xs text-muted-foreground lg:max-w-none lg:text-sm">
                      {subtitle}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="-me-1 flex items-center gap-1 lg:gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-full lg:size-10"
                onClick={() => setContextOpen(!contextOpen)}
              >
                <Info size={22} className="stroke-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Context panel (collapsible) */}
          {contextOpen && (
            <div className="shrink-0 border-b max-h-64 overflow-y-auto sm:max-h-72">
              <ContextPanel key={selected.id} conversation={selected} />
            </div>
          )}

          {/* Conversation */}
          <div className="flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4">
            <div className="flex size-full flex-1">
              <div className="chat-text-container relative -me-4 flex flex-1 flex-col overflow-y-hidden">
                <div className="chat-flex flex h-40 w-full grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pe-4 pb-4">
                  {messages.length === 0 ? (
                    <p className="self-center text-center text-sm text-muted-foreground py-8">
                      {t("chat.no_messages")}
                    </p>
                  ) : (
                    currentMessage &&
                    Object.keys(currentMessage).map((key) => (
                      <Fragment key={key}>
                        {currentMessage[key].map((msg) => (
                          <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.user.id === auth.user?.id}
                          />
                        ))}
                        <div className="text-center text-xs text-muted-foreground">{key}</div>
                      </Fragment>
                    ))
                  )}
                </div>
              </div>
            </div>
            <form onSubmit={handleSend} className="flex w-full flex-none gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-card px-2 py-1 focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden lg:gap-4">
                <label className="flex-1">
                  <span className="sr-only">{t("chat.type_message")}</span>
                  <input
                    type="text"
                    placeholder={t("chat.type_message")}
                    className="h-8 w-full bg-inherit text-sm focus-visible:outline-hidden"
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  disabled={!msgBody.trim()}
                  className="hidden sm:inline-flex"
                >
                  <Send size={20} />
                </Button>
              </div>
              <Button type="submit" disabled={!msgBody.trim()} className="h-full sm:hidden">
                <Send size={18} /> {t("chat.send")}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border bg-card shadow-sm sm:static sm:z-auto sm:flex"
          )}
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-border">
              <MessagesSquare className="size-8" />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold">{t("chats.your_messages")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("chats.select_chat")}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// Custom layout: sidebar + header, main is fixed height (flex grow overflow-hidden)
ChatsIndex.layout = (children: React.ReactNode) => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Header />
      <main className="flex grow flex-col overflow-hidden px-4 py-6 md:px-6">
        {children}
      </main>
    </SidebarInset>
  </SidebarProvider>
)
