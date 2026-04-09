import { useForm, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { FormField } from "@/components/auth/FormField"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { routes } from "@/lib/routes"

export default function Register() {
  const { t } = useTranslation()
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email_address: "",
    password: "",
    password_confirmation: "",
    privacy_accepted: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(routes.registration)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.sign_up")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.has_account")}{" "}
          <Link href={routes.login} className="text-foreground underline underline-offset-4 hover:text-primary">
            {t("auth.sign_in")}
          </Link>
        </p>
      </div>

      <OAuthButtons />

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          {t("auth.or_email")}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="name"
          label={t("auth.name")}
          autoComplete="name"
          value={data.name}
          onChange={(v) => setData("name", v)}
          error={errors.name}
          required
        />

        <FormField
          id="email_address"
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          value={data.email_address}
          onChange={(v) => setData("email_address", v)}
          error={errors.email_address}
          required
        />

        <FormField
          id="password"
          label={t("auth.password")}
          type="password"
          autoComplete="new-password"
          value={data.password}
          onChange={(v) => setData("password", v)}
          error={errors.password}
          required
        />

        <FormField
          id="password_confirmation"
          label={t("auth.confirm_password")}
          type="password"
          autoComplete="new-password"
          value={data.password_confirmation}
          onChange={(v) => setData("password_confirmation", v)}
          error={errors.password_confirmation}
          required
        />

        <div className="flex items-start gap-2">
          <Checkbox
            id="privacy_accepted"
            checked={data.privacy_accepted}
            onCheckedChange={(checked) => setData("privacy_accepted", checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="privacy_accepted" className="text-sm font-normal leading-snug">
            {t("auth.accept_privacy_prefix")}{" "}
            <Link
              href={routes.privacyPolicy}
              className="underline underline-offset-4 hover:text-primary"
            >
              {t("auth.accept_privacy_link")}
            </Link>
          </Label>
        </div>
        {errors.privacy_accepted && (
          <p className="text-sm text-destructive">{errors.privacy_accepted}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={processing || !data.privacy_accepted}
        >
          {processing ? t("common.loading") : t("auth.sign_up")}
        </Button>
      </form>
    </div>
  )
}
