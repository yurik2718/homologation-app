import { usePage, Link } from "@inertiajs/react"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"
import type { ChatShowProps } from "@/types/pages"

export default function ChatShow() {
  const { conversation } = usePage<SharedProps & ChatShowProps>().props

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={routes.conversations}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold truncate">{conversation.title}</h1>
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
  )
}
