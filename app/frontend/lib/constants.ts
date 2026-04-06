export const TEACHER_LEVELS = ["junior", "mid", "senior", "native"] as const

export const LESSON_DURATIONS = [30, 45, 60, 90] as const

export const ALL_ROLES = ["super_admin", "coordinator", "teacher", "student"] as const

// ─── Public site (from .env) ────────────────────────────────────────────────
export const CONTACT_WHATSAPP = import.meta.env.VITE_CONTACT_WHATSAPP ?? ""
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? ""
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? ""
export const CONTACT_TELEGRAM = import.meta.env.VITE_CONTACT_TELEGRAM ?? ""
export const STRIPE_CONSULTATION_LINK = import.meta.env.VITE_STRIPE_CONSULTATION_LINK ?? ""

/** Format a raw phone string like "34663689393" → "+34 663 689 393" */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  // Spanish format: CC XXX XXX XXX
  const match = digits.match(/^(\d{2})(\d{3})(\d{3})(\d{3})$/)
  if (match) return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`
  // Fallback: just prepend +
  return `+${digits}`
}
