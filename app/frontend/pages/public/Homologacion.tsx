import { usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  FileCheck,
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  Scale,
  UserCheck,
  Award,
  Monitor,
  Handshake,
  Globe,
  MessageSquare,
  Bell,
  Shield,
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
import { Reveal, TiltCard, AnimatedCounter } from "@/components/public/animations"
import {
  GradientButton,
  PublicHero,
  PublicCta,
  PublicSection,
  SectionHeading,
} from "@/components/public/shared"
import { ConsultationDialog } from "@/components/public/ConsultationDialog"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

const ADVANTAGES = [
  { icon: UserCheck, key: "advisor" },
  { icon: Award, key: "expertise" },
  { icon: Monitor, key: "transparency" },
  { icon: Handshake, key: "partners" },
] as const

const DASHBOARD_FEATURES = [
  { icon: Globe, key: "realtime" },
  { icon: Shield, key: "secure" },
  { icon: MessageSquare, key: "chat" },
  { icon: Bell, key: "notifications" },
] as const

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
          <ConsultationDialog>
            <GradientButton className="w-full sm:w-auto">
              {t("public.homologacion.cta_start")}
            </GradientButton>
          </ConsultationDialog>
        }
      />

      {/* Advantages */}
      <PublicSection className="bg-white">
        <SectionHeading
          title={t("public.homologacion.adv_title")}
          subtitle={t("public.homologacion.adv_subtitle")}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map(({ icon: Icon, key }, i) => (
            <Reveal key={key} direction="up" delay={i * 120}>
              <TiltCard className="h-full">
                <Card className="h-full border bg-white transition-all duration-300 hover:shadow-xl hover:shadow-[#2D7FF9]/5 group">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 inline-flex rounded-lg bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 p-3 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6 text-[#2D7FF9]" />
                    </div>
                    <h3 className="font-semibold mb-2">{t(`public.homologacion.adv_${key}_title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`public.homologacion.adv_${key}_desc`)}</p>
                  </CardContent>
                </Card>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* What is homologation */}
      <PublicSection className="bg-slate-50" dots>
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

      {/* Personal Dashboard */}
      <PublicSection className="bg-white">
        <SectionHeading
          title={t("public.homologacion.dashboard_title")}
          subtitle={t("public.homologacion.dashboard_subtitle")}
        />
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {DASHBOARD_FEATURES.map(({ icon: Icon, key }, i) => (
            <Reveal key={key} direction="up" delay={i * 100}>
              <div className="flex items-start gap-4 p-4 rounded-xl border bg-slate-50/50 transition-all duration-300 hover:bg-white hover:shadow-md group">
                <div className="shrink-0 rounded-lg bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 p-2.5 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-[#2D7FF9]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{t(`public.homologacion.dash_${key}_title`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`public.homologacion.dash_${key}_desc`)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Process timeline */}
      <PublicSection className="bg-slate-50" dots>
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

      {/* Documents needed */}
      <PublicSection className="bg-white">
        <SectionHeading title={t("public.homologacion.docs_title")} />
        <div className="max-w-2xl mx-auto space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Reveal key={i} direction="left" delay={i * 80}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-[#2D7FF9] mt-0.5 shrink-0" />
                <span className="text-sm">{t(`public.homologacion.doc_${i + 1}`)}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Social proof */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading
          title={t("public.homologacion.proof_title")}
          subtitle={t("public.homologacion.proof_subtitle")}
        />
        <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto text-center">
          {[
            { value: 1000, suffix: "+", key: "clients" },
            { value: 20, suffix: "+", key: "countries" },
            { value: 10, suffix: "+", key: "years" },
          ].map(({ value, suffix, key }, i) => (
            <Reveal key={key} direction="up" delay={i * 150}>
              <div className="p-6">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] bg-clip-text text-transparent">
                  <AnimatedCounter value={value} suffix={suffix} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground font-medium">{t(`public.homologacion.proof_${key}`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Costs & timelines */}
      <PublicSection className="bg-white">
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
      <PublicSection className="bg-slate-50" dots>
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
        <ConsultationDialog>
          <GradientButton className="w-full sm:w-auto">
            {t("public.homologacion.cta_button")}
          </GradientButton>
        </ConsultationDialog>
      </PublicCta>
    </PublicLayout>
  )
}
