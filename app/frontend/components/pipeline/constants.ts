import { useMemo } from "react"
import { usePage } from "@inertiajs/react"
import type { SharedProps } from "@/types/index"

// ─── Color palette ──────────────────────────────────────────────────────────
// Maps the `color` field from config/pipeline.yml to Tailwind classes.

const COLOR_PALETTE: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  amber:   { border: "border-l-amber-400",   bg: "bg-amber-500",   text: "text-amber-700",   dot: "bg-amber-400" },
  blue:    { border: "border-l-blue-400",    bg: "bg-blue-500",    text: "text-blue-700",    dot: "bg-blue-400" },
  emerald: { border: "border-l-emerald-400", bg: "bg-emerald-500", text: "text-emerald-700", dot: "bg-emerald-400" },
  orange:  { border: "border-l-orange-400",  bg: "bg-orange-500",  text: "text-orange-700",  dot: "bg-orange-400" },
  violet:  { border: "border-l-violet-400",  bg: "bg-violet-500",  text: "text-violet-700",  dot: "bg-violet-400" },
  pink:    { border: "border-l-pink-400",    bg: "bg-pink-500",    text: "text-pink-700",    dot: "bg-pink-400" },
  cyan:    { border: "border-l-cyan-400",    bg: "bg-cyan-500",    text: "text-cyan-700",    dot: "bg-cyan-400" },
  green:   { border: "border-l-green-400",   bg: "bg-green-500",   text: "text-green-700",   dot: "bg-green-400" },
}

const DEFAULT_COLOR = COLOR_PALETTE.blue

// ─── Hook: pipeline config from server ──────────────────────────────────────

export interface StageColor { border: string; bg: string; text: string; dot: string; icon: string }

export function usePipeline() {
  const { pipelineConfig } = usePage<SharedProps>().props
  const stages = pipelineConfig.stages

  return useMemo(() => {
    const kanbanStages = stages.filter((s) => s.display === "kanban").map((s) => s.key)
    const horizontalStages = stages.filter((s) => s.display === "horizontal").map((s) => ({ stage: s.key, icon: s.icon }))
    const allStages = stages.map((s) => s.key)
    const docKeys = pipelineConfig.document_checklist.map((d) => d.key)

    const stageColors: Record<string, StageColor> = {}
    const stageShortLabels: Record<string, string> = {}
    for (const s of stages) {
      const palette = COLOR_PALETTE[s.color] ?? DEFAULT_COLOR
      stageColors[s.key] = { ...palette, icon: s.icon }
      stageShortLabels[s.key] = s.short
    }

    return { kanbanStages, horizontalStages, allStages, docKeys, stageColors, stageShortLabels, stages }
  }, [pipelineConfig])
}

// ─── Static constants (not from config) ─────────────────────────────────────

export const CURRENT_YEAR = new Date().getFullYear()

export const YEAR_COLORS: Record<number, { bg: string; text: string }> = {
  [CURRENT_YEAR - 1]: { bg: "bg-indigo-500", text: "text-white" },
  [CURRENT_YEAR]:     { bg: "bg-amber-500", text: "text-white" },
  [CURRENT_YEAR + 1]: { bg: "bg-emerald-500", text: "text-white" },
}

export const SERVICE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  homologacion: { bg: "bg-violet-500", text: "text-white" },
  equivalencia: { bg: "bg-amber-500", text: "text-white" },
  uned:         { bg: "bg-cyan-500", text: "text-white" },
}
