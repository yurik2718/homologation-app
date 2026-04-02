import { KanbanColumn } from "@/components/pipeline/KanbanColumn"
import { usePipeline } from "@/components/pipeline/constants"
import type { PipelineCard } from "@/types/pages"

interface KanbanBoardProps {
  stages: Record<string, PipelineCard[]>
  onEditCard: (card: PipelineCard) => void
}

export function KanbanBoard({ stages, onEditCard }: KanbanBoardProps) {
  const { kanbanStages } = usePipeline()

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
      {kanbanStages.map((stage) => (
        <KanbanColumn
          key={stage}
          stage={stage}
          cards={stages[stage] ?? []}
          onEditCard={onEditCard}
        />
      ))}
    </div>
  )
}
