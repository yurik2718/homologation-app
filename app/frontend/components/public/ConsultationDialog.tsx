import { useTranslation } from "react-i18next"
import { CheckCircle2, Clock, Shield, CreditCard, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { STRIPE_CONSULTATION_LINK } from "@/lib/constants"

const CONSULTATION_ITEMS = [
  "consultation_dialog_item_1",
  "consultation_dialog_item_2",
  "consultation_dialog_item_3",
  "consultation_dialog_item_4",
] as const

// Number of spots shown — update manually or connect to backend later
const SPOTS_THIS_WEEK = 3

export function ConsultationDialog({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {t("public.homologacion.consultation_dialog_title")}
          </DialogTitle>
          <DialogDescription>
            {t("public.homologacion.consultation_dialog_desc")}
          </DialogDescription>
        </DialogHeader>

        {/* Price & duration */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] bg-clip-text text-transparent">
            {t("public.homologacion.consultation_dialog_price")}
          </span>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {t("public.homologacion.consultation_dialog_duration")}
          </Badge>
        </div>

        {/* What's included */}
        <div className="space-y-3">
          {CONSULTATION_ITEMS.map((key) => (
            <div key={key} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#2D7FF9] mt-0.5 shrink-0" />
              <span className="text-sm">{t(`public.homologacion.${key}`)}</span>
            </div>
          ))}
        </div>

        {/* Urgency */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <Flame className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm font-medium text-amber-800">
            {t("public.homologacion.consultation_dialog_spots", { count: SPOTS_THIS_WEEK })}
          </span>
        </div>

        {/* Pay button */}
        <a
          href={STRIPE_CONSULTATION_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            size="lg"
            className="w-full min-h-[44px] text-base bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] hover:opacity-90 border-0 shadow-lg shadow-[#2D7FF9]/20 transition-all duration-300"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {t("public.homologacion.consultation_dialog_pay")}
          </Button>
        </a>

        {/* Trust signal */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          {t("public.homologacion.consultation_dialog_secure")}
        </div>
      </DialogContent>
    </Dialog>
  )
}
