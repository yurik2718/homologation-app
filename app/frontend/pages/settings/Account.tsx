import { useState } from "react"
import { useForm, usePage, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { ShieldAlert } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { SettingsLayout } from "@/components/settings/SettingsLayout"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { SettingsAccountProps } from "@/types/pages"

export default function SettingsAccount() {
  const { t } = useTranslation()
  const { account } = usePage<SharedProps & SettingsAccountProps>().props
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false)

  const { data, setData, patch, processing, errors, reset } = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  })

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(routes.settings.account, {
      onSuccess: () => reset(),
    })
  }

  function handleRequestDeletion() {
    router.post(routes.settings.requestDeletion, {}, {
      onSuccess: () => setShowDeletionConfirm(false),
    })
  }

  const isOAuth = !!account.provider
  const canChangePassword = !isOAuth || account.hasPassword

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("nav.settings"), href: routes.settings.profile },
        { label: t("settings.nav.account") },
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
              <h2 className="text-lg font-semibold">{t("settings.nav.account")}</h2>
              <p className="text-sm text-muted-foreground">{t("settings.account.description")}</p>
            </div>
            <Separator />

            {/* Email — read only */}
            <div className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label>{t("auth.email")}</Label>
                <Input value={account.email} readOnly className="bg-muted cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">{t("settings.account.email_readonly")}</p>
              </div>
            </div>

            {/* Connected OAuth account */}
            {isOAuth && (
              <>
                <Separator />
                <div className="space-y-3 max-w-lg">
                  <h3 className="text-sm font-medium">{t("settings.account.connected_accounts")}</h3>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium capitalize">{account.provider}</p>
                      <p className="text-xs text-muted-foreground">{t("settings.account.oauth_connected")}</p>
                    </div>
                    <Badge variant="secondary">{t("settings.account.connected")}</Badge>
                  </div>
                </div>
              </>
            )}

            {/* Password change */}
            {canChangePassword && (
              <>
                <Separator />
                <div className="space-y-4 max-w-lg">
                  <div>
                    <h3 className="text-sm font-medium">{t("settings.account.change_password")}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t("settings.account.change_password_hint")}</p>
                  </div>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="current_password">{t("settings.account.current_password")}</Label>
                      <Input
                        id="current_password"
                        type="password"
                        value={data.current_password}
                        onChange={(e) => setData("current_password", e.target.value)}
                        required
                      />
                      {errors.current_password && (
                        <p className="text-sm text-destructive">{errors.current_password}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password">{t("settings.account.new_password")}</Label>
                      <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        required
                        minLength={8}
                      />
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password_confirmation">{t("auth.confirm_password")}</Label>
                      <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData("password_confirmation", e.target.value)}
                        required
                        minLength={8}
                      />
                      {errors.password_confirmation && (
                        <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                      )}
                    </div>
                    <Button type="submit" className="min-h-[44px]" disabled={processing}>
                      {t("settings.account.update_password")}
                    </Button>
                  </form>
                </div>
              </>
            )}

            {/* GDPR Data Export */}
            <Separator />
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">{t("settings.account.data_export")}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t("settings.account.data_export_description")}</p>
              </div>
              <Button variant="outline" className="min-h-[44px]" asChild>
                <a href={routes.settings.dataExport}>{t("settings.account.data_export_download")}</a>
              </Button>
            </div>

            {/* Danger Zone */}
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <h3 className="text-base font-semibold text-destructive">{t("settings.account.danger_zone")}</h3>
              </div>
              <Card className="border-destructive/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t("settings.account.delete_account")}</CardTitle>
                  <CardDescription>{t("settings.account.delete_description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {account.deletionRequestedAt ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Badge variant="destructive">{t("settings.account.deletion_pending")}</Badge>
                      <p className="text-xs text-muted-foreground">{t("settings.account.deletion_pending_hint")}</p>
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      className="min-h-[44px]"
                      onClick={() => setShowDeletionConfirm(true)}
                    >
                      {t("settings.account.request_deletion")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <ConfirmDialog
            open={showDeletionConfirm}
            onOpenChange={setShowDeletionConfirm}
            title={t("settings.account.delete_confirm_title")}
            description={t("settings.account.delete_confirm_description")}
            onConfirm={handleRequestDeletion}
            destructive
          />
        </SettingsLayout>
      </Main>
    </AuthenticatedLayout>
  )
}
