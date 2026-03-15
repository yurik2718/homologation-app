import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { csrfToken } from "@/lib/utils"

/**
 * Native POST forms — required for OmniAuth middleware to intercept.
 * Not Inertia forms: OmniAuth is a Rack middleware that must see real POST requests.
 */
export function OAuthButtons() {
  const { t } = useTranslation()

  return (
    <>
      <div className="relative flex items-center py-2">
        <Separator className="flex-1" />
        <span className="mx-3 text-xs text-muted-foreground">{t("common.or")}</span>
        <Separator className="flex-1" />
      </div>

      <form method="post" action="/auth/google_oauth2" className="w-full">
        <input type="hidden" name="authenticity_token" value={csrfToken} />
        <Button type="submit" variant="outline" className="w-full min-h-[44px]">
          {t("auth.continue_with_google")}
        </Button>
      </form>

      <form method="post" action="/auth/apple" className="w-full">
        <input type="hidden" name="authenticity_token" value={csrfToken} />
        <Button type="submit" variant="outline" className="w-full min-h-[44px]">
          {t("auth.continue_with_apple")}
        </Button>
      </form>
    </>
  )
}
