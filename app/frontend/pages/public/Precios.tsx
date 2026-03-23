import { usePage } from "@inertiajs/react"
import { Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { CheckCircle2 } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SeoHead } from "@/components/public/SeoHead"
import { Reveal, ShimmerBorder } from "@/components/public/animations"
import {
  GradientButton,
  PublicHero,
  PublicCta,
  OutlineCtaButton,
  PublicSection,
  SectionHeading,
} from "@/components/public/shared"
import { publicRoute, publicPages, routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

export default function Precios() {
  const { seo } = usePage<SharedProps & PublicPageProps>().props
  const { t } = useTranslation()
  const locale = seo.locale

  const plans = [
    {
      key: "basico",
      features: 4,
      highlighted: false,
    },
    {
      key: "completo",
      features: 8,
      highlighted: true,
    },
    {
      key: "premium",
      features: 8,
      highlighted: false,
    },
  ]

  return (
    <PublicLayout>
      <SeoHead {...seo} />

      {/* Hero */}
      <PublicHero
        title1={t("public.precios.hero_title_1")}
        titleAccent={t("public.precios.hero_title_accent")}
        subtitle={t("public.precios.hero_subtitle")}
      />

      {/* Pricing cards */}
      <PublicSection className="bg-white">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto items-start">
          {plans.map(({ key, features, highlighted }, i) => (
            <Reveal key={key} direction="up" delay={i * 120}>
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

      {/* FAQ */}
      <PublicSection className="bg-slate-50" dots>
        <SectionHeading title={t("public.precios.faq_title")} />
        <Reveal direction="up" delay={100}>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {Array.from({ length: 4 }, (_, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    {t(`public.precios.faq_${i + 1}_q`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t(`public.precios.faq_${i + 1}_a`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
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
      className={`border relative transition-all duration-300 hover:shadow-xl group ${
        highlighted ? "border-[#2D7FF9]/30 shadow-lg scale-[1.02]" : "hover:-translate-y-1"
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
      <CardContent className="pt-4">
        <div className="space-y-3 mb-6">
          {Array.from({ length: features }, (_, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#2D7FF9] mt-0.5 shrink-0" />
              <span className="text-sm">{t(`public.precios.plan_${planKey}_feature_${i + 1}`)}</span>
            </div>
          ))}
        </div>
        <Link href={routes.register}>
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
