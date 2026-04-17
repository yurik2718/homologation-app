import { useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  Rocket, Menu, X,
  GraduationCap, Building2, BookOpen, CreditCard,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher"
import { SiteBreadcrumbs } from "@/components/public/SiteBreadcrumbs"
import { StickyCtaBar } from "@/components/public/StickyCtaBar"
import { publicRoute, publicPages, routes } from "@/lib/routes"
import { CONTACT_EMAIL, CONTACT_WHATSAPP, formatPhone } from "@/lib/constants"
import type { PublicPageProps } from "@/types/pages"

interface PublicLayoutProps {
  children: React.ReactNode
}

function useLocale(): string {
  const props = usePage<PublicPageProps>().props
  return props.seo?.locale ?? "en"
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const breadcrumbs = usePage<PublicPageProps>().props.seo?.breadcrumbs ?? []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar t={t} locale={locale} open={open} setOpen={setOpen} />
      <SiteBreadcrumbs items={breadcrumbs} />
      {/* Mobile sticky bar adds ~68 px of bottom overlap — pad the main
          region so the final CTA isn't hidden. Desktop shows only the FAB,
          which doesn't overlap content. */}
      <main className="flex-1 pb-[72px] lg:pb-0">{children}</main>
      <Footer t={t} locale={locale} />
      <StickyCtaBar />
    </div>
  )
}

const NAV_ICONS: Record<string, React.ElementType> = {
  homologacion: GraduationCap,
  universidad: Building2,
  espanol: BookOpen,
  precios: CreditCard,
}

function Navbar({
  t,
  locale,
  open,
  setOpen,
}: {
  t: (key: string) => string
  locale: string
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const { url } = usePage()

  const navLinks = [
    { key: "homologacion", href: publicRoute(publicPages.homologacion, locale) },
    { key: "universidad", href: publicRoute(publicPages.universidad, locale) },
    { key: "espanol", href: publicRoute(publicPages.espanol, locale) },
    { key: "precios", href: publicRoute(publicPages.precios, locale) },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={publicRoute(publicPages.home, locale)} className="flex items-center gap-2">
          <Rocket className="h-7 w-7 text-[#E8453C]" />
          <span className="text-xl font-bold tracking-tight">
            Space for <span className="text-[#2D7FF9]">Edu</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
            >
              {t(`public.nav.${key}`)}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher mode="public" />
          <Link href={routes.login}>
            <Button variant="outline" className="min-h-[44px]">
              {t("auth.sign_in")}
            </Button>
          </Link>
          <Link href={routes.register} aria-label={t("public.nav.start_aria")}>
            <Button className="min-h-[44px] bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] hover:opacity-90 border-0">
              {t("public.nav.start")}
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-10" aria-label={t("common.menu")}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 flex flex-col p-0" showCloseButton={false}>
              <SheetTitle className="sr-only">Menu</SheetTitle>

              {/* Sheet header: logo + close */}
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <Link
                  href={publicRoute(publicPages.home, locale)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Rocket className="h-6 w-6 text-[#E8453C]" />
                  <span className="text-lg font-bold tracking-tight">
                    Space for <span className="text-[#2D7FF9]">Edu</span>
                  </span>
                </Link>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="size-9 shrink-0" aria-label={t("common.close")}>
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              {/* Nav links */}
              <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-3 overflow-y-auto">
                {navLinks.map(({ key, href }) => {
                  const Icon = NAV_ICONS[key]
                  const isActive = url.startsWith(href)
                  return (
                    <Link
                      key={key}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px]",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      ].join(" ")}
                    >
                      <Icon className={["h-5 w-5 shrink-0", isActive ? "text-[#E8453C]" : ""].join(" ")} />
                      {t(`public.nav.${key}`)}
                    </Link>
                  )
                })}
              </nav>

              {/* Bottom: language + actions */}
              <div className="mt-auto px-4 pb-6 pt-4 border-t space-y-3">
                <div className="flex justify-start">
                  <LanguageSwitcher mode="public" />
                </div>
                <Link href={routes.login} onClick={() => setOpen(false)} className="block">
                  <Button variant="outline" className="w-full min-h-[44px] gap-2">
                    <LogIn className="h-4 w-4" />
                    {t("auth.sign_in")}
                  </Button>
                </Link>
                <Link href={routes.register} onClick={() => setOpen(false)} className="block" aria-label={t("public.nav.start_aria")}>
                  <Button className="w-full min-h-[44px] bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] hover:opacity-90 border-0">
                    {t("public.nav.start")}
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function Footer({ t, locale }: { t: (key: string) => string; locale: string }) {
  return (
    <footer className="border-t bg-zinc-900 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-6 w-6 text-[#E8453C]" />
              <span className="text-lg font-bold text-white">
                Space for <span className="text-[#2D7FF9]">Edu</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              {t("public.footer.tagline")}
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              {t("public.footer.services")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={publicRoute(publicPages.homologacion, locale)} className="hover:text-white transition-colors">
                  {t("public.nav.homologacion")}
                </Link>
              </li>
              <li>
                <Link href={publicRoute(publicPages.universidad, locale)} className="hover:text-white transition-colors">
                  {t("public.nav.universidad")}
                </Link>
              </li>
              <li>
                <Link href={publicRoute(publicPages.espanol, locale)} className="hover:text-white transition-colors">
                  {t("public.nav.espanol")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              {t("public.footer.company")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={publicRoute(publicPages.precios, locale)} className="hover:text-white transition-colors">
                  {t("public.nav.precios")}
                </Link>
              </li>
              <li>
                <Link href={routes.privacyPolicy} className="hover:text-white transition-colors">
                  {t("public.footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              {t("public.footer.contact")}
            </h3>
            <ul className="space-y-2 text-sm">
              {CONTACT_EMAIL && (
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">
                    {CONTACT_EMAIL}
                  </a>
                </li>
              )}
              {CONTACT_WHATSAPP && (
                <li>
                  <a href={`https://wa.me/${CONTACT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {formatPhone(CONTACT_WHATSAPP)}
                  </a>
                </li>
              )}
              <li>{t("public.footer.address")}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} Space for Edu. {t("public.footer.rights")}
        </div>
      </div>
    </footer>
  )
}
