import { useEffect, useState } from "react"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { ArrowLeft, MessagesSquare, Info } from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Header } from "@/components/layout/Header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ConversationList } from "@/components/chats/ConversationList"
import { ChatPanel } from "@/components/chats/ChatPanel"
import { ContextPanel } from "@/components/chats/ContextPanel"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"
import type { InboxIndexProps, InboxConversationDetail } from "@/types/pages"

type MobileView = "list" | "chat"

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
  const [mobileView, setMobileView] = useState<MobileView>(initialSelected ? "chat" : "list")
  const [contextOpen, setContextOpen] = useState(false)

  const handleSelect = (id: number) => {
    router.visit(routes.chat(id), {
      preserveState: true,
      only: ["selectedConversation", "conversations"],
      onSuccess: (page) => {
        const props = page.props as { selectedConversation?: InboxConversationDetail }
        if (props.selectedConversation) {
          setSelected(props.selectedConversation)
          setMobileView("chat")
        }
      },
    })
  }

  const handleBack = () => {
    setMobileView("list")
    setSelected(null)
  }

  const subtitle = selected
    ? selected.context.type === "request"
      ? selected.context.subject
      : [selected.context.teacherName, selected.context.studentName].filter(Boolean).join(" — ")
    : null

  return (
    <section className="flex h-[calc(100vh-3.5rem)] gap-6">
      {/* Left Side — Conversation List */}
      <div className={cn(
        "flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80",
        mobileView === "chat" && "hidden sm:flex"
      )}>
        <div className="sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{t("chats.title")}</h1>
              <MessagesSquare className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <ConversationList
          conversations={conversations}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
        />
      </div>

      {/* Right Side — Chat Panel or Empty State */}
      {selected ? (
        <div
          className={cn(
            "absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col border rounded-md bg-background shadow-sm sm:static sm:z-auto sm:flex",
            mobileView === "chat" && "left-0 flex"
          )}
        >
          {/* Chat Header */}
          <div className="mb-1 flex flex-none items-center justify-between rounded-t-md bg-card p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="-ms-2 h-full sm:hidden"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 lg:gap-4">
                <Avatar className="h-9 w-9 lg:h-11 lg:w-11">
                  <AvatarFallback className="text-xs">
                    {getInitials(selected.title)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium lg:text-base">
                    {selected.title}
                  </span>
                  {subtitle && (
                    <span className="block max-w-32 truncate text-xs text-muted-foreground lg:max-w-none lg:text-sm">
                      {subtitle}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full lg:h-10 lg:w-10"
                onClick={() => setContextOpen(!contextOpen)}
              >
                <Info className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Context panel (collapsible) */}
          {contextOpen && (
            <div className="border-b max-h-64 overflow-y-auto shrink-0 sm:max-h-72">
              <ContextPanel conversation={selected} />
            </div>
          )}

          {/* Chat Messages + Input */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <ChatPanel conversation={selected} />
          </div>
        </div>
      ) : (
        <div className="hidden w-full flex-1 flex-col items-center justify-center rounded-md border bg-card shadow-sm sm:flex">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border">
              <MessagesSquare className="h-8 w-8" />
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

// Custom layout: sidebar + header, but main has no padding and is fixed height
ChatsIndex.layout = (children: React.ReactNode) => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Header />
      <main className="flex-1 overflow-hidden p-4 md:px-6 md:py-4">
        {children}
      </main>
    </SidebarInset>
  </SidebarProvider>
)
