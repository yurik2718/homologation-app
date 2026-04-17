import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

type Bundle = { default: Record<string, unknown> }
const loaders: Record<string, () => Promise<Bundle>> = {
  es: () => import("@/locales/es.json"),
  en: () => import("@/locales/en.json"),
  ru: () => import("@/locales/ru.json"),
}

const FALLBACK = "es"

function detectInitialLocale(): keyof typeof loaders {
  const url = new URL(window.location.href)
  const qs = url.searchParams.get("lang")
  if (qs && qs in loaders) return qs as keyof typeof loaders
  const pathSeg = url.pathname.split("/")[1]
  if (pathSeg && pathSeg in loaders) return pathSeg as keyof typeof loaders
  const nav = navigator.language?.split("-")[0]
  if (nav && nav in loaders) return nav as keyof typeof loaders
  return FALLBACK
}

const initial = detectInitialLocale()

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: initial,
    fallbackLng: FALLBACK,
    resources: {},
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "navigator"],
      lookupQuerystring: "lang",
    },
  })

async function loadLocale(lng: string) {
  if (!(lng in loaders) || i18n.hasResourceBundle(lng, "translation")) return
  const { default: bundle } = await loaders[lng]()
  i18n.addResourceBundle(lng, "translation", bundle, true, true)
}

// Ensure the active locale (and fallback, if different) are loaded before the
// React tree renders — otherwise t() flashes raw keys for one paint. Imported
// and awaited in `entrypoints/inertia.tsx`.
export const i18nReady: Promise<void> = (async () => {
  await loadLocale(initial)
  if (initial !== FALLBACK) await loadLocale(FALLBACK)
})()

// Swap languages on navigation (LanguageSwitcher triggers this via `changeLanguage`).
i18n.on("languageChanged", (lng) => {
  void loadLocale(lng)
})

export default i18n
