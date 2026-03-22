import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { PipelineCard } from "@/components/pipeline/PipelineCard"
import { STAGE_COLORS } from "@/components/pipeline/constants"
import { cn } from "@/lib/utils"
import type { PipelineCard as PipelineCardType } from "@/types/pages"

interface KanbanColumnProps {
  stage: string
  cards: PipelineCardType[]
  onEditCard: (card: PipelineCardType) => void
}

export function KanbanColumn({ stage, cards, onEditCard }: KanbanColumnProps) {
  const { t } = useTranslation()
  const color = STAGE_COLORS[stage]

  return (
    <div className="w-72 flex-shrink-0">
      {/* Column header with icon and color accent */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2" style={{ borderBottomColor: "transparent" }}>
        <span className="text-base">{color?.icon}</span>
        <div className={`w-2 h-2 rounded-full ${color?.dot ?? "bg-gray-400"}`} />
        <h3 className="text-sm font-semibold flex-1">
          {t(`pipeline.stages.${stage}`)}
          {stage === "traduccion" && (
            <span className="ml-1.5 text-[10px] font-medium px-1 py-0.5 rounded bg-orange-100 text-orange-600">
              cond.
            </span>
          )}
        </h3>
        <Badge className={cn("text-xs tabular-nums", color?.bg, "text-white border-transparent")}>
          {cards.length}
        </Badge>
      </div>
      {/* Cards */}
      <div className="space-y-2.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
        {cards.map((card) => (
          <PipelineCard key={card.id} card={card} stage={stage} onEdit={onEditCard} />
        ))}
        {cards.length === 0 && (
          <p className="text-xs text-muted-foreground py-6 text-center">
            {t("pipeline.no_cards")}
          </p>
        )}
      </div>
    </div>
  )
}
