import { Link, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  BookOpen,
  Award,
  GraduationCap,
  Building2,
  Search,
  FileText,
  Link2,
} from "lucide-react"
import { UniversityIllustration } from "@/components/public/UniversityIllustration"
import { UniversityLogoBar } from "@/components/public/UniversityLogoBar"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { FaqSection } from "@/components/public/FaqSection"
import { TimelineSection } from "@/components/public/TimelineSection"
import { TestimonialsSection } from "@/components/public/TestimonialsSection"
import { FeatureCardGrid } from "@/components/public/FeatureCardGrid"
import { publicRoute, publicPages } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

const ADVANTAGES = [
  { icon: Search, titleKey: "public.universidad.adv_matching_title", descKey: "public.universidad.adv_matching_desc" },
  { icon: FileText, titleKey: "public.universidad.adv_support_title", descKey: "public.universidad.adv_support_desc" },
  { icon: Building2, titleKey: "public.universidad.adv_local_title", descKey: "public.universidad.adv_local_desc" },
  { icon: Link2, titleKey: "public.universidad.adv_combo_title", descKey: "public.universidad.adv_combo_desc" },
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
        <FeatureCardGrid items={ADVANTAGES} columns={4} />
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
        <TimelineSection translationPrefix="public.universidad" count={5} />
      </PublicSection>

      {/* Universities — social proof */}
      <UniversityLogoBar />

      {/* Testimonials */}
      <PublicSection className="bg-white">
        <SectionHeading
          title={t("public.universidad.testimonials_title")}
        />
        <TestimonialsSection translationPrefix="public.universidad" />
      </PublicSection>

      {/* FAQ */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.universidad.faq_title")} />
        <FaqSection translationPrefix="public.universidad" count={5} />
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
