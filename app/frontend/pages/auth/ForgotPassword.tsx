import { useForm, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { routes } from "@/lib/routes"

export default function ForgotPassword() {
  const { t } = useTranslation()
  const { data, setData, post, processing, errors } = useForm({
    email_address: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(routes.passwords)
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t("auth.forgot_password")}</CardTitle>
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

            <Button type="submit" className="w-full min-h-[44px]" disabled={processing}>
              {t("auth.reset_password")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            <Link href={routes.login} className="underline">
              {t("auth.sign_in")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
