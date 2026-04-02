import { usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"
import type { ChatShowProps } from "@/types/pages"

export default function ChatShow() {
  const { t } = useTranslation()
  const { conversation } = usePage<SharedProps & ChatShowProps>().props
  const other = conversation.otherUser

  return (
    <AuthenticatedLayout
      fixedHeight
      breadcrumbs={[
        { label: t("nav.chat"), href: routes.conversations },
        { label: conversation.title },
      ]}
    >
      <Main fixed>
        <div className="flex flex-col h-full min-h-0">
          {/* Chat header with participant info */}
          <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
            {other ? (
              <>
                <Avatar className="size-9 shrink-0">
                  <AvatarImage src={other.avatarUrl ?? undefined} alt={other.name} />
                  <AvatarFallback className="text-xs">{getInitials(other.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{other.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{conversation.title}</p>
                </div>
              </>
            ) : (
              <p className="text-sm font-medium truncate">{conversation.title}</p>
            )}
          </div>

          {/* Chat messages + input */}
          <div className="flex-1 min-h-0">
            <ChatWindow
              conversationId={conversation.id}
              messages={conversation.messages}
              postUrl={routes.conversationMessages(conversation.id)}
            />
          </div>
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
