import { usePage } from "@inertiajs/react"
import { Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  CheckCircle2,
  Monitor,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  FileText,
  FileCheck,
  Search,
  CreditCard,
  Rocket,
  Check,
  Minus,
} from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SeoHead } from "@/components/public/SeoHead"
import { Reveal, ShimmerBorder, AnimatedCounter } from "@/components/public/animations"
import {
  GradientButton,
  PublicHero,
  PublicCta,
  OutlineCtaButton,
  PublicSection,
  SectionHeading,
} from "@/components/public/shared"
import { ConsultationDialog } from "@/components/public/ConsultationDialog"
import { FaqSection } from "@/components/public/FaqSection"
import { publicRoute, publicPages, routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

const includedIcons = [Monitor, MessageCircle, BarChart3, ShieldCheck]

const stepIcons = [FileText, Search, CreditCard, Rocket]

const plans = [
  { key: "basico", features: 4, highlighted: false },
  { key: "completo", features: 8, highlighted: true },
  { key: "premium", features: 8, highlighted: false },
]

const comparisonMatrix: [boolean, boolean, boolean][] = [
  [true, true, true],
  [true, true, true],
  [true, true, true],
  [true, true, true],
  [false, true, true],
  [false, true, true],
  [false, true, true],
  [false, true, true],
  [false, false, true],
  [false, false, true],
  [false, false, true],
  [false, false, true],
  [false, false, true],
]

const heroStats = [
  { value: 500, suffix: "+", key: "clients" },
  { value: 98, suffix: "%", key: "success" },
  { value: 5, suffix: "+", key: "years" },
]

export default function Precios() {
  const { seo } = usePage<SharedProps & PublicPageProps>().props
  const { t } = useTranslation()
  const locale = seo.locale

  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <PublicLayout>
      <SeoHead {...seo} />

      {/* Hero */}
      <PublicHero
        title1={t("public.precios.hero_title_1")}
        titleAccent={t("public.precios.hero_title_accent")}
        subtitle={t("public.precios.hero_subtitle")}
        actions={
          <>
            <GradientButton className="w-full sm:w-auto" onClick={scrollToPlans}>
              {t("public.precios.hero_action_plans")}
            </GradientButton>
            <ConsultationDialog>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-h-[44px] text-base hover:bg-slate-50 transition-all duration-300"
              >
                {t("public.precios.hero_action_consult")}
              </Button>
            </ConsultationDialog>
          </>
        }
        footer={
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {heroStats.map(({ value, suffix, key }, i) => (
              <div key={key} className="flex items-center gap-x-2 sm:gap-x-6">
                {i > 0 && <span className="text-border">·</span>}
                <span>
                  <AnimatedCounter
                    value={value}
                    suffix={suffix}
                    className="font-semibold text-foreground"
                  />{" "}
                  {t(`public.precios.hero_stat_${key}`)}
                </span>
              </div>
            ))}
          </div>
        }
        illustration={
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              {/* Main card */}
              <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-white to-blue-50/80 border border-white/80 shadow-2xl shadow-[#2D7FF9]/10 flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="h-32 w-32 text-[#2D7FF9]/20" />
              </div>
              {/* Floating card: secure payment */}
              <div
                className="absolute -top-2 -right-2 w-20 h-20 rounded-xl bg-white shadow-lg shadow-[#E8453C]/10 border border-[#E8453C]/10 flex items-center justify-center"
                style={{ animation: "float 6s ease-in-out infinite" }}
              >
                <CreditCard className="h-8 w-8 text-[#E8453C]/60" />
              </div>
              {/* Floating card: document verification */}
              <div
                className="absolute -bottom-2 -left-2 w-20 h-20 rounded-xl bg-white shadow-lg shadow-[#2D7FF9]/10 border border-[#2D7FF9]/10 flex items-center justify-center"
                style={{ animation: "float 7s ease-in-out infinite", animationDelay: "1s" }}
              >
                <FileCheck className="h-8 w-8 text-[#2D7FF9]/60" />
              </div>
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#2D7FF9]/10 animate-[spin_40s_linear_infinite]" />
            </div>
          </div>
        }
      />

      {/* Pricing cards */}
      <PublicSection id="plans" className="bg-white">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {plans.map(({ key, features, highlighted }, i) => (
            <Reveal key={key} direction="up" delay={i * 120} className="h-full">
              {highlighted ? (
                <ShimmerBorder>
                  <PricingCard
                    planKey={key}
                    features={features}
                    highlighted
                    t={t}
                  />
                </ShimmerBorder>
              ) : (
                <PricingCard
                  planKey={key}
                  features={features}
                  highlighted={false}
                  t={t}
                />
              )}
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Included in all plans */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.precios.included_title")} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {includedIcons.map((Icon, i) => (
            <Reveal key={i} direction="up" delay={i * 80}>
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[#2D7FF9]" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {t(`public.precios.included_${i + 1}_title`)}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t(`public.precios.included_${i + 1}_desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Comparison table */}
      <PublicSection className="bg-white">
        <SectionHeading title={t("public.precios.compare_title")} />
        <Reveal direction="up" delay={100}>
          <div className="max-w-4xl mx-auto overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 pr-4 text-sm font-semibold text-muted-foreground">
                    {t("public.precios.compare_feature")}
                  </th>
                  {(["basico", "completo", "premium"] as const).map((planKey) => (
                    <th
                      key={planKey}
                      className={`py-3 px-4 text-center text-sm font-semibold ${
                        planKey === "completo" ? "text-[#2D7FF9]" : ""
                      }`}
                    >
                      {t(`public.precios.plan_${planKey}_title`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonMatrix.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 pr-4 text-sm">
                      {t(`public.precios.compare_feature_${i + 1}`)}
                    </td>
                    {row.map((included, j) => (
                      <td key={j} className="py-3 px-4 text-center">
                        {included ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <Minus className="h-5 w-5 text-slate-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </PublicSection>

      {/* How it works */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading
          title={t("public.precios.steps_title")}
          subtitle={t("public.precios.steps_subtitle")}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stepIcons.map((Icon, i) => (
            <Reveal key={i} direction="up" delay={i * 100}>
              <div className="text-center space-y-3">
                <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[#2D7FF9]" />
                </div>
                <div className="text-xs font-bold text-[#2D7FF9] uppercase tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {t(`public.precios.step_${i + 1}_title`)}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t(`public.precios.step_${i + 1}_desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Risk reversal */}
      <PublicSection className="bg-white">
        <Reveal direction="up">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("public.precios.risk_title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("public.precios.risk_desc")}
            </p>
          </div>
        </Reveal>
      </PublicSection>

      {/* FAQ */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.precios.faq_title")} />
        <FaqSection translationPrefix="public.precios" count={7} />
      </PublicSection>

      {/* CTA */}
      <PublicCta
        title={t("public.precios.cta_title")}
        subtitle={t("public.precios.cta_subtitle")}
      >
        <GradientButton href={routes.register}>
          {t("public.precios.cta_start")}
        </GradientButton>
        <OutlineCtaButton href={publicRoute(publicPages.consulta, locale)}>
          {t("public.precios.cta_consult")}
        </OutlineCtaButton>
      </PublicCta>
    </PublicLayout>
  )
}

function PricingCard({
  planKey,
  features,
  highlighted,
  t,
}: {
  planKey: string
  features: number
  highlighted: boolean
  t: (key: string) => string
}) {
  return (
    <Card
      className={`border relative transition-all duration-300 hover:shadow-xl group flex flex-col h-full ${
        highlighted ? "overflow-visible border-[#2D7FF9]/30 shadow-lg scale-[1.02]" : "hover:-translate-y-1"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] text-white border-0 shadow-md">
            {t("public.precios.popular")}
          </Badge>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-base">{t(`public.precios.plan_${planKey}_title`)}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{t(`public.precios.plan_${planKey}_price`)}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {t(`public.precios.plan_${planKey}_desc`)}
        </p>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {Array.from({ length: features }, (_, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#2D7FF9] mt-0.5 shrink-0" />
              <span className="text-sm">{t(`public.precios.plan_${planKey}_feature_${i + 1}`)}</span>
            </div>
          ))}
        </div>
        <Link href={routes.register} className="mt-6">
          <Button
            className={`w-full min-h-[44px] transition-all duration-300 ${
              highlighted
                ? "bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] hover:opacity-90 border-0 shadow-md hover:shadow-lg"
                : "group-hover:bg-primary group-hover:text-primary-foreground"
            }`}
            variant={highlighted ? "default" : "outline"}
          >
            {t("public.precios.choose_plan")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
