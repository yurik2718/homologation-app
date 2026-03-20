import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { getLessonCardColor } from "@/lib/colors"
import type { LessonItem } from "@/types/pages"

interface LessonCardProps {
  lesson: LessonItem
  onClick?: (lesson: LessonItem) => void
  showTeacherName?: boolean
}

export function LessonCard({ lesson, onClick, showTeacherName }: LessonCardProps) {
  const { t, i18n } = useTranslation()
  const time = formatDate(lesson.scheduledAt, "time", i18n.language)

  return (
    <div
      className={cn(
        "rounded border p-2 text-xs cursor-pointer hover:opacity-80 transition-opacity min-h-[44px]",
        getLessonCardColor(lesson),
        (lesson.status === "cancelled") && "line-through opacity-60"
      )}
      onClick={() => onClick?.(lesson)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(lesson)}
    >
      <div className="font-medium">{showTeacherName ? lesson.teacherName : lesson.studentName}</div>
      <div className="opacity-75">{time} · {t("lessons.duration_minutes", { minutes: lesson.durationMinutes })}</div>
      {lesson.status === "completed" && (
        <div className="mt-0.5 opacity-60">{t("calendar.done")}</div>
      )}
    </div>
  )
}
