import { usePage, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"
import type { ChatShowProps } from "@/types/pages"

export default function ChatShow() {
  const { t } = useTranslation()
  const { conversation } = usePage<SharedProps & ChatShowProps>().props

  return (
    <AuthenticatedLayout breadcrumbs={[{ label: t("nav.chat"), href: routes.conversations }, { label: conversation.title }]}>
      <Main>
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" asChild>
            <Link href={routes.conversations}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight truncate">{conversation.title}</h1>
        </div>

        <Card className="min-h-[400px] flex flex-col">
          <CardContent className="flex-1 p-0">
            <ChatWindow
              conversationId={conversation.id}
              messages={conversation.messages}
              postUrl={routes.conversationMessages(conversation.id)}
            />
          </CardContent>
        </Card>
      </div>
      </Main>
    </AuthenticatedLayout>
  )
}
