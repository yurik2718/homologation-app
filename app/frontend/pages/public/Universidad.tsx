import { Link, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  BookOpen,
  Award,
  GraduationCap,
  CheckCircle2,
  Building2,
  Search,
  FileText,
  Send,
  ClipboardCheck,
  Quote,
  Star,
  Link2,
} from "lucide-react"
import { UniversityIllustration } from "@/components/public/UniversityIllustration"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SeoHead } from "@/components/public/SeoHead"
import {
  GradientButton,
  PublicHero,
  PublicCta,
  PublicSection,
  SectionHeading,
} from "@/components/public/shared"
import { ConsultationDialog } from "@/components/public/ConsultationDialog"
import { Reveal, TiltCard } from "@/components/public/animations"
import { publicRoute, publicPages } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

const ADVANTAGES = [
  { icon: Search, key: "matching" },
  { icon: FileText, key: "support" },
  { icon: Building2, key: "local" },
  { icon: Link2, key: "combo" },
] as const

const PROCESS_STEPS = [
  { icon: CheckCircle2, key: 1 },
  { icon: Search, key: 2 },
  { icon: FileText, key: 3 },
  { icon: Send, key: 4 },
  { icon: ClipboardCheck, key: 5 },
] as const

export default function Universidad() {
  const { seo } = usePage<SharedProps & PublicPageProps>().props
  const { t } = useTranslation()
  const locale = seo.locale

  const preciosHref = publicRoute(publicPages.precios, locale)

  return (
    <PublicLayout>
      <SeoHead {...seo} />

      {/* Hero */}
      <PublicHero
        title1={t("public.universidad.hero_title_1")}
        titleAccent={t("public.universidad.hero_title_accent")}
        subtitle={t("public.universidad.hero_subtitle")}
        actions={
          <div className="flex flex-col sm:flex-row gap-3">
            <ConsultationDialog>
              <GradientButton className="w-full sm:w-auto">
                {t("public.universidad.cta_consult")}
              </GradientButton>
            </ConsultationDialog>
            <Link href={preciosHref}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-h-[44px] text-base transition-all duration-300"
              >
                {t("public.universidad.cta_pricing")}
              </Button>
            </Link>
          </div>
        }
        footer={
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {[
              { value: "80+", key: "universities" },
              { value: "1 000+", key: "programs" },
              { value: "500+", key: "success" },
            ].map(({ value, key }, i) => (
              <div key={key} className="flex items-center gap-x-2 sm:gap-x-6">
                {i > 0 && <span className="text-border">·</span>}
                <span>
                  <span className="font-semibold text-foreground">{value}</span>{" "}
                  {t(`public.universidad.hero_stat_${key}`)}
                </span>
              </div>
            ))}
          </div>
        }
        illustration={<UniversityIllustration />}
      />

      {/* Advantages */}
      <PublicSection className="bg-white">
        <SectionHeading
          title={t("public.universidad.adv_title")}
          subtitle={t("public.universidad.adv_subtitle")}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map(({ icon: Icon, key }, i) => (
            <Reveal key={key} direction="up" delay={i * 120} className="h-full">
              <TiltCard className="h-full">
                <Card className="h-full border bg-white transition-all duration-300 hover:shadow-xl hover:shadow-[#2D7FF9]/5 group">
                  <CardContent className="h-full p-6 text-center flex flex-col items-center">
                    <div className="mx-auto mb-4 inline-flex rounded-lg bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 p-3 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6 text-[#2D7FF9]" />
                    </div>
                    <h3 className="font-semibold mb-2">{t(`public.universidad.adv_${key}_title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`public.universidad.adv_${key}_desc`)}</p>
                  </CardContent>
                </Card>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Types of admission */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.universidad.types_title")} />
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: BookOpen, key: "grado" },
            { icon: Award, key: "master" },
            { icon: GraduationCap, key: "fp" },
          ].map(({ icon: Icon, key }, i) => (
            <Reveal key={key} direction="up" delay={i * 120} className="h-full">
              <TiltCard className="h-full">
                <Card className="h-full border bg-white transition-all duration-300 hover:shadow-xl hover:shadow-[#2D7FF9]/5 group">
                  <CardContent className="h-full p-8 text-center flex flex-col items-center">
                    <div className="mx-auto mb-4 inline-flex rounded-lg bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 p-3 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6 text-[#2D7FF9]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t(`public.universidad.type_${key}_title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`public.universidad.type_${key}_desc`)}</p>
                  </CardContent>
                </Card>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Process timeline */}
      <PublicSection className="bg-white">
        <SectionHeading title={t("public.universidad.process_title")} />
        <div className="max-w-3xl mx-auto space-y-8">
          {PROCESS_STEPS.map(({ key }, i) => (
            <Reveal key={key} direction="left" delay={i * 150}>
              <div className="flex gap-6 items-start group">
                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] text-white flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#2D7FF9]/20">
                  {key}
                </div>
                <div>
                  <h3 className="font-semibold">{t(`public.universidad.process_${key}_title`)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t(`public.universidad.process_${key}_desc`)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Universities — social proof */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading
          title={t("public.universidad.universities_title")}
          subtitle={t("public.universidad.universities_subtitle")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {Array.from({ length: 6 }, (_, i) => (
            <Reveal key={i} direction="up" delay={i * 80}>
              <Card className="border transition-all duration-300 hover:shadow-md hover:border-[#2D7FF9]/20 group">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#2D7FF9]/50" />
                  </div>
                  <span className="text-sm font-medium">{t(`public.universidad.uni_${i + 1}`)}</span>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Testimonials */}
      <PublicSection className="bg-white">
        <SectionHeading
          title={t("public.universidad.testimonials_title")}
        />
        <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Reveal key={i} direction="up" delay={i * 120}>
              <Card className="h-full border bg-white transition-all duration-300 hover:shadow-lg hover:shadow-[#2D7FF9]/5">
                <CardContent className="p-6 flex flex-col h-full">
                  <Quote className="h-6 w-6 text-[#2D7FF9]/20 mb-3 shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {t(`public.universidad.testimonial_${i}_text`)}
                  </p>
                  <div className="mt-4 pt-4 border-t flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8453C]/20 to-[#2D7FF9]/20 flex items-center justify-center text-sm font-bold text-[#2D7FF9]">
                      {t(`public.universidad.testimonial_${i}_name`).charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t(`public.universidad.testimonial_${i}_name`)}</p>
                      <p className="text-xs text-muted-foreground">{t(`public.universidad.testimonial_${i}_role`)}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mt-3">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* FAQ */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.universidad.faq_title")} />
        <Reveal direction="up" delay={100}>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {Array.from({ length: 5 }, (_, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    {t(`public.universidad.faq_${i + 1}_q`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t(`public.universidad.faq_${i + 1}_a`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </PublicSection>

      {/* CTA */}
      <PublicCta
        title={t("public.universidad.cta_title")}
        subtitle={t("public.universidad.cta_subtitle")}
      >
        <ConsultationDialog>
          <GradientButton className="w-full sm:w-auto">
            {t("public.universidad.cta_button")}
          </GradientButton>
        </ConsultationDialog>
      </PublicCta>
    </PublicLayout>
  )
}
