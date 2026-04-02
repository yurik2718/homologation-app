import { useRef, useState } from "react"
import { router } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { routes } from "@/lib/routes"
import { usePipeline } from "@/components/pipeline/constants"

interface DocumentTagsProps {
  checklist: Record<string, boolean>
  total: number
  cardId?: number
}

export function DocumentTags({ checklist, total, cardId }: DocumentTagsProps) {
  const { docKeys } = usePipeline()
  // Optimistic local overrides — applied on top of server checklist
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({})
  const pendingRef = useRef(0)

  const merged = { ...checklist, ...optimistic }
  const optimisticComplete = docKeys.filter((k) => merged[k]).length

  function toggleDoc(e: React.MouseEvent, key: string) {
    e.stopPropagation()
    if (!cardId) return

    const newVal = !merged[key]
    setOptimistic((prev) => ({ ...prev, [key]: newVal }))
    pendingRef.current += 1

    router.patch(
      routes.admin.pipelineUpdate(cardId),
      { homologation_request: { document_checklist: { [key]: newVal } } },
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          pendingRef.current -= 1
          if (pendingRef.current === 0) {
            setOptimistic({})
          }
        },
      }
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-0.5">
        {docKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={(e) => toggleDoc(e, key)}
            className={cn(
              "text-[11px] font-bold px-1.5 py-0.5 rounded uppercase leading-none transition-colors",
              cardId && "cursor-pointer hover:opacity-80",
              merged[key]
                ? "bg-emerald-700/80 text-white"
                : "bg-slate-200 text-slate-500"
            )}
          >
            {key}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground tabular-nums">
        {optimisticComplete}/{total}
      </p>
    </div>
  )
}
