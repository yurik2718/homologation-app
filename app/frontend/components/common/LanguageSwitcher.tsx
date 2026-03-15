import { useTranslation } from "react-i18next"
import { router } from "@inertiajs/react"
import { usePage } from "@inertiajs/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { auth } = usePage<SharedProps>().props

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    if (auth.user) {
      router.patch(routes.profile, { locale: code }, { preserveState: true })
    }
  }

  const current = LANGUAGES.find((l) => l.code === i18n.language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <span>{current?.flag ?? "🌐"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={i18n.language === lang.code ? "font-semibold" : ""}
          >
            {lang.flag} {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
