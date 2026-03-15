import { useTranslation } from "react-i18next"
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("app.name")}
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
