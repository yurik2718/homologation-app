import i18n, { i18nReady } from "@/lib/i18n" // Must be imported BEFORE any components so useTranslation sees the config
import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react"
import { router } from "@inertiajs/react"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { initCookieConsent, setCookieConsentLanguage } from "@/lib/cookieConsent"
import { detectLocale } from "@/lib/consent"

// Silence lint: i18n must be imported for the side-effect config above, we never read the default export here.
void i18n

void createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob<{ default: ResolvedComponent }>(
      "../pages/**/*.tsx",
    )
    const loader = pages[`../pages/${name}.tsx`]
    if (!loader) {
      throw new Error(`Missing Inertia page component: '${name}.tsx'`)
    }

    const page = await loader()

    // Auth pages get AuthLayout as their persistent layout. We dynamic-import
    // here so AuthLayout (and its icon/shadcn deps) never enter the public-page
    // critical path — ~40 KB min+gz that unauth-exposed users never need.
    if (page?.default) {
      const isAuthPage = name.startsWith("auth/")
      if (isAuthPage && !page.default.layout) {
        const { AuthLayout } = await import("@/components/layout/AuthLayout")
        page.default.layout = (children: React.ReactNode) => (
          <AuthLayout>{children}</AuthLayout>
        )
      }
    }

    return page
  },

  setup({ el, App, props }) {
    initCookieConsent()
    router.on("navigate", () => {
      setCookieConsentLanguage(detectLocale())
    })

    // Gate first render on the active locale JSON arriving — otherwise the
    // hero text flashes raw i18n keys for one paint. The bundle is a separate
    // chunk per locale, so total public-page JS is −120 to −140 KB.
    void i18nReady.then(() => {
      createRoot(el).render(
        <StrictMode>
          <App {...props} />
        </StrictMode>
      )

      // Error tracking is not on the critical path — defer so it can't block
      // hydration. Runs when the browser is idle (or 2 s later if no idle event).
      const scheduleSentry = (cb: () => void) => {
        const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number }
        if (typeof w.requestIdleCallback === "function") {
          w.requestIdleCallback(cb, { timeout: 2000 })
        } else {
          setTimeout(cb, 2000)
        }
      }
      scheduleSentry(() => {
        void import("@/lib/sentry").then(({ initSentry }) => initSentry())
      })
    })
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
