import { usePage } from "@inertiajs/react"
import { Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  FileCheck,
  GraduationCap,
  Languages,
  MessageCircle,
  Shield,
  BarChart3,
  Bell,
  CheckCircle2,
} from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SeoHead } from "@/components/public/SeoHead"
import {
  Reveal,
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
import { TestimonialsSection } from "@/components/public/TestimonialsSection"
import { UniversityLogoBar } from "@/components/public/UniversityLogoBar"
import { TimelineSection } from "@/components/public/TimelineSection"
import { FaqSection } from "@/components/public/FaqSection"
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
      <UniversityLogoBar titleKey="public.home.logo_bar_title" noBorderTop />
      <ServicesSection t={t} locale={locale} />
      <HowItWorksSection t={t} />
      <TestimonialsBlock t={t} />
      <MidPageCta t={t} />
      <AppPlatformSection t={t} />
      <FaqBlock t={t} />
      <CtaSection t={t} />
    </PublicLayout>
  )
}

/* ── Hero — specific headline + process checklist illustration ──────────────── */

function HeroSection({ t }: { t: (key: string) => string }) {
  const checklistDone = [
    t("public.home.hero_check_1"),
    t("public.home.hero_check_2"),
    t("public.home.hero_check_3"),
  ]

  const illustration = (
    <div className="hidden lg:flex items-center justify-center">
      <div className="relative w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl shadow-[#2D7FF9]/10 border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] px-5 py-3">
            <span className="text-white font-semibold text-sm">
              {t("public.home.hero_check_title")}
            </span>
          </div>
          <div className="p-5 space-y-3">
            {checklistDone.map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm text-slate-500 line-through">
                  {label}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-[#2D7FF9] shrink-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-[#2D7FF9] animate-pulse" />
              </div>
              <span className="text-sm text-slate-800 font-medium">
                {t("public.home.hero_check_active")}
              </span>
            </div>
          </div>
        </div>
        <div
          className="absolute -bottom-4 -right-4 bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium"
          style={{ animation: "float 6s ease-in-out infinite" }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-700">
            98% {t("public.home.stat_success")}
          </span>
        </div>
      </div>
    </div>
  )

  const stats = [
    { value: "500+", label: t("public.home.stat_students") },
    { value: "98%", label: t("public.home.stat_success") },
    { value: "10+", label: t("public.home.stat_years") },
    { value: "20+", label: t("public.home.stat_countries") },
  ]

  return (
    <PublicHero
      title1={t("public.home.hero_title_1")}
      titleAccent={t("public.home.hero_title_accent")}
      subtitle={t("public.home.hero_subtitle")}
      illustration={illustration}
      actions={
        <>
          <ConsultationDialog>
            <GradientButton className="w-full sm:w-auto">
              {t("public.home.cta_start")}
            </GradientButton>
          </ConsultationDialog>
          <Link href={routes.register}>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-h-[44px] text-base hover:bg-slate-50 transition-all duration-300"
            >
              {t("public.home.cta_register")}
            </Button>
          </Link>
        </>
      }
      footer={
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {stats.map(({ value, label }) => (
            <div key={value} className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] bg-clip-text text-transparent">
                {value}
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      }
    />
  )
}

/* ── Services — 3 cards with prominent links ────────────────────────────────── */

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
                    className="inline-flex items-center text-sm font-medium text-[#2D7FF9] bg-[#2D7FF9]/5 px-3 py-1.5 rounded-lg hover:bg-[#2D7FF9]/10 transition-colors"
                  >
                    {t("public.home.learn_more")} &rarr;
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

/* ── How it works — numbered timeline instead of card grid ──────────────────── */

function HowItWorksSection({ t }: { t: (key: string) => string }) {
  return (
    <PublicSection className="bg-white">
      <SectionHeading
        title={t("public.home.how_title")}
        subtitle={t("public.home.how_subtitle")}
      />
      <TimelineSection translationPrefix="public.home" count={5} />
    </PublicSection>
  )
}

/* ── Testimonials — social proof ────────────────────────────────────────────── */

function TestimonialsBlock({ t }: { t: (key: string) => string }) {
  return (
    <PublicSection className="bg-slate-50" dots>
      <SectionHeading title={t("public.home.testimonials_title")} />
      <TestimonialsSection translationPrefix="public.home" />
    </PublicSection>
  )
}

/* ── Mid-page CTA — lightweight bridge between proof and platform demo ──────── */

function MidPageCta({ t }: { t: (key: string) => string }) {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-r from-[#E8453C]/5 via-[#2D7FF9]/5 to-[#E8453C]/5">
      <Container className="text-center">
        <Reveal direction="up">
          <h3 className="text-xl sm:text-2xl font-bold mb-6">
            {t("public.home.midpage_cta")}
          </h3>
          <ConsultationDialog>
            <GradientButton>
              {t("public.home.midpage_cta_btn")}
            </GradientButton>
          </ConsultationDialog>
        </Reveal>
      </Container>
    </section>
  )
}

/* ── Platform demo — 2-col split with mock dashboard (unchanged) ────────────── */

function AppPlatformSection({ t }: { t: (key: string) => string }) {
  const features = [
    { icon: BarChart3,     titleKey: "public.home.platform_feat_status_title", descKey: "public.home.platform_feat_status_desc" },
    { icon: MessageCircle, titleKey: "public.home.platform_feat_chat_title",   descKey: "public.home.platform_feat_chat_desc"   },
    { icon: FileCheck,     titleKey: "public.home.platform_feat_docs_title",   descKey: "public.home.platform_feat_docs_desc"   },
    { icon: Bell,          titleKey: "public.home.platform_feat_notify_title", descKey: "public.home.platform_feat_notify_desc" },
  ]

  const steps = ["platform_mock_step1", "platform_mock_step2", "platform_mock_step3", "platform_mock_step4"] as const

  const mockDashboard = (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      {/* Floating notification badge */}
      <div
        className="absolute -top-5 -right-2 sm:-right-6 z-20 bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium"
        style={{ animation: "float 5s ease-in-out infinite" }}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="text-slate-700">{t("public.home.platform_mock_updated")}</span>
      </div>

      {/* Floating security badge */}
      <div
        className="absolute -bottom-5 -left-2 sm:-left-6 z-20 bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium"
        style={{ animation: "float 7s ease-in-out infinite", animationDelay: "1.5s" }}
      >
        <Shield className="h-3.5 w-3.5 text-[#2D7FF9] shrink-0" />
        <span className="text-slate-700">{t("public.home.platform_mock_secure")}</span>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-[#2D7FF9]/10 border border-slate-100 overflow-hidden">
        {/* Fake browser chrome */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E8453C]/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-300/60" />
          <span className="ml-3 text-[11px] text-slate-400 font-mono truncate">
            app.space-for-edu.com/dashboard
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Request header */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-800 truncate">
              {t("public.home.platform_mock_request")}
            </span>
            <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              {t("public.home.platform_mock_status")}
            </span>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
              {steps.map(k => (
                <span key={k}>{t(`public.home.${k}`)}</span>
              ))}
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[42%] bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] rounded-full" />
            </div>
          </div>

          {/* Chat bubble */}
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#2D7FF9]/15 flex items-center justify-center shrink-0 text-[11px] font-bold text-[#2D7FF9]">
                M
              </div>
              <div className="bg-white rounded-xl px-3 py-2 text-xs text-slate-600 shadow-sm leading-relaxed">
                {t("public.home.platform_mock_chat_msg")}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-1.5">
            {(["diploma.pdf", "apostille.pdf"] as const).map(name => (
              <div key={name} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3 py-2">
                <FileCheck className="h-3.5 w-3.5 text-[#2D7FF9] shrink-0" />
                <span className="text-xs text-slate-600 flex-1">{name}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <PublicSection className="bg-white">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        {/* Text */}
        <div>
          <Reveal direction="up">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t("public.home.platform_title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
              {t("public.home.platform_subtitle")}
            </p>
          </Reveal>

          <div className="space-y-6">
            {features.map(({ icon: Icon, titleKey, descKey }, i) => (
              <Reveal key={titleKey} direction="up" delay={i * 100}>
                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5 rounded-lg bg-gradient-to-br from-[#E8453C]/10 to-[#2D7FF9]/10 p-2.5">
                    <Icon className="h-5 w-5 text-[#2D7FF9]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5">{t(titleKey)}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal direction="up" delay={450}>
            <div className="mt-10 flex items-center gap-2.5 text-xs text-muted-foreground border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 w-fit">
              <Shield className="h-4 w-4 text-[#2D7FF9] shrink-0" />
              <span>{t("public.home.platform_security")}</span>
            </div>
          </Reveal>
        </div>

        {/* Mock dashboard illustration */}
        <Reveal direction="right" delay={150}>
          <div className="flex justify-center lg:justify-end py-8 px-4">
            {mockDashboard}
          </div>
        </Reveal>
      </div>
    </PublicSection>
  )
}

/* ── FAQ — top-of-funnel objections ─────────────────────────────────────────── */

function FaqBlock({ t }: { t: (key: string) => string }) {
  return (
    <PublicSection className="bg-slate-50" dots>
      <SectionHeading title={t("public.home.faq_title")} />
      <FaqSection translationPrefix="public.home" count={5} />
    </PublicSection>
  )
}

/* ── Bottom CTA — consultation-first with urgency ───────────────────────────── */

function CtaSection({ t }: { t: (key: string) => string }) {
  return (
    <PublicCta
      title={t("public.home.cta_title")}
      subtitle={t("public.home.cta_subtitle")}
    >
      <ConsultationDialog>
        <GradientButton className="w-full sm:w-auto">
          {t("public.home.cta_final_start")}
        </GradientButton>
      </ConsultationDialog>
      <Link href={routes.register}>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto min-h-[44px] text-base border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-300"
        >
          {t("public.home.cta_final_register")}
        </Button>
      </Link>
    </PublicCta>
  )
}
