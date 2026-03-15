import { useForm, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SharedProps } from "@/types"
import type { ResetPasswordProps } from "@/types/pages"
import { routes } from "@/lib/routes"

export default function ResetPassword() {
  const { t } = useTranslation()
  const { token } = usePage<SharedProps & ResetPasswordProps>().props
  const { data, setData, put, processing, errors } = useForm({
    password: "",
    password_confirmation: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put(routes.password(token))
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t("auth.reset_password")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button type="submit" className="w-full min-h-[44px]" disabled={processing}>
              {t("auth.reset_password")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
