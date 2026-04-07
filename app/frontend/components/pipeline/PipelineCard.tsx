import { useState } from "react"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DocumentTags } from "@/components/pipeline/DocumentTags"
import { usePipeline, SERVICE_TYPE_COLORS, YEAR_COLORS } from "@/components/pipeline/constants"
import { routes } from "@/lib/routes"
import { cn, getOptionLabel } from "@/lib/utils"
import type { SharedProps } from "@/types"
import type { PipelineCard as PipelineCardType } from "@/types/pages"

interface PipelineCardProps {
  card: PipelineCardType
  stage?: string
  onEdit: (card: PipelineCardType) => void
}

export function PipelineCard({ card, onEdit }: PipelineCardProps) {
  const { t, i18n } = useTranslation()
  const { selectOptions } = usePage<SharedProps>().props
  const { stageShortLabels } = usePipeline()
  const [busy, setBusy] = useState(false)

  const countryLabel = card.country
    ? (selectOptions.countries ?? []).find((o) => o.key === card.country)
    : null
  const countryName = countryLabel
    ? getOptionLabel(countryLabel, i18n.language)
    : card.country

  const yearColor = YEAR_COLORS[card.year] ?? { bg: "bg-transparent border border-border", text: "text-foreground" }

  // Smart advance label: show next stage short name
  const advanceLabel = card.nextStageName
    ? card.nextStageName === "completado"
      ? "\u2713 Fin"
      : `\u2192 ${stageShortLabels[card.nextStageName] ?? t(`pipeline.stages.${card.nextStageName}`)}`
    : `${t("pipeline.advance")} \u2192`

  function moveStage(e: React.MouseEvent, url: string) {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    router.patch(url, {}, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => setBusy(false),
    })
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all border border-border"
      onClick={() => onEdit(card)}
    >
      <CardContent className="p-3 flex flex-col gap-2 h-full">
        {/* Row 1: Name + amount */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{card.studentName}</p>
            {card.identityCard && (
              <p className="text-[11px] text-muted-foreground font-mono">🛂 {card.identityCard}</p>
            )}
          </div>
          <span className="text-xs font-bold text-foreground whitespace-nowrap font-mono">
            {card.amount}&euro;
          </span>
        </div>

        {/* Row 2: Badges */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded", yearColor.bg, yearColor.text)}>
            {card.year}
          </span>
          <span className={cn(
            "text-[11px] font-bold px-1.5 py-0.5 rounded",
            SERVICE_TYPE_COLORS[card.serviceType]?.bg ?? "bg-pink-600",
            SERVICE_TYPE_COLORS[card.serviceType]?.text ?? "text-white",
          )}>
            {card.serviceType}
          </span>
          {card.country && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium cursor-default">
                  {card.country}
                  {card.requiresTranslation && <span title="Traducción jurada">🌐</span>}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{countryName}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {!card.country && card.requiresTranslation && (
            <span className="text-[11px] font-medium" title="Traducción jurada">🌐</span>
          )}
          {card.countryMissing && (
            <span className="text-[11px] font-bold text-destructive">❓ Sin país</span>
          )}
        </div>

        {/* Row 3: Notes — always reserve 2-line height for layout consistency */}
        <p className={cn(
          "text-xs line-clamp-2 min-h-[2rem]",
          card.pipelineNotes ? "text-muted-foreground" : "invisible"
        )}>
          {card.pipelineNotes || "\u00A0"}
        </p>

        {/* Row 4: Document tags (clickable) */}
        <DocumentTags
          checklist={card.documentChecklist}
          total={card.documentsTotal}
          cardId={card.id}
        />

        {/* Row 5: Actions — retreat narrow (flex-1), advance wide (flex-2) */}
        <div className="flex items-center gap-1.5 pt-0.5 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] md:min-h-0 md:h-8 flex-1 text-xs"
            disabled={busy || !card.canRetreat}
            onClick={(e) => moveStage(e, routes.admin.pipelineRetreat(card.id))}
          >
            &larr;
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] md:min-h-0 md:h-8 flex-[2] text-xs"
            disabled={busy || !card.canAdvance}
            onClick={(e) => moveStage(e, routes.admin.pipelineAdvance(card.id))}
          >
            {advanceLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
