import { useForm, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { SettingsLayout } from "@/components/settings/SettingsLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { routes } from "@/lib/routes"
import { GUARDIAN_FIELDS } from "@/lib/guardian-fields"
import { getOptionLabel, countryFlag } from "@/lib/utils"
import type { SharedProps } from "@/types"
import type { SettingsProfileProps } from "@/types/pages"

export default function SettingsProfile() {
  const { t } = useTranslation()
  const { auth, profile, selectOptions } = usePage<SharedProps & SettingsProfileProps>().props
  const locale = auth.user?.locale ?? "es"

  // Sort countries alphabetically in the user's locale; "other" always last
  // so the catch-all doesn't get buried in the middle of the alphabet.
  const countries = [ ...(selectOptions.countries ?? []) ].sort((a, b) => {
    if (a.key === "other") return 1
    if (b.key === "other") return -1
    return getOptionLabel(a, locale).localeCompare(getOptionLabel(b, locale), locale)
  })

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
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(routes.settings.profile)
  }

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("nav.settings"), href: routes.settings.profile },
        { label: t("settings.nav.profile") },
      ]}
    >
      <Main>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("settings.description")}</p>
        </div>
        <Separator className="mb-6" />
        <SettingsLayout>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{t("settings.nav.profile")}</h2>
              <p className="text-sm text-muted-foreground">{t("settings.profile.description")}</p>
            </div>
            <Separator />
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("profile.name")}</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  required
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("profile.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <Label htmlFor="country">
                  {t("profile.country")} <span className="text-destructive">*</span>
                </Label>
                <Select value={data.country} onValueChange={(val) => setData("country", val)}>
                  <SelectTrigger id="country" className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {countryFlag(opt.key)} {getOptionLabel(opt, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="locale">{t("profile.locale")}</Label>
                <Select value={data.locale} onValueChange={(val) => setData("locale", val)}>
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

              {data.is_minor && (
                <div className="space-y-4 rounded-md border p-4">
                  <p className="text-sm font-medium">{t("profile.guardian_section")}</p>
                  {GUARDIAN_FIELDS.map(({ key, type, label }) => (
                    <div key={key} className="space-y-1.5">
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

              <Button type="submit" className="min-h-[44px]" disabled={processing}>
                {t("common.save")}
              </Button>
            </form>
          </div>
        </SettingsLayout>
      </Main>
    </AuthenticatedLayout>
  )
}
