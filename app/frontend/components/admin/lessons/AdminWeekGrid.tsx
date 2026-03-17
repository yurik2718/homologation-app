import { Fragment, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { router } from "@inertiajs/react"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { routes } from "@/lib/routes"
import { formatDate, cn, DATE_LOCALES } from "@/lib/utils"
import { getTeacherColor, type TeacherColor } from "@/lib/colors"
import { LessonPopover } from "./LessonPopover"
import { TeacherLegend } from "./TeacherLegend"
import type { LessonItem } from "@/types/pages"

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00–20:00
const WEEKDAYS = 5 // Mon–Fri

interface AdminWeekGridProps {
  lessons: LessonItem[]
  weekStart: string
  teachers: Array<{ id: number; name: string }>
  selectedTeacherId: string
  onTeacherChange: (id: string) => void
}

function getLessonBlockClasses(color: TeacherColor, status: LessonItem["status"]) {
  return cn(
    "w-full text-left rounded-md px-2 py-1.5 text-xs border transition-all",
    "hover:shadow-md cursor-pointer min-h-[44px]",
    color.bg,
    color.border,
    color.text,
    status === "cancelled" && "opacity-50 line-through",
    status === "completed" && "opacity-60"
  )
}

export function AdminWeekGrid({
  lessons,
  weekStart,
  teachers,
  selectedTeacherId,
  onTeacherChange,
}: AdminWeekGridProps) {
  const { t, i18n } = useTranslation()
  const startDate = new Date(weekStart)
  const loc = DATE_LOCALES[i18n.language]
  const todayStr = new Date().toDateString()

  const days = useMemo(() =>
    Array.from({ length: WEEKDAYS }, (_, i) => {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      return d
    }), [weekStart])

  const teacherIds = useMemo(() => teachers.map((t) => t.id), [teachers])

  const filteredLessons = selectedTeacherId
    ? lessons.filter((l) => l.teacherId === Number(selectedTeacherId))
    : lessons

  function navigateWeek(delta: number) {
    const newStart = new Date(startDate)
    newStart.setDate(newStart.getDate() + delta * 7)
    const params: Record<string, string> = { view: "week", week_start: newStart.toISOString().slice(0, 10) }
    if (selectedTeacherId) params.teacher_id = selectedTeacherId
    router.get(routes.admin.lessons, params, { preserveState: true })
  }

  function goToToday() {
    const params: Record<string, string> = { view: "week" }
    if (selectedTeacherId) params.teacher_id = selectedTeacherId
    router.get(routes.admin.lessons, params, { preserveState: true })
  }

  const weekLabel = `${format(days[0], "d MMM", { locale: loc })} – ${format(days[4], "d MMM yyyy", { locale: loc })}`
  const isCurrentWeek = days.some((d) => d.toDateString() === todayStr)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-9" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-9" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm font-semibold">{weekLabel}</span>
          {!isCurrentWeek && (
            <Button variant="ghost" size="sm" onClick={goToToday}>
              {t("calendar.today")}
            </Button>
          )}
        </div>

        <Select value={selectedTeacherId} onValueChange={onTeacherChange}>
          <SelectTrigger className="w-48 min-h-[44px]">
            <SelectValue placeholder={t("calendar.all_teachers")} />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={String(teacher.id)}>
                <span className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", getTeacherColor(teacher.id, teacherIds).dot)} />
                  {teacher.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {filteredLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t("calendar.no_lessons_week")}</p>
        </div>
      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden md:block">
            <ScrollArea className="w-full">
              <div
                className="grid border rounded-lg overflow-hidden"
                style={{ gridTemplateColumns: "4rem repeat(5, 1fr)", minWidth: 700 }}
              >
                {/* Header */}
                <div className="bg-muted/50 border-b p-2" />
                {days.map((d, i) => {
                  const isToday = d.toDateString() === todayStr
                  return (
                    <div
                      key={i}
                      className={cn(
                        "text-center text-xs font-medium py-2.5 border-b border-l",
                        isToday ? "bg-primary/5 text-primary font-semibold" : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <div>{format(d, "EEE", { locale: loc })}</div>
                      <div className={cn("text-lg", isToday && "text-primary")}>{format(d, "d")}</div>
                    </div>
                  )
                })}

                {/* Hour rows */}
                {HOURS.map((hour) => (
                  <Fragment key={`row-${hour}`}>
                    <div className="text-right text-xs text-muted-foreground pr-2 pt-1.5 border-b bg-muted/30">
                      {String(hour).padStart(2, "0")}:00
                    </div>

                    {days.map((dayDate, dayIdx) => {
                      const dayLessons = filteredLessons.filter((l) => {
                        const d = new Date(l.scheduledAt)
                        return d.toDateString() === dayDate.toDateString() && d.getHours() === hour
                      })
                      const isToday = dayDate.toDateString() === todayStr
                      return (
                        <div
                          key={`cell-${hour}-${dayIdx}`}
                          className={cn("border-b border-l min-h-[3.5rem] p-1 space-y-1", isToday && "bg-primary/[0.02]")}
                        >
                          {dayLessons.map((lesson) => (
                            <LessonBlock key={lesson.id} lesson={lesson} teacherIds={teacherIds} />
                          ))}
                        </div>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Mobile: day-by-day cards */}
          <div className="md:hidden space-y-4">
            {days.map((dayDate, dayIdx) => {
              const dayLessons = filteredLessons
                .filter((l) => new Date(l.scheduledAt).toDateString() === dayDate.toDateString())
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              const isToday = dayDate.toDateString() === todayStr

              if (dayLessons.length === 0) return null

              return (
                <div key={dayIdx}>
                  <div className={cn("text-xs font-medium mb-2 px-1", isToday ? "text-primary font-semibold" : "text-muted-foreground")}>
                    {format(dayDate, "EEEE, d MMMM", { locale: loc })}
                    {isToday && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {t("calendar.today")}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {dayLessons.map((lesson) => (
                      <LessonBlock key={lesson.id} lesson={lesson} teacherIds={teacherIds} mobile />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <TeacherLegend teachers={teachers} teacherIds={teacherIds} selectedTeacherId={selectedTeacherId} />
    </div>
  )
}

/** Reusable lesson block for both desktop grid cells and mobile cards */
function LessonBlock({
  lesson,
  teacherIds,
  mobile = false,
}: {
  lesson: LessonItem
  teacherIds: number[]
  mobile?: boolean
}) {
  const { t } = useTranslation()
  const color = getTeacherColor(lesson.teacherId, teacherIds)

  return (
    <LessonPopover lesson={lesson} teacherIds={teacherIds}>
      <button
        type="button"
        className={cn(
          getLessonBlockClasses(color, lesson.status),
          mobile && "rounded-lg px-3 py-2.5"
        )}
      >
        {mobile ? (
          <>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{lesson.studentName}</span>
              <span className="text-xs opacity-75">{formatDate(lesson.scheduledAt, "time")}</span>
            </div>
            <div className="text-xs opacity-75 mt-0.5">
              {lesson.teacherName} · {t("lessons.duration_minutes", { minutes: lesson.durationMinutes })}
            </div>
          </>
        ) : (
          <>
            <div className="font-semibold truncate">{lesson.studentName}</div>
            <div className="opacity-75 flex items-center gap-1">
              {formatDate(lesson.scheduledAt, "time")} · {t("lessons.duration_minutes", { minutes: lesson.durationMinutes })}
            </div>
            <div className="opacity-60 truncate text-[10px] mt-0.5">{lesson.teacherName}</div>
          </>
        )}
      </button>
    </LessonPopover>
  )
}
