import { MessageCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { ConsultationDialog } from "@/components/public/ConsultationDialog"
import { Button } from "@/components/ui/button"
import { CONTACT_WHATSAPP } from "@/lib/constants"

// Sticky bottom CTA + WhatsApp. Split behavior by viewport:
//   • Mobile (<lg): full-width bar with consultation button + WhatsApp quick-tap
//   • Desktop (≥lg): single floating WhatsApp FAB bottom-right
//
// Cookie banner (vanilla-cookieconsent) owns a higher z-index slot, so these
// sit below it during first-visit consent flow. No tracking pixel on the
// WhatsApp link — plain wa.me anchor, GDPR-safe.
export function StickyCtaBar() {
  const { t } = useTranslation()
  const hasWhatsApp = CONTACT_WHATSAPP.length > 0
  const waHref = hasWhatsApp ? `https://wa.me/${CONTACT_WHATSAPP}` : null

  return (
    <>
      {/* Mobile: full-width bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t bg-white/95 backdrop-blur-md shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 px-4 py-3">
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("public.sticky_cta.whatsapp_aria")}
              className="flex items-center justify-center shrink-0 h-11 w-11 rounded-lg bg-[#25D366] text-white shadow-sm active:scale-95 transition-transform"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </a>
          )}
          <ConsultationDialog>
            <Button
              className="flex-1 min-h-[44px] bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] hover:opacity-90 border-0 text-base"
            >
              {t("public.sticky_cta.consultation")}
            </Button>
          </ConsultationDialog>
        </div>
      </div>

      {/* Desktop: floating WhatsApp button */}
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("public.sticky_cta.whatsapp_aria")}
          className="hidden lg:flex fixed bottom-6 right-6 z-40 items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25 hover:scale-110 hover:shadow-xl transition-all"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </a>
      )}
    </>
  )
}
