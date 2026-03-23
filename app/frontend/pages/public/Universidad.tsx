import { usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Building2,
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
import {
  GradientButton,
  PublicHero,
  PublicCta,
  PublicSection,
  SectionHeading,
} from "@/components/public/shared"
import { Reveal, TiltCard } from "@/components/public/animations"
import { publicRoute, publicPages, routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

export default function Universidad() {
  const { seo } = usePage<SharedProps & PublicPageProps>().props
  const { t } = useTranslation()

  return (
    <PublicLayout>
      <SeoHead {...seo} />

      {/* Hero */}
      <PublicHero
        title1={t("public.universidad.hero_title_1")}
        titleAccent={t("public.universidad.hero_title_accent")}
        subtitle={t("public.universidad.hero_subtitle")}
        actions={
          <GradientButton href={routes.register} className="w-full sm:w-auto">
            {t("public.universidad.cta_start")}
          </GradientButton>
        }
      />

      {/* Types of admission */}
      <PublicSection className="bg-white">
        <SectionHeading title={t("public.universidad.types_title")} />
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: BookOpen, key: "grado" },
            { icon: Award, key: "master" },
            { icon: GraduationCap, key: "fp" },
          ].map(({ icon: Icon, key }, i) => (
            <Reveal key={key} direction="up" delay={i * 120}>
              <TiltCard>
                <Card className="border bg-white transition-all duration-300 hover:shadow-xl hover:shadow-[#2D7FF9]/5 group">
                  <CardContent className="p-8 text-center">
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

      {/* What we help with */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.universidad.support_title")} />
        <div className="max-w-2xl mx-auto space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Reveal key={i} direction="left" delay={i * 80}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/80 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-[#2D7FF9] mt-0.5 shrink-0" />
                <span className="text-sm">{t(`public.universidad.support_${i + 1}`)}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Universities */}
      <PublicSection className="bg-white">
        <SectionHeading title={t("public.universidad.universities_title")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {Array.from({ length: 6 }, (_, i) => (
            <Reveal key={i} direction="up" delay={i * 80}>
              <Card className="border transition-all duration-300 hover:shadow-md hover:border-[#2D7FF9]/20 group">
                <CardContent className="flex items-center gap-3 p-4">
                  <Building2 className="h-5 w-5 text-[#2D7FF9] shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-sm font-medium">{t(`public.universidad.uni_${i + 1}`)}</span>
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
              {Array.from({ length: 4 }, (_, i) => (
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
        <GradientButton href={publicRoute(publicPages.precios, seo.locale)}>
          {t("public.universidad.cta_start")}
        </GradientButton>
      </PublicCta>
    </PublicLayout>
  )
}
