import { useState } from "react"
import { useForm, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { routes } from "@/lib/routes"

export default function Register() {
  const { t } = useTranslation()
  // privacyAccepted is UI-only state: it gates the submit button but is not sent to the server
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email_address: "",
    password: "",
    password_confirmation: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(routes.registration)
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t("auth.sign_up")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                required
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

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
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                required
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">{t("auth.confirm_password")}</Label>
              <Input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                value={data.password_confirmation}
                onChange={(e) => setData("password_confirmation", e.target.value)}
                required
              />
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">{errors.password_confirmation}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="privacy_accepted"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="privacy_accepted" className="text-sm font-normal leading-snug">
                {t("auth.accept_privacy")}
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full min-h-[44px]"
              disabled={processing || !privacyAccepted}
            >
              {t("auth.sign_up")}
            </Button>
          </form>

          <OAuthButtons />

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.has_account")}{" "}
            <Link href={routes.login} className="underline">
              {t("auth.sign_in")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
