import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"
import { Search as SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ConversationItem } from "./ConversationItem"
import type { InboxConversation } from "@/types/pages"

type FilterType = "all" | "requests" | "teacher_chats" | "unread"

interface ConversationListProps {
  conversations: InboxConversation[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")

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

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-1 py-2">
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

      {/* Conversation List */}
      <ScrollArea className="-mx-3 h-full p-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("chats.no_conversations")}</p>
        ) : (
          filtered.map((c) => (
            <Fragment key={c.id}>
              <ConversationItem
                conversation={c}
                isSelected={c.id === selectedId}
                onClick={() => onSelect(c.id)}
              />
              <Separator className="my-1" />
            </Fragment>
          ))
        )}
      </ScrollArea>
    </div>
  )
}
