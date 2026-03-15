import { useForm, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { routes } from "@/lib/routes"

export default function Login() {
  const { t } = useTranslation()
  const { data, setData, post, processing, errors } = useForm({
    email_address: "",
    password: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(routes.logout)
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t("auth.sign_in")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email_address">{t("auth.email")}</Label>
              <Input
                id="email_address"
                type="email"
                autoComplete="email"
                value={data.email_address}
                onChange={(e) => setData("email_address", e.target.value)}
                required
              />
              {errors.email_address && (
                <p className="text-sm text-destructive">{errors.email_address}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link
                  href={routes.forgotPassword}
                  className="text-sm text-muted-foreground hover:underline"
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
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full min-h-[44px]" disabled={processing}>
              {t("auth.sign_in")}
            </Button>
          </form>

          <OAuthButtons />

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.no_account")}{" "}
            <Link href={routes.register} className="underline">
              {t("auth.sign_up")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
