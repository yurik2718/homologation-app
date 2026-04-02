import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface MessageInputProps {
  onSend: (body: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const { t } = useTranslation()
  const [body, setBody] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [body])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    onSend(trimmed)
    setBody("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-none gap-2">
      <div className="flex flex-1 items-end gap-2 rounded-md border border-input bg-card px-3 py-2 focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden">
        <label className="flex-1">
          <span className="sr-only">{t("chat.type_message")}</span>
          <textarea
            ref={textareaRef}
            placeholder={t("chat.type_message")}
            className="w-full resize-none bg-inherit text-sm leading-snug focus-visible:outline-hidden"
            rows={1}
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
          className="size-9 shrink-0"
        >
          <Send size={18} />
        </Button>
      </div>
    </form>
  )
}
