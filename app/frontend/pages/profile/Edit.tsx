import { useForm, Link, usePage, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { ProfileEditProps } from "@/types/pages"

const GUARDIAN_FIELDS = [
  { key: "guardian_name" as const, type: "text", label: "profile.guardian_name" },
  { key: "guardian_email" as const, type: "email", label: "profile.guardian_email" },
  { key: "guardian_phone" as const, type: "tel", label: "profile.guardian_phone" },
  { key: "guardian_whatsapp" as const, type: "tel", label: "profile.guardian_whatsapp" },
]

export default function Edit() {
  const { t } = useTranslation()
  const { profile, selectOptions } = usePage<SharedProps & ProfileEditProps>().props

  const { data, setData, patch, processing, errors } = useForm({
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? "",
    birthday: profile.birthday ?? "",
    country: profile.country ?? "",
    locale: profile.locale ?? "es",
    is_minor: profile.isMinor ?? false,
    guardian_name: profile.guardianName ?? "",
    guardian_email: profile.guardianEmail ?? "",
    guardian_phone: profile.guardianPhone ?? "",
    guardian_whatsapp: profile.guardianWhatsapp ?? "",
    notification_email: profile.notificationEmail ?? true,
    notification_telegram: profile.notificationTelegram ?? false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(routes.profile)
  }

  function handleConnectTelegram() {
    router.post(routes.connectTelegram)
  }

  function handleDisconnectTelegram() {
    router.delete(routes.disconnectTelegram)
  }

  const title = profile.profileComplete ? t("profile.edit_title") : t("profile.complete_title")

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-lg px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("profile.name")}</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  required
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp">
                  {t("profile.whatsapp")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder={t("profile.whatsapp_hint")}
                  value={data.whatsapp}
                  onChange={(e) => setData("whatsapp", e.target.value)}
                  required
                />
                {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t("profile.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              {/* Birthday */}
              <div className="space-y-2">
                <Label htmlFor="birthday">
                  {t("profile.birthday")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={data.birthday}
                  onChange={(e) => setData("birthday", e.target.value)}
                  required
                />
                {errors.birthday && <p className="text-sm text-destructive">{errors.birthday}</p>}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">
                  {t("profile.country")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.country}
                  onValueChange={(val) => setData("country", val)}
                >
                  <SelectTrigger id="country" className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectOptions.countries ?? []).map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="locale">{t("profile.locale")}</Label>
                <Select
                  value={data.locale}
                  onValueChange={(val) => setData("locale", val)}
                >
                  <SelectTrigger id="locale" className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">{t("profile.locale_es")}</SelectItem>
                    <SelectItem value="en">{t("profile.locale_en")}</SelectItem>
                    <SelectItem value="ru">{t("profile.locale_ru")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.locale && <p className="text-sm text-destructive">{errors.locale}</p>}
              </div>

              {/* Minor checkbox */}
              <div className="flex items-center gap-3 py-1">
                <Checkbox
                  id="is_minor"
                  checked={data.is_minor}
                  onCheckedChange={(checked) => setData("is_minor", !!checked)}
                  className="min-h-[20px] min-w-[20px]"
                />
                <Label htmlFor="is_minor" className="cursor-pointer">
                  {t("profile.is_minor")}
                </Label>
              </div>

              {/* Guardian fields — shown when minor */}
              {data.is_minor && (
                <div className="space-y-4 rounded-md border p-4">
                  <p className="text-sm font-medium">{t("profile.guardian_section")}</p>
                  {GUARDIAN_FIELDS.map(({ key, type, label }) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{t(label)}</Label>
                      <Input
                        id={key}
                        type={type}
                        value={data[key]}
                        onChange={(e) => setData(key, e.target.value)}
                      />
                      {errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Notification preferences */}
              <div className="space-y-4">
                <p className="text-sm font-medium">{t("profile.notifications_section")}</p>

                {/* Email notifications toggle */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="notification_email"
                    checked={data.notification_email}
                    onCheckedChange={(checked) => setData("notification_email", !!checked)}
                    className="min-h-[20px] min-w-[20px]"
                  />
                  <Label htmlFor="notification_email" className="cursor-pointer">
                    {t("profile.email_notifications")}
                  </Label>
                </div>

                {/* Telegram section */}
                <div className="rounded-md border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {profile.telegramConnected
                          ? `✅ ${t("profile.telegram_connected")}`
                          : t("profile.connect_telegram")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{t("profile.telegram_hint")}</p>
                    </div>
                    {profile.telegramConnected ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] shrink-0"
                        onClick={handleDisconnectTelegram}
                      >
                        {t("profile.disconnect_telegram")}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="min-h-[44px] shrink-0"
                        onClick={handleConnectTelegram}
                      >
                        {t("profile.connect_telegram")}
                      </Button>
                    )}
                  </div>

                  {/* Telegram notifications toggle — only if connected */}
                  {profile.telegramConnected && (
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="notification_telegram"
                        checked={data.notification_telegram}
                        onCheckedChange={(checked) => setData("notification_telegram", !!checked)}
                        className="min-h-[20px] min-w-[20px]"
                      />
                      <Label htmlFor="notification_telegram" className="cursor-pointer">
                        {t("profile.telegram_notifications")}
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Save button */}
              <Button
                type="submit"
                className="w-full min-h-[44px]"
                disabled={processing}
              >
                {t("profile.save_continue")}
              </Button>

              {/* Privacy policy */}
              <p className="text-center text-sm text-muted-foreground">
                <Link href={routes.privacyPolicy} className="underline hover:text-foreground">
                  {t("auth.accept_privacy")}
                </Link>
              </p>

              {/* Delete account */}
              <p className="text-center text-sm text-muted-foreground">
                {t("profile.delete_account")}
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
