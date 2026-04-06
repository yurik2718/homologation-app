import { usePage } from "@inertiajs/react"
import { Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  CheckCircle2,
  MessageCircle,
  Mail,
  ArrowLeft,
} from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SeoHead } from "@/components/public/SeoHead"
import { Reveal } from "@/components/public/animations"
import { Container } from "@/components/public/shared"
import { publicRoute, publicPages } from "@/lib/routes"
import { CONTACT_WHATSAPP, CONTACT_EMAIL, formatPhone } from "@/lib/constants"
import type { SharedProps } from "@/types"
import type { PublicPageProps } from "@/types/pages"

export default function ConsultationThankYou() {
  const { seo } = usePage<SharedProps & PublicPageProps>().props
  const { t } = useTranslation()

  return (
    <PublicLayout>
      <SeoHead {...seo} />

      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20 sm:py-32 min-h-[80vh] flex items-center">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            {/* Success icon */}
            <Reveal direction="up">
              <div className="mx-auto mb-6 inline-flex rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </Reveal>

            {/* Title */}
            <Reveal direction="up" delay={100}>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {t("public.consultation_thank_you.title")}
              </h1>
              <p className="text-lg text-muted-foreground mb-12">
                {t("public.consultation_thank_you.subtitle")}
              </p>
            </Reveal>

            {/* Next steps */}
            <Reveal direction="up" delay={200}>
              <Card className="mb-10 text-left">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4">
                    {t("public.consultation_thank_you.next_steps_title")}
                  </h2>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] text-white flex items-center justify-center text-xs font-bold">
                          {i}
                        </div>
                        <span className="text-sm pt-1">
                          {t(`public.consultation_thank_you.step_${i}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {/* Contact cards */}
            <Reveal direction="up" delay={300}>
              <h2 className="font-semibold text-lg mb-2">
                {t("public.consultation_thank_you.contact_title")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t("public.consultation_thank_you.contact_subtitle")}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mb-10">
                <a
                  href={`https://wa.me/${CONTACT_WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group cursor-pointer">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="shrink-0 rounded-lg bg-green-100 p-2.5 transition-transform duration-300 group-hover:scale-110">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">
                          {t("public.consultation_thank_you.whatsapp")}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatPhone(CONTACT_WHATSAPP)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="block"
                >
                  <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-[#2D7FF9]/10 group cursor-pointer">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="shrink-0 rounded-lg bg-blue-100 p-2.5 transition-transform duration-300 group-hover:scale-110">
                        <Mail className="h-5 w-5 text-[#2D7FF9]" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">
                          {t("public.consultation_thank_you.email")}
                        </p>
                        <p className="text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </div>
            </Reveal>

            {/* Back to home */}
            <Reveal direction="up" delay={400}>
              <Link href={publicRoute(publicPages.home, seo.locale)}>
                <Button variant="outline" size="lg" className="min-h-[44px]">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("public.consultation_thank_you.back_home")}
                </Button>
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>
    </PublicLayout>
  )
}
