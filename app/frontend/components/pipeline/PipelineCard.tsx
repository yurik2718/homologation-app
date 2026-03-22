import { useState } from "react"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DocumentTags } from "@/components/pipeline/DocumentTags"
import { STAGE_COLORS, STAGE_SHORT_LABELS, SERVICE_TYPE_COLORS, YEAR_COLORS } from "@/components/pipeline/constants"
import { routes } from "@/lib/routes"
import { cn, getOptionLabel } from "@/lib/utils"
import type { SharedProps } from "@/types"
import type { PipelineCard as PipelineCardType } from "@/types/pages"

interface PipelineCardProps {
  card: PipelineCardType
  stage?: string
  onEdit: (card: PipelineCardType) => void
}

export function PipelineCard({ card, stage, onEdit }: PipelineCardProps) {
  const { t, i18n } = useTranslation()
  const { selectOptions } = usePage<SharedProps>().props
  const [busy, setBusy] = useState(false)
  const stageKey = stage ?? card.pipelineStage
  const color = STAGE_COLORS[stageKey]

  const countryLabel = card.country
    ? (selectOptions.countries ?? []).find((o) => o.key === card.country)
    : null
  const countryName = countryLabel
    ? getOptionLabel(countryLabel, i18n.language)
    : card.country

  const yearColor = YEAR_COLORS[card.year] ?? { bg: "bg-blue-600", text: "text-white" }

  // Smart advance label: show next stage short name
  const advanceLabel = card.nextStageName
    ? card.nextStageName === "completado"
      ? "\u2713 Fin"
      : `\u2192 ${STAGE_SHORT_LABELS[card.nextStageName] ?? t(`pipeline.stages.${card.nextStageName}`)}`
    : `${t("pipeline.advance")} \u2192`

  function advance(e: React.MouseEvent) {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    router.patch(routes.admin.pipelineAdvance(card.id), {}, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => setBusy(false),
    })
  }

  function retreat(e: React.MouseEvent) {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    router.patch(routes.admin.pipelineRetreat(card.id), {}, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => setBusy(false),
    })
  }

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-all border-l-4 min-h-[180px]",
        color?.border ?? "border-l-gray-300"
      )}
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
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white cursor-default">
                  <span className={`fi fi-${card.country.toLowerCase()} rounded-sm`} />
                  {card.country}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{countryName}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {card.requiresTranslation && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white" title="Traducción jurada">
              🌐
            </span>
          )}
          {card.countryMissing && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">❓ Sin país</span>
          )}
        </div>

        {/* Row 3: Notes — always reserve 2-line height for layout consistency */}
        <p className={cn(
          "text-xs line-clamp-2 min-h-[2lh]",
          card.pipelineNotes ? "text-muted-foreground" : "invisible"
        )}>
          {card.pipelineNotes || "\u00A0"}
        </p>

        {/* Row 4: Document tags (clickable) */}
        <DocumentTags
          checklist={card.documentChecklist}
          complete={card.documentsComplete}
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
            onClick={retreat}
          >
            &larr;
          </Button>
          <Button
            size="sm"
            className={cn(
              "min-h-[44px] md:min-h-0 md:h-8 flex-[2] text-xs text-white",
              color?.bg ?? "bg-emerald-700",
              `hover:opacity-90`,
            )}
            disabled={busy || !card.canAdvance}
            onClick={advance}
          >
            {advanceLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
