import "@/lib/i18n" // Must be imported BEFORE any components
import { createInertiaApp, type ResolvedComponent, usePage } from "@inertiajs/react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { AuthLayout } from "@/components/layout/AuthLayout"
import type { SharedProps } from "@/types"

// Syncs i18n language with the user's saved locale from the server
function LocaleSync({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const { auth } = usePage<SharedProps>().props

  useEffect(() => {
    const locale = auth.user?.locale
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
  }, [auth.user?.locale, i18n])

  return <>{children}</>
}

void createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<{ default: ResolvedComponent }>(
      "../pages/**/*.tsx",
      { eager: true }
    )
    const page = pages[`../pages/${name}.tsx`]
    if (!page) {
      console.error(`Missing Inertia page component: '${name}.tsx'`)
    }

    // Auth pages use AuthLayout, all others use AuthenticatedLayout
    if (page?.default) {
      const isAuthPage = name.startsWith("auth/")
      page.default.layout =
        page.default.layout ??
        ((children: React.ReactNode) =>
          isAuthPage ? (
            <AuthLayout>{children}</AuthLayout>
          ) : (
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
          ))
    }

    return page
  },

  setup({ el, App, props }) {
    createRoot(el).render(
      <StrictMode>
        <LocaleSync>
          <App {...props} />
        </LocaleSync>
      </StrictMode>
    )
  },

  defaults: {
    form: {
      forceIndicesArrayFormatInFormData: false,
      withAllErrors: true,
    },
    future: {
      useScriptElementForInitialPage: true,
      useDataInertiaHeadAttribute: true,
      useDialogForErrorModal: true,
      preserveEqualProps: true,
    },
  },
}).catch((error) => {
  if (document.getElementById("app")) {
    throw error
  } else {
    console.error(
      "Missing root element.\n\n" +
        "If you see this error, it probably means you loaded Inertia.js on non-Inertia pages.\n" +
        'Consider moving <%= vite_typescript_tag "inertia.tsx" %> to the Inertia-specific layout instead.'
    )
  }
})
