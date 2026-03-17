import { useTranslation } from "react-i18next"
import { Clock, User, ExternalLink, Video } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"
import { LESSON_STATUS_COLORS, getTeacherColor } from "@/lib/colors"
import type { LessonItem, MonthDayLesson } from "@/types/pages"

interface LessonPopoverProps {
  lesson: LessonItem | MonthDayLesson
  teacherIds: number[]
  children: React.ReactNode
}

export function LessonPopover({ lesson, teacherIds, children }: LessonPopoverProps) {
  const { t, i18n } = useTranslation()
  const color = getTeacherColor(lesson.teacherId, teacherIds)
  const effectiveLink = "effectiveMeetingLink" in lesson ? lesson.effectiveMeetingLink : null

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className={cn("px-4 py-3 rounded-t-lg border-b", color.bg, color.border)}>
          <div className={cn("font-semibold", color.text)}>{lesson.studentName}</div>
          <div className={cn("text-xs opacity-75", color.text)}>
            {formatDate(lesson.scheduledAt, "datetime", i18n.language)}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <PopoverRow icon={User} label={t("lessons.teacher")} value={lesson.teacherName} />
          <PopoverRow
            icon={Clock}
            label={t("lessons.duration")}
            value={t("lessons.duration_minutes", { minutes: lesson.durationMinutes })}
          />

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={LESSON_STATUS_COLORS[lesson.status] ?? ""}>
              {t(`lessons.status.${lesson.status}`)}
            </Badge>
            {lesson.meetingLinkReady ? (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Video className="h-3 w-3" />
                {t("calendar.link_ready")}
              </span>
            ) : (
              <span className="text-xs text-yellow-600">{t("calendar.link_needed")}</span>
            )}
          </div>

          {effectiveLink && (
            <Button variant="outline" className="w-full min-h-[44px]" asChild>
              <a href={effectiveLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                {t("calendar.open_link")}
              </a>
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PopoverRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
