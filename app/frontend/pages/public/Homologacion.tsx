import { usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  FileCheck,
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  Scale,
} from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SeoHead } from "@/components/public/SeoHead"
import { Reveal, TiltCard } from "@/components/public/animations"
import {
  GradientButton,
  PublicHero,
  PublicCta,
  PublicSection,
  SectionHeading,
} from "@/components/public/shared"
import { publicRoute, publicPages, routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

export default function Homologacion() {
  const { seo } = usePage<SharedProps & PublicPageProps>().props
  const { t } = useTranslation()

  return (
    <PublicLayout>
      <SeoHead {...seo} />

      {/* Hero */}
      <PublicHero
        title1={t("public.homologacion.hero_title_1")}
        titleAccent={t("public.homologacion.hero_title_accent")}
        subtitle={t("public.homologacion.hero_subtitle")}
        actions={
          <GradientButton href={routes.register} className="w-full sm:w-auto">
            {t("public.homologacion.cta_start")}
          </GradientButton>
        }
      />

      {/* What is homologation */}
      <PublicSection className="bg-white">
        <SectionHeading
          title={t("public.homologacion.what_title")}
          subtitle={t("public.homologacion.what_desc")}
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Scale, key: "legal" },
            { icon: Building2, key: "work" },
            { icon: FileCheck, key: "study" },
          ].map(({ icon: Icon, key }, i) => (
            <Reveal key={key} direction="up" delay={i * 120}>
              <TiltCard>
                <Card className="border bg-white transition-all duration-300 hover:shadow-xl hover:shadow-[#2D7FF9]/5 group">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 inline-flex rounded-lg bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 p-3 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6 text-[#2D7FF9]" />
                    </div>
                    <h3 className="font-semibold mb-2">{t(`public.homologacion.what_${key}_title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`public.homologacion.what_${key}_desc`)}</p>
                  </CardContent>
                </Card>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Documents needed */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.homologacion.docs_title")} />
        <div className="max-w-2xl mx-auto space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Reveal key={i} direction="left" delay={i * 80}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/80 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-[#2D7FF9] mt-0.5 shrink-0" />
                <span className="text-sm">{t(`public.homologacion.doc_${i + 1}`)}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Process timeline */}
      <PublicSection className="bg-white">
        <SectionHeading title={t("public.homologacion.process_title")} />
        <div className="max-w-3xl mx-auto space-y-8">
          {Array.from({ length: 4 }, (_, i) => (
            <Reveal key={i} direction="left" delay={i * 150}>
              <div className="flex gap-6 items-start group">
                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] text-white flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#2D7FF9]/20">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{t(`public.homologacion.process_${i + 1}_title`)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t(`public.homologacion.process_${i + 1}_desc`)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Costs & timelines */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.homologacion.costs_title")} />
        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
          {[
            { icon: Clock, iconClass: "text-[#2D7FF9]", titleKey: "timeline_title", descKey: "timeline_desc" },
            { icon: FileText, iconClass: "text-[#E8453C]", titleKey: "cost_title", descKey: "cost_desc" },
          ].map(({ icon: Icon, iconClass, titleKey, descKey }, i) => (
            <Reveal key={titleKey} direction="up" delay={i * 120}>
              <Card className="border transition-all duration-300 hover:shadow-lg hover:shadow-[#2D7FF9]/5 group">
                <CardContent className="p-6 text-center">
                  <Icon className={`h-8 w-8 ${iconClass} mx-auto mb-3 transition-transform duration-300 group-hover:scale-110`} />
                  <h3 className="font-semibold mb-1">{t(`public.homologacion.${titleKey}`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`public.homologacion.${descKey}`)}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* FAQ */}
      <PublicSection className="bg-white">
        <SectionHeading title={t("public.homologacion.faq_title")} />
        <Reveal direction="up" delay={100}>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {Array.from({ length: 5 }, (_, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    {t(`public.homologacion.faq_${i + 1}_q`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t(`public.homologacion.faq_${i + 1}_a`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </PublicSection>

      {/* CTA */}
      <PublicCta
        title={t("public.homologacion.cta_title")}
        subtitle={t("public.homologacion.cta_subtitle")}
      >
        <GradientButton href={publicRoute(publicPages.precios, seo.locale)}>
          {t("public.homologacion.cta_start")}
        </GradientButton>
      </PublicCta>
    </PublicLayout>
  )
}
