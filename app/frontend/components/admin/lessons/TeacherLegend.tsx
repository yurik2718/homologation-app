import { cn } from "@/lib/utils"
import { getTeacherColor } from "@/lib/colors"

interface TeacherLegendProps {
  teachers: Array<{ id: number; name: string }>
  teacherIds: number[]
  selectedTeacherId?: string
}

export function TeacherLegend({ teachers, teacherIds, selectedTeacherId }: TeacherLegendProps) {
  const filtered = selectedTeacherId
    ? teachers.filter((t) => String(t.id) === selectedTeacherId)
    : teachers

  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2">
      {filtered.map((teacher) => {
        const color = getTeacherColor(teacher.id, teacherIds)
        return (
          <span key={teacher.id} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", color.dot)} />
            {teacher.name}
          </span>
        )
      })}
    </div>
  )
}
