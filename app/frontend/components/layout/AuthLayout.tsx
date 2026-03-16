import { useTranslation } from "react-i18next"
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher"
import { GraduationCap } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col bg-zinc-900 text-white p-10">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="h-6 w-6" />
          <span>{t("app.name")}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <blockquote className="space-y-4">
            <p className="text-2xl font-light leading-relaxed text-zinc-100">
              {t("auth.branding_headline")}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t("auth.branding_sub")}
            </p>
          </blockquote>
        </div>
        <p className="text-xs text-zinc-500">{t("auth.branding_footer")}</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 lg:p-6">
          {/* App name — shown only on mobile */}
          <div className="flex items-center gap-2 lg:invisible">
            <GraduationCap className="h-5 w-5" />
            <span className="font-semibold text-sm">{t("app.name")}</span>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
