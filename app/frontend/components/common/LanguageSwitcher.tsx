import { useTranslation } from "react-i18next"
import { router } from "@inertiajs/react"
import { usePage } from "@inertiajs/react"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import { FlagIcon } from "@/components/common/FlagIcon"
import type { SharedProps } from "@/types"

const LANGUAGES = [
  { code: "es", label: "Español",  countryCode: "es" },
  { code: "en", label: "English",  countryCode: "gb" },
  { code: "ru", label: "Русский",  countryCode: "ru" },
]

interface LanguageSwitcherProps {
  /** Use on dark backgrounds (e.g. sidebar, dark panel) */
  variant?: "default" | "ghost-dark"
}

export function LanguageSwitcher({ variant = "default" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const { auth } = usePage<SharedProps>().props

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    if (auth.user) {
      router.patch(routes.profile, { locale: code }, { preserveState: true })
    }
  }

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  const buttonClass =
    variant === "ghost-dark"
      ? "text-zinc-300 hover:text-white hover:bg-white/10 border-transparent"
      : ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-2 px-3 font-normal ${buttonClass}`}
        >
          <FlagIcon code={current.countryCode} />
          <span className="text-sm">{current.code.toUpperCase()}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {LANGUAGES.map((lang) => {
          const isActive = i18n.language === lang.code
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
