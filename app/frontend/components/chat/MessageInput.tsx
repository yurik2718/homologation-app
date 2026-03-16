import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Paperclip, Send } from "lucide-react"

interface MessageInputProps {
  onSend: (body: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const { t } = useTranslation()
  const [body, setBody] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    onSend(trimmed)
    setBody("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-none gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-card px-2 py-1 focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden lg:gap-4">
        <Button
          size="icon"
          type="button"
          variant="ghost"
          className="hidden h-8 rounded-md lg:inline-flex"
          tabIndex={-1}
        >
          <Paperclip size={20} className="text-muted-foreground" />
        </Button>
        <label className="flex-1">
          <span className="sr-only">{t("chat.type_message")}</span>
          <input
            type="text"
            placeholder={t("chat.type_message")}
            className="h-8 w-full bg-inherit text-sm focus-visible:outline-hidden"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </label>
        <Button
          variant="ghost"
          size="icon"
          type="submit"
          disabled={disabled || !body.trim()}
          className="hidden sm:inline-flex"
        >
          <Send size={20} />
        </Button>
      </div>
      <Button type="submit" disabled={disabled || !body.trim()} className="h-full sm:hidden">
        <Send size={18} /> {t("chat.send")}
      </Button>
    </form>
  )
}
