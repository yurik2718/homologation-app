/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_WHATSAPP: string
  readonly VITE_CONTACT_EMAIL: string
  readonly VITE_SUPPORT_EMAIL: string
  readonly VITE_CONTACT_TELEGRAM: string
  readonly VITE_STRIPE_CONSULTATION_LINK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
