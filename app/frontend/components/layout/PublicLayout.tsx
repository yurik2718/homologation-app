import { useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  Rocket, Menu, X,
  GraduationCap, Building2, BookOpen, CreditCard,
  LogIn, Phone,
  ShieldCheck, Lock, Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher"
import { SiteBreadcrumbs } from "@/components/public/SiteBreadcrumbs"
import { StickyCtaBar } from "@/components/public/StickyCtaBar"
import { publicRoute, publicPages, routes } from "@/lib/routes"
import { CONTACT_EMAIL, CONTACT_WHATSAPP, formatPhone } from "@/lib/constants"
import { showCookiePreferences } from "@/lib/cookieConsent"
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
          {CONTACT_WHATSAPP && (
            <a
              href={`tel:+${CONTACT_WHATSAPP}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-2"
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span className="font-medium hidden xl:inline">{formatPhone(CONTACT_WHATSAPP)}</span>
            </a>
          )}
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
                {CONTACT_WHATSAPP && (
                  <a
                    href={`tel:+${CONTACT_WHATSAPP}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 text-base font-medium text-foreground min-h-[44px] px-1"
                  >
                    <Phone className="h-5 w-5 text-[#2D7FF9] shrink-0" />
                    <span>{formatPhone(CONTACT_WHATSAPP)}</span>
                  </a>
                )}
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
      <FooterTrustStrip t={t} />
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
                <Link href={publicRoute(publicPages.homologacion, locale)} className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200">
                  {t("public.nav.homologacion")}
                </Link>
              </li>
              <li>
                <Link href={publicRoute(publicPages.universidad, locale)} className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200">
                  {t("public.nav.universidad")}
                </Link>
              </li>
              <li>
                <Link href={publicRoute(publicPages.espanol, locale)} className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200">
                  {t("public.nav.espanol")}
                </Link>
              </li>
              <li>
                <Link href={publicRoute(publicPages.precios, locale)} className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200">
                  {t("public.nav.precios")}
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
                <Link href={routes.privacyPolicy} className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200">
                  {t("public.footer.privacy")}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={showCookiePreferences}
                  className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200 text-left"
                >
                  {t("public.footer.cookie_preferences")}
                </button>
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
                  <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200">
                    {CONTACT_EMAIL}
                  </a>
                </li>
              )}
              {CONTACT_WHATSAPP && (
                <li>
                  <a href={`https://wa.me/${CONTACT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200">
                    {formatPhone(CONTACT_WHATSAPP)}
                  </a>
                </li>
              )}
              <li>{t("public.footer.address")}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} Space for Edu. {t("public.footer.rights")}</span>
          <div className="flex items-center gap-5">
            <Link href={routes.privacyPolicy} className="hover:text-white transition-colors">
              {t("public.footer.privacy")}
            </Link>
            <button
              type="button"
              onClick={showCookiePreferences}
              className="hover:text-white transition-colors"
            >
              {t("public.footer.cookie_preferences")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Institutional trust strip at the top of the footer. Shows on every public
// page so each page ends on the same trust signal. Stripe intentionally
// uses a bordered partner-badge treatment; the other three sit on gradient
// glow tiles for brand consistency.
function FooterTrustStrip({ t }: { t: (key: string) => string }) {
  const items = [
    {
      visual: (
        <FooterGlowTile>
          <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
        </FooterGlowTile>
      ),
      label: t("public.footer.trust_company"),
    },
    {
      visual: <FooterStripeBadge />,
      label: t("public.footer.trust_payments"),
    },
    {
      visual: (
        <FooterGlowTile>
          <Lock className="h-5 w-5 text-white" strokeWidth={2.2} />
        </FooterGlowTile>
      ),
      label: t("public.footer.trust_gdpr"),
    },
    {
      visual: (
        <FooterGlowTile>
          <Globe className="h-5 w-5 text-white" strokeWidth={2.2} />
        </FooterGlowTile>
      ),
      label: t("public.footer.trust_languages"),
    },
  ]

  return (
    <div className="relative border-b border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#E8453C]/[0.06] via-transparent to-[#2D7FF9]/[0.06] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 max-w-5xl mx-auto">
          {items.map(({ visual, label }, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-3">
              {visual}
              <span className="text-xs sm:text-sm text-zinc-300 font-medium leading-snug max-w-[200px]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FooterGlowTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative shrink-0 h-11 w-11">
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-[#E8453C]/40 to-[#2D7FF9]/40 blur-md opacity-80" />
      <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-[#E8453C] to-[#2D7FF9] flex items-center justify-center shadow-lg shadow-[#2D7FF9]/25">
        {children}
      </div>
    </div>
  )
}

// Stripe wordmark — official public press-kit glyph, allowed for
// "Powered by Stripe" / "Secured by Stripe" integration indicators.
function FooterStripeBadge() {
  return (
    <div className="shrink-0 flex items-center justify-center h-11 px-4 rounded-xl border border-zinc-700 bg-zinc-800/60 shadow-lg shadow-[#635BFF]/15">
      <svg
        viewBox="0 0 60 25"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-auto text-white"
        fill="currentColor"
        role="img"
        aria-label="Stripe"
      >
        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM39.98 9.1c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.58-.24 1.58-1C6.31 14.3 0 14.95 0 10.34 0 7.44 2.22 5.7 5.55 5.7c1.3 0 2.6.2 3.9.71v3.88c-1.2-.65-2.71-1.01-3.9-1.01-.85 0-1.4.25-1.4.9 0 1.47 6.31.77 6.31 5.46z" />
      </svg>
    </div>
  )
}
