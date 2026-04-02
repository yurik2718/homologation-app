import { useEffect } from "react"
import { Link, useForm, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { ExternalLink, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { routes } from "@/lib/routes"
import { cn, getOptionLabel } from "@/lib/utils"
import { usePipeline, CURRENT_YEAR, SERVICE_TYPE_COLORS } from "@/components/pipeline/constants"
import type { SharedProps } from "@/types"
import type { PipelineCard } from "@/types/pages"

interface CardEditDialogProps {
  card: PipelineCard | null
  open: boolean
  onClose: () => void
}

const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]

export function CardEditDialog({ card, open, onClose }: CardEditDialogProps) {
  const { t, i18n } = useTranslation()
  const { selectOptions } = usePage<SharedProps>().props
  const { data, setData, patch, processing, clearErrors } = useForm({
    pipeline_notes: "",
    payment_amount: 0,
    year: CURRENT_YEAR,
  })

  useEffect(() => {
    if (card) {
      clearErrors()
      setData({
        pipeline_notes: card.pipelineNotes ?? "",
        payment_amount: card.amount,
        year: card.year,
      })
    }
  }, [card]) // eslint-disable-line react-hooks/exhaustive-deps -- setData/clearErrors are stable from useForm

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!card) return
    patch(routes.admin.pipelineUpdate(card.id), {
      preserveScroll: true,
      onSuccess: () => onClose(),
    })
  }

  if (!card) return null

  const countryOption = card.country
    ? (selectOptions.countries ?? []).find((o) => o.key === card.country)
    : null
  const countryName = countryOption
    ? getOptionLabel(countryOption, i18n.language)
    : null

  const { stageColors } = usePipeline()
  const serviceTypeColor = SERVICE_TYPE_COLORS[card.serviceType]
  const stageColor = stageColors[card.pipelineStage]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-8">{card.studentName}</DialogTitle>
          <Link
            href={routes.request(card.id)}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            {t("pipeline.edit_dialog.view_request")}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </DialogHeader>

        {/* Block 1: Student data (read-only) */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("pipeline.edit_dialog.student_data")}
            </p>

            {/* Identity + Stage */}
            <div className="flex items-center justify-between gap-2">
              {card.identityCard ? (
                <span className="text-sm font-mono text-foreground">
                  🛂 {card.identityCard}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
              <span className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded text-white",
                stageColor?.bg ?? "bg-gray-500"
              )}>
                {t(`pipeline.stages.${card.pipelineStage}`)}
              </span>
            </div>

            {/* Country + Service type + Year */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {card.country ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                  <span className={`fi fi-${card.country.toLowerCase()} rounded-sm`} />
                  {countryName ?? card.country}
                </span>
              ) : null}
              <span className={cn(
                "text-[11px] font-bold px-1.5 py-0.5 rounded",
                serviceTypeColor?.bg ?? "bg-pink-600",
                serviceTypeColor?.text ?? "text-white",
              )}>
                {card.serviceType}
              </span>
            </div>

            {/* Auto-computed badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {card.country && !card.countryMissing && (
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-md border",
                  card.cotejoRoute === "ministerio"
                    ? "border-pink-300 text-pink-700 bg-pink-50"
                    : "border-cyan-300 text-cyan-700 bg-cyan-50"
                )}>
                  {card.cotejoRoute === "ministerio"
                    ? `🏛 ${t("pipeline.edit_dialog.cotejo_ministerio")}`
                    : `🏢 ${t("pipeline.edit_dialog.cotejo_delegacion")}`}
                </span>
              )}
              {card.requiresTranslation ? (
                <span className="text-xs font-medium px-2 py-1 rounded-md border border-orange-300 text-orange-700 bg-orange-50">
                  🌐 {t("pipeline.edit_dialog.requires_translation")}
                </span>
              ) : card.country ? (
                <span className="text-xs font-medium px-2 py-1 rounded-md border border-green-300 text-green-700 bg-green-50">
                  ✓ {t("pipeline.edit_dialog.docs_in_spanish")}
                </span>
              ) : null}
            </div>

            {/* Warning if no country */}
            {card.countryMissing && (
              <div className="flex items-start gap-2 p-2 rounded-md bg-red-50 border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  {t("pipeline.edit_dialog.no_country_hint")}
                </p>
              </div>
            )}

            {/* Document progress */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${card.documentsTotal > 0 ? (card.documentsComplete / card.documentsTotal) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {card.documentsComplete}/{card.documentsTotal}
              </span>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Block 2: Admin fields (editable) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("pipeline.edit_dialog.admin_fields")}
          </p>

          {/* Amount + Year inline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("pipeline.edit_dialog.amount")}</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={data.payment_amount}
                onChange={(e) => setData("payment_amount", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("pipeline.edit_dialog.year")}</Label>
              <Select
                value={String(data.year)}
                onValueChange={(v) => setData("year", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>{t("pipeline.edit_dialog.notes")}</Label>
            <Textarea
              value={data.pipeline_notes}
              onChange={(e) => setData("pipeline_notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px]"
              onClick={onClose}
            >
              {t("pipeline.edit_dialog.cancel")}
            </Button>
            <Button type="submit" className="min-h-[44px]" disabled={processing}>
              {t("pipeline.edit_dialog.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
