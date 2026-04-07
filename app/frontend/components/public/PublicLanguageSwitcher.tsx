import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { FlagIcon } from "@/components/common/FlagIcon"
import type { PublicPageProps } from "@/types/pages"

const LANGUAGES = [
  { code: "es", label: "Español",  countryCode: "es" },
  { code: "en", label: "English",  countryCode: "gb" },
  { code: "ru", label: "Русский",  countryCode: "ru" },
]

export function PublicLanguageSwitcher() {
  const { i18n } = useTranslation()
  const page = usePage<PublicPageProps>()
  const currentLocale = page.props.seo?.locale ?? "en"
  const alternates = page.props.seo?.alternates ?? []
  const currentPath = page.url

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    const target = alternates.find((a) => a.locale === code)
    if (target) {
      try {
        const url = new URL(target.url)
        router.visit(url.pathname)
      } catch {
        const path = currentPath.replace(/^\/(es|en|ru)/, `/${code}`)
        router.visit(path)
      }
    } else {
      const path = currentPath.replace(/^\/(es|en|ru)/, `/${code}`)
      router.visit(path)
    }
  }

  const current = LANGUAGES.find((l) => l.code === currentLocale) ?? LANGUAGES[1]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 px-3 font-normal"
        >
          <FlagIcon code={current.countryCode} />
          <span className="text-sm">{current.code.toUpperCase()}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {LANGUAGES.map((lang) => {
          const isActive = currentLocale === lang.code
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="gap-3 cursor-pointer"
            >
              <FlagIcon code={lang.countryCode} className="shadow-sm" />
              <span className="flex-1">{lang.label}</span>
              {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
