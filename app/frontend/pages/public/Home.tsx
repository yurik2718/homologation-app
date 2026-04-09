import { usePage } from "@inertiajs/react"
import { Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  FileCheck,
  GraduationCap,
  Languages,
  MessageCircle,
  Shield,
  Users,
  BarChart3,
  Globe,
  ClipboardCheck,
  Sparkles,
} from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SeoHead } from "@/components/public/SeoHead"
import {
  Reveal,
  AnimatedCounter,
  TiltCard,
} from "@/components/public/animations"
import {
  Container,
  GradientButton,
  PublicHero,
  PublicCta,
  PublicSection,
  SectionHeading,
} from "@/components/public/shared"
import { ConsultationDialog } from "@/components/public/ConsultationDialog"
import { publicRoute, publicPages, routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

export default function Home() {
  const { seo } = usePage<SharedProps & PublicPageProps>().props
  const { t } = useTranslation()
  const locale = seo.locale

  return (
    <PublicLayout>
      <SeoHead {...seo} />
      <HeroSection t={t} />
      <TrustSection t={t} />
      <ServicesSection t={t} locale={locale} />
      <HowItWorksSection t={t} />
      <AdvantagesSection t={t} />
      <CtaSection t={t} />
    </PublicLayout>
  )
}

function HeroSection({ t }: { t: (key: string) => string }) {
  const illustration = (
    <div className="hidden lg:flex items-center justify-center">
      <div className="relative w-full max-w-md aspect-square">
        {/* Main card */}
        <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-white to-blue-50/80 border border-white/80 shadow-2xl shadow-[#2D7FF9]/10 flex items-center justify-center backdrop-blur-sm">
          <GraduationCap className="h-32 w-32 text-[#2D7FF9]/20" />
        </div>
        {/* Floating accent cards */}
        <div
          className="absolute -top-2 -right-2 w-20 h-20 rounded-xl bg-white shadow-lg shadow-[#E8453C]/10 border border-[#E8453C]/10 flex items-center justify-center"
          style={{ animation: "float 6s ease-in-out infinite" }}
        >
          <FileCheck className="h-8 w-8 text-[#E8453C]/60" />
        </div>
        <div
          className="absolute -bottom-2 -left-2 w-20 h-20 rounded-xl bg-white shadow-lg shadow-[#2D7FF9]/10 border border-[#2D7FF9]/10 flex items-center justify-center"
          style={{ animation: "float 7s ease-in-out infinite", animationDelay: "1s" }}
        >
          <Shield className="h-8 w-8 text-[#2D7FF9]/60" />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#2D7FF9]/10 animate-[spin_40s_linear_infinite]" />
      </div>
    </div>
  )

  return (
    <PublicHero
      title1={t("public.home.hero_title_1")}
      titleAccent={t("public.home.hero_title_accent")}
      subtitle={t("public.home.hero_subtitle")}
      illustration={illustration}
      actions={
        <>
          <GradientButton href={routes.register} className="w-full sm:w-auto">
            {t("public.home.cta_start")}
          </GradientButton>
          <ConsultationDialog>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-h-[44px] text-base hover:bg-slate-50 transition-all duration-300"
            >
              {t("public.home.cta_consult")}
            </Button>
          </ConsultationDialog>
        </>
      }
    />
  )
}

function TrustSection({ t }: { t: (key: string) => string }) {
  const stats = [
    { value: 500, suffix: "+", label: t("public.home.stat_students") },
    { value: 98, suffix: "%", label: t("public.home.stat_success") },
    { value: 10, suffix: "+", label: t("public.home.stat_years") },
    { value: 20, suffix: "+", label: t("public.home.stat_countries") },
  ]

  return (
    <section className="border-y bg-white py-16">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map(({ value, suffix, label }, i) => (
            <Reveal key={label} direction="up" delay={i * 100}>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] bg-clip-text text-transparent">
                  <AnimatedCounter value={value} suffix={suffix} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function ServicesSection({ t, locale }: { t: (key: string) => string; locale: string }) {
  const services = [
    {
      icon: FileCheck,
      title: t("public.home.service_homologacion_title"),
      desc: t("public.home.service_homologacion_desc"),
      href: publicRoute(publicPages.homologacion, locale),
    },
    {
      icon: GraduationCap,
      title: t("public.home.service_universidad_title"),
      desc: t("public.home.service_universidad_desc"),
      href: publicRoute(publicPages.universidad, locale),
    },
    {
      icon: Languages,
      title: t("public.home.service_espanol_title"),
      desc: t("public.home.service_espanol_desc"),
      href: publicRoute(publicPages.espanol, locale),
    },
  ]

  return (
    <PublicSection className="bg-slate-50" dots>
      <SectionHeading
        title={t("public.home.services_title")}
        subtitle={t("public.home.services_subtitle")}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, title, desc, href }, i) => (
          <Reveal key={title} direction="up" delay={i * 120}>
            <TiltCard>
              <Card className="group cursor-pointer border bg-white transition-all duration-300 hover:shadow-xl hover:shadow-[#2D7FF9]/5">
                <CardContent className="p-8">
                  <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 p-3 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-[#2D7FF9]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                  <Link
                    href={href}
                    className="inline-flex items-center text-sm font-medium text-[#2D7FF9] group-hover:underline"
                  >
                    {t("public.home.learn_more")}
                  </Link>
                </CardContent>
              </Card>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </PublicSection>
  )
}

function HowItWorksSection({ t }: { t: (key: string) => string }) {
  const steps = [
    { icon: ClipboardCheck, label: t("public.home.step_1") },
    { icon: FileCheck, label: t("public.home.step_2") },
    { icon: Shield, label: t("public.home.step_3") },
    { icon: GraduationCap, label: t("public.home.step_4") },
    { icon: Sparkles, label: t("public.home.step_5") },
  ]

  return (
    <PublicSection className="bg-white">
      <SectionHeading
        title={t("public.home.how_title")}
        subtitle={t("public.home.how_subtitle")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {steps.map(({ icon: Icon, label }, i) => (
          <Reveal key={i} direction="up" delay={i * 120}>
            <Card className="border bg-white text-center transition-all duration-300 hover:shadow-lg hover:border-[#2D7FF9]/20 group">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 inline-flex rounded-lg bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 p-3 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6 text-[#2D7FF9]" />
                </div>
                <p className="text-sm font-medium leading-snug">{label}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </PublicSection>
  )
}

function AdvantagesSection({ t }: { t: (key: string) => string }) {
  const advantages = [
    { icon: Users, label: t("public.home.adv_coordinator") },
    { icon: MessageCircle, label: t("public.home.adv_chat") },
    { icon: BarChart3, label: t("public.home.adv_tracking") },
    { icon: Shield, label: t("public.home.adv_security") },
    { icon: Globe, label: t("public.home.adv_languages") },
    { icon: FileCheck, label: t("public.home.adv_crm") },
  ]

  return (
    <PublicSection className="bg-slate-50" dots>
      <SectionHeading title={t("public.home.advantages_title")} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {advantages.map(({ icon: Icon, label }, i) => (
          <Reveal key={label} direction="up" delay={i * 80}>
            <Card className="border bg-white transition-all duration-300 hover:shadow-md hover:border-[#2D7FF9]/20 group">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="shrink-0 rounded-lg bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 p-3 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-[#2D7FF9]" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </PublicSection>
  )
}

function CtaSection({ t }: { t: (key: string) => string }) {
  return (
    <PublicCta
      title={t("public.home.cta_title")}
      subtitle={t("public.home.cta_subtitle")}
    >
      <GradientButton href={routes.register} className="w-full sm:w-auto">
        {t("public.home.cta_start")}
      </GradientButton>
      <ConsultationDialog>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto min-h-[44px] text-base border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-300"
        >
          {t("public.home.cta_consult")}
        </Button>
      </ConsultationDialog>
    </PublicCta>
  )
}
