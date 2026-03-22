/** Document checklist keys — single source of truth for DocumentTags and CardEditDialog */
export const DOC_KEYS = ["sol", "vol", "tas", "aut", "pas", "ori", "tra", "reg", "not", "ent"] as const

/** First 5 stages shown as vertical kanban columns */
export const KANBAN_STAGES = [
  "pago_recibido",
  "documentos",
  "traduccion",
  "tasas_volantes",
  "redsara",
] as const

/** Last 3 stages shown as horizontal card rows */
export const HORIZONTAL_STAGES = [
  { stage: "cotejo_ministerio", icon: "\u{1F3DB}" },
  { stage: "cotejo_delegacion", icon: "\u{1F3E2}" },
  { stage: "completado", icon: "\u2705" },
] as const

/** All 8 stages in pipeline order (for mobile tabs) */
export const ALL_STAGES = [
  ...KANBAN_STAGES,
  ...HORIZONTAL_STAGES.map((s) => s.stage),
] as const

/** Stage color palette — accent color for column headers and card left borders */
export const STAGE_COLORS: Record<string, { border: string; bg: string; text: string; dot: string; icon: string }> = {
  pago_recibido:     { border: "border-l-amber-400",   bg: "bg-amber-500",   text: "text-amber-700",   dot: "bg-amber-400",   icon: "💶" },
  documentos:        { border: "border-l-blue-400",    bg: "bg-blue-500",    text: "text-blue-700",    dot: "bg-blue-400",    icon: "📄" },
  traduccion:        { border: "border-l-emerald-400", bg: "bg-emerald-500", text: "text-emerald-700", dot: "bg-emerald-400", icon: "🌐" },
  tasas_volantes:    { border: "border-l-orange-400",  bg: "bg-orange-500",  text: "text-orange-700",  dot: "bg-orange-400",  icon: "📋" },
  redsara:           { border: "border-l-violet-400",  bg: "bg-violet-500",  text: "text-violet-700",  dot: "bg-violet-400",  icon: "📡" },
  cotejo_ministerio: { border: "border-l-pink-400",    bg: "bg-pink-500",    text: "text-pink-700",    dot: "bg-pink-400",    icon: "🏛" },
  cotejo_delegacion: { border: "border-l-cyan-400",    bg: "bg-cyan-500",    text: "text-cyan-700",    dot: "bg-cyan-400",    icon: "🏢" },
  completado:        { border: "border-l-green-400",   bg: "bg-green-500",   text: "text-green-700",   dot: "bg-green-400",   icon: "✅" },
}

/** Year badge colors — current year = amber, previous = indigo */
export const YEAR_COLORS: Record<number, { bg: string; text: string }> = {
  2025: { bg: "bg-indigo-500", text: "text-white" },
  2026: { bg: "bg-amber-500", text: "text-white" },
}

/** Service type badge colors (reference: TC map) */
export const SERVICE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  homologacion: { bg: "bg-violet-500", text: "text-white" },
  equivalencia: { bg: "bg-amber-500", text: "text-white" },
  uned:         { bg: "bg-cyan-500", text: "text-white" },
}

/** Short stage labels for advance button */
export const STAGE_SHORT_LABELS: Record<string, string> = {
  pago_recibido: "Pago",
  documentos: "Docs",
  traduccion: "Trad.",
  tasas_volantes: "Tasas",
  redsara: "RedSARA",
  cotejo_ministerio: "Min.",
  cotejo_delegacion: "Deleg.",
  completado: "Fin",
}
