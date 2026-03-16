import { useForm, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { routes } from "@/lib/routes"

export default function Login() {
  const { t } = useTranslation()
  const { data, setData, post, processing, errors } = useForm({
    email_address: "",
    password: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(routes.session)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.sign_in")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.no_account")}{" "}
          <Link href={routes.register} className="text-foreground underline underline-offset-4 hover:text-primary">
            {t("auth.sign_up")}
          </Link>
        </p>
      </div>

      {/* OAuth buttons — above the form, Google first */}
      <OAuthButtons />

      {/* Divider */}
      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          {t("auth.or_email")}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email_address">{t("auth.email")}</Label>
          <Input
            id="email_address"
            type="email"
            autoComplete="email"
            placeholder="nombre@ejemplo.com"
            value={data.email_address}
            onChange={(e) => setData("email_address", e.target.value)}
            required
          />
          {errors.email_address && (
            <p className="text-xs text-destructive">{errors.email_address}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Link
              href={routes.forgotPassword}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {t("auth.forgot_password")}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={data.password}
            onChange={(e) => setData("password", e.target.value)}
            required
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={processing}>
          {processing ? t("common.loading") : t("auth.sign_in")}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        {t("auth.privacy_notice")}{" "}
        <Link href={routes.privacyPolicy} className="underline underline-offset-4 hover:text-foreground">
          {t("privacy.title")}
        </Link>
      </p>
    </div>
  )
}
