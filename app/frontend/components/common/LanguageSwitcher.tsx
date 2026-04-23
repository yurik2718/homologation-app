import { useTranslation } from "react-i18next"
import { router, usePage } from "@inertiajs/react"
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
import type { PublicPageProps } from "@/types/pages"

const LANGUAGES = [
  { code: "es", label: "Español",  countryCode: "es" },
  { code: "en", label: "English",  countryCode: "gb" },
  { code: "ru", label: "Русский",  countryCode: "ru" },
]

interface LanguageSwitcherProps {
  /** "authenticated" patches user locale; "public" navigates to alternate URL */
  mode?: "authenticated" | "public"
  /** Use on dark backgrounds (e.g. sidebar, dark panel) */
  variant?: "default" | "ghost-dark"
}

export function LanguageSwitcher({
  mode = "authenticated",
  variant = "default",
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const page = usePage<SharedProps & PublicPageProps>()

  const changeLanguage = (code: string) => {
    if (mode === "public") {
      i18n.changeLanguage(code)
      const alternates = page.props.seo?.alternates ?? []
      const currentPath = page.url
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
    } else {
      if (page.props.auth?.user) {
        // Server is source of truth; AuthenticatedLayout useEffect applies i18n after response.
        router.patch(routes.profile, { locale: code }, { preserveState: true })
      } else {
        void i18n.changeLanguage(code)
      }
    }
  }

  // Determine which language is active
  const activeCode =
    mode === "public"
      ? (page.props.seo?.locale ?? "en")
      : i18n.language

  const current = LANGUAGES.find((l) => l.code === activeCode) ?? LANGUAGES[0]

  const buttonClass =
    variant === "ghost-dark"
      ? "text-zinc-300 hover:text-white hover:bg-white/10 border-transparent"
      : ""

  return (
    // modal={false}: modal mode locks body.style.pointerEvents="none" via a module-level
    // var in @radix-ui/react-dismissable-layer; a re-render on close (i18n) leaves it stuck.
    <DropdownMenu modal={false}>
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
          const isActive = activeCode === lang.code
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
