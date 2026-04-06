import { usePage, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  Clock,
  MessageCircle,
  CheckCircle2,
  Phone,
} from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SeoHead } from "@/components/public/SeoHead"
import { Reveal } from "@/components/public/animations"
import {
  PublicHero,
  PublicSection,
  SectionHeading,
} from "@/components/public/shared"
import { publicRoute, publicPages } from "@/lib/routes"
import { CONTACT_WHATSAPP, CONTACT_TELEGRAM } from "@/lib/constants"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

export default function Consulta() {
  const { seo } = usePage<SharedProps & PublicPageProps>().props
  const { t } = useTranslation()
  const locale = seo.locale

  const { data, setData, post, processing, errors, wasSuccessful } = useForm({
    name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(publicRoute(publicPages.consulta, locale))
  }

  return (
    <PublicLayout>
      <SeoHead {...seo} />

      {/* Hero */}
      <PublicHero
        title1={t("public.consulta.hero_title_1")}
        titleAccent={t("public.consulta.hero_title_accent")}
        subtitle={t("public.consulta.hero_subtitle")}
      />

      {/* What's included */}
      <PublicSection className="bg-white">
        <SectionHeading title={t("public.consulta.includes_title")} />
        <div className="max-w-2xl mx-auto space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Reveal key={i} direction="left" delay={i * 80}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-[#2D7FF9] mt-0.5 shrink-0" />
                <span className="text-sm">{t(`public.consulta.includes_${i + 1}`)}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </PublicSection>

      {/* Pricing + Form */}
      <PublicSection className="bg-slate-50" dots>
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left — pricing cards */}
          <div className="space-y-6">
            <Reveal direction="left">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {t("public.consulta.pricing_title")}
              </h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              <Reveal direction="up" delay={100}>
                <Card className="border transition-all duration-300 hover:shadow-md group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="h-5 w-5 text-[#2D7FF9] transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-semibold">{t("public.consulta.plan_30_title")}</span>
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {t("public.consulta.plan_30_price")}
                    </div>
                    <p className="text-sm text-muted-foreground">{t("public.consulta.plan_30_desc")}</p>
                  </CardContent>
                </Card>
              </Reveal>
              <Reveal direction="up" delay={200}>
                <Card className="border border-[#2D7FF9]/30 bg-gradient-to-br from-white to-blue-50/50 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-[#2D7FF9]/10 group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageCircle className="h-5 w-5 text-[#2D7FF9] transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-semibold">{t("public.consulta.plan_60_title")}</span>
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {t("public.consulta.plan_60_price")}
                    </div>
                    <p className="text-sm text-muted-foreground">{t("public.consulta.plan_60_desc")}</p>
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            {/* Contact links */}
            <Reveal direction="up" delay={300}>
              <Card className="border transition-all duration-300 hover:shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">{t("public.consulta.contact_title")}</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="min-h-[44px] gap-2 hover:border-green-500/30 hover:bg-green-50 transition-all duration-300" asChild>
                      <a href={`https://wa.me/${CONTACT_WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                        <Phone className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button variant="outline" className="min-h-[44px] gap-2 hover:border-[#2D7FF9]/30 hover:bg-blue-50 transition-all duration-300" asChild>
                      <a href={`https://t.me/${CONTACT_TELEGRAM}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        Telegram
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          {/* Right — contact form */}
          <Reveal direction="right" delay={150}>
            <Card className="border shadow-lg shadow-[#2D7FF9]/5">
              <CardHeader>
                <CardTitle className="text-base">{t("public.consulta.form_title")}</CardTitle>
              </CardHeader>
              <CardContent>
                {wasSuccessful ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-green-50 p-3 mb-4">
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{t("public.consulta.form_success_title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("public.consulta.form_success_desc")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>{t("public.consulta.field_name")} <span className="text-destructive">*</span></Label>
                      <Input
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("public.consulta.field_email")} <span className="text-destructive">*</span></Label>
                      <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        required
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("public.consulta.field_phone")}</Label>
                      <Input
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("public.consulta.field_topic")} <span className="text-destructive">*</span></Label>
                      <Input
                        value={data.topic}
                        onChange={(e) => setData("topic", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("public.consulta.field_message")}</Label>
                      <Textarea
                        value={data.message}
                        onChange={(e) => setData("message", e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={processing}
                      className="w-full min-h-[44px] bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] hover:opacity-90 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {processing ? t("common.loading") : t("public.consulta.form_submit")}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </PublicSection>
    </PublicLayout>
  )
}
