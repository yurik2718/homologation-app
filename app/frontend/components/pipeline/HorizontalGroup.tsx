import { useTranslation } from "react-i18next"
import { PipelineCard } from "@/components/pipeline/PipelineCard"
import { STAGE_COLORS } from "@/components/pipeline/constants"
import type { PipelineCard as PipelineCardType } from "@/types/pages"

interface HorizontalGroupProps {
  stage: string
  cards: PipelineCardType[]
  icon: string
  onEditCard: (card: PipelineCardType) => void
}

export function HorizontalGroup({ stage, cards, icon, onEditCard }: HorizontalGroupProps) {
  const { t } = useTranslation()
  const color = STAGE_COLORS[stage]
  const subtitle = t(`pipeline.subtitles.${stage}`, { defaultValue: "" })

  return (
    <div className="border-t pt-4">
      {/* Header: icon + title + subtitle ... count right-aligned */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <div className={`w-2 h-2 rounded-full ${color?.dot ?? "bg-gray-400"}`} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold">
            {t(`pipeline.stages.${stage}`)}
          </h3>
          {subtitle && (
            <p className={`text-[11px] ${color?.text ?? "text-muted-foreground"}`}>{subtitle}</p>
          )}
        </div>
        <span className="text-lg font-bold text-muted-foreground tabular-nums">
          {cards.length}
        </span>
      </div>
      {/* Horizontal scroll of cards */}
      <div className="flex gap-3 overflow-x-auto pb-3">
        {cards.map((card) => (
          <div key={card.id} className="w-64 flex-shrink-0">
            <PipelineCard card={card} stage={stage} onEdit={onEditCard} />
          </div>
        ))}
        {cards.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">{t("pipeline.no_cards")}</p>
        )}
      </div>
    </div>
  )
}
