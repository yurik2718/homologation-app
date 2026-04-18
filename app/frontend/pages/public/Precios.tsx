import { usePage } from "@inertiajs/react"
import { Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  CheckCircle2,
  Star,
  Monitor,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  Check,
  Minus,
} from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SeoHead } from "@/components/public/SeoHead"
import { Reveal, ShimmerBorder } from "@/components/public/animations"
import {
  Container,
  GradientButton,
  PublicCta,
  PublicSection,
  SectionHeading,
} from "@/components/public/shared"
import { ConsultationDialog } from "@/components/public/ConsultationDialog"
import { UniversityLogoBar } from "@/components/public/UniversityLogoBar"
import { FaqSection } from "@/components/public/FaqSection"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

/* ─── Static data ──────────────────────────────────────────────────────────────── */

const includedIcons = [Monitor, MessageCircle, BarChart3, ShieldCheck]

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

const testimonialAvatarColors = [
  "bg-[#2D7FF9]",
  "bg-[#E8453C]",
  "bg-gradient-to-br from-[#E8453C] to-[#2D7FF9]",
]

/* ─── Page ─────────────────────────────────────────────────────────────────────── */

export default function Precios() {
  const { seo } = usePage<SharedProps & PublicPageProps>().props
  const { t } = useTranslation()

  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <PublicLayout>
      <SeoHead {...seo} />

      {/* ── 1. Hero — minimal premium: badge + huge H1 + 1 line + 1 CTA ─────── */}
      <section className="relative bg-slate-50 py-16 sm:py-28 lg:py-40">
        <Container className="relative">
          <div className="max-w-4xl mx-auto text-center">
            <Reveal direction="up">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2D7FF9]/25 bg-white shadow-sm px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-semibold text-[#2D7FF9] mb-6 sm:mb-8">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>{t("public.precios.hero_guarantee_badge")}</span>
              </div>
            </Reveal>
            <Reveal direction="up">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground leading-[1.05]">
                {t("public.precios.hero_title_1")}{" "}
                <span className="bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] bg-clip-text text-transparent">
                  {t("public.precios.hero_title_accent")}
                </span>
              </h1>
            </Reveal>
            <Reveal direction="up" delay={100}>
              <p className="mt-8 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {t("public.precios.hero_subtitle")}
              </p>
            </Reveal>
            <Reveal direction="up" delay={200}>
              <div className="mt-12 flex flex-col items-center gap-5">
                <ConsultationDialog>
                  <GradientButton>
                    {t("public.precios.hero_action_verify")}
                  </GradientButton>
                </ConsultationDialog>
                <button
                  type="button"
                  onClick={scrollToPlans}
                  className="group text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] inline-flex items-center"
                >
                  <span className="border-b border-transparent group-hover:border-foreground transition-colors">
                    {t("public.precios.hero_secondary_link")}
                  </span>
                  <span className="ml-1.5 inline-block transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── 2. University trust bar ─────────────────────────────────────────── */}
      <UniversityLogoBar />

      {/* ── 2b. Cómo funciona — 3 pasos, room to breathe ────────────────────── */}
      <PublicSection className="bg-white">
        <SectionHeading
          title={t("public.precios.how_works_title")}
          subtitle={t("public.precios.how_works_subtitle")}
        />
        <div className="grid gap-12 sm:gap-10 sm:grid-cols-3 max-w-5xl mx-auto">
          {[1, 2, 3].map((n) => (
            <Reveal key={n} direction="up" delay={(n - 1) * 150}>
              <div className="text-center">
                <div
                  className="text-6xl sm:text-7xl font-bold tracking-tighter text-slate-200 leading-none select-none"
                  aria-hidden="true"
                >
                  {String(n).padStart(2, "0")}
                </div>
                <div className="mx-auto my-5 h-px w-10 bg-gradient-to-r from-[#E8453C] to-[#2D7FF9]" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">
                  {t(`public.precios.hero_step_${n}_title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {t(`public.precios.hero_step_${n}_desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* ── 3. Pricing cards ───────────────────────────────────────────────────── */}
      <PublicSection id="plans" className="bg-white">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {plans.map(({ key, features, highlighted }, i) => (
            <Reveal key={key} direction="up" delay={i * 120} className="h-full">
              {highlighted ? (
                <ShimmerBorder>
                  <PricingCard planKey={key} features={features} highlighted t={t} />
                </ShimmerBorder>
              ) : (
                <PricingCard planKey={key} features={features} highlighted={false} t={t} />
              )}
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* ── 4. Testimonials ── OPTIONAL: replace with real reviews ─────────────── */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading
          title={
            <>
              {t("public.precios.testimonials_title")} <OptionalBadge />
            </>
          }
          subtitle={t("public.precios.testimonials_subtitle")}
        />
        <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Reveal key={i} direction="up" delay={i * 100}>
              <Card className="border hover:shadow-lg transition-shadow duration-300 h-full">
                <CardContent className="pt-6 flex flex-col h-full">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic flex-1 mb-6">
                    &ldquo;{t(`public.precios.testimonial_${i}_quote`)}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${testimonialAvatarColors[i - 1]} flex items-center justify-center text-white font-semibold text-sm shrink-0`}
                    >
                      {t(`public.precios.testimonial_${i}_name`).charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {t(`public.precios.testimonial_${i}_name`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(`public.precios.testimonial_${i}_role`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* ── 5. Included in all plans ───────────────────────────────────────────── */}
      <PublicSection className="bg-white">
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

      {/* ── 6. Comparison table ────────────────────────────────────────────────── */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.precios.compare_title")} />
        <Reveal direction="up" delay={100}>
          <div className="max-w-4xl mx-auto">
            {/* Mobile: stacked feature cards with plan pills */}
            <div className="sm:hidden space-y-3">
              {comparisonMatrix.map((row, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="text-sm font-medium leading-snug mb-3">
                    {t(`public.precios.compare_feature_${i + 1}`)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["basico", "completo", "premium"] as const).map((planKey, j) => (
                      <div
                        key={planKey}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border ${
                          row[j]
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-slate-50 text-slate-400 border-slate-100"
                        }`}
                      >
                        {row[j] ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        <span className="font-medium">
                          {t(`public.precios.plan_${planKey}_title`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: classic comparison table */}
            <table className="hidden sm:table w-full">
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

      {/* ── 7. Risk reversal / guarantee ───────────────────────────────────────── */}
      <PublicSection className="bg-slate-50" dots>
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

      {/* ── 8. FAQ ─────────────────────────────────────────────────────────────── */}
      <PublicSection className="bg-white">
        <SectionHeading title={t("public.precios.faq_title")} />
        <FaqSection translationPrefix="public.precios" count={7} />
      </PublicSection>

      {/* ── 9. CTA ─────────────────────────────────────────────────────────────── */}
      <PublicCta
        title={t("public.precios.cta_title")}
        subtitle={t("public.precios.cta_subtitle")}
      >
        <GradientButton href={routes.register}>
          {t("public.precios.cta_start")}
        </GradientButton>
        <ConsultationDialog>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-h-[44px] text-base border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-300"
          >
            {t("public.precios.cta_consult")}
          </Button>
        </ConsultationDialog>
      </PublicCta>
    </PublicLayout>
  )
}

/* ─── Sub-components ───────────────────────────────────────────────────────────── */

function OptionalBadge() {
  return (
    <span className="inline-flex items-center ml-1 text-[10px] font-mono font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 align-middle">
      OPTIONAL
    </span>
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
        highlighted
          ? "overflow-visible border-[#2D7FF9]/30 shadow-lg scale-[1.02]"
          : "hover:-translate-y-1"
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
        <CardTitle className="text-base">
          {t(`public.precios.plan_${planKey}_title`)}
        </CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">
            {t(`public.precios.plan_${planKey}_price`)}
          </span>
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
              <span className="text-sm">
                {t(`public.precios.plan_${planKey}_feature_${i + 1}`)}
              </span>
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
