import { useTranslation } from "react-i18next"
import { router } from "@inertiajs/react"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday as checkIsToday } from "date-fns"

const MAX_DOTS = 5
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { routes } from "@/lib/routes"
import { cn, DATE_LOCALES } from "@/lib/utils"
import { getTeacherColor, LESSON_STATUS_COLORS } from "@/lib/colors"
import { TeacherLegend } from "./TeacherLegend"
import type { MonthDayLesson } from "@/types/pages"

interface AdminMonthViewProps {
  monthStart: string
  monthSummary: Record<string, MonthDayLesson[]>
  teachers: Array<{ id: number; name: string }>
}

export function AdminMonthView({ monthStart, monthSummary, teachers }: AdminMonthViewProps) {
  const { t, i18n } = useTranslation()
  const monthDate = new Date(monthStart)
  const loc = DATE_LOCALES[i18n.language]
  const teacherIds = teachers.map((t) => t.id)

  const monthLabel = format(monthDate, "LLLL yyyy", { locale: loc })

  // Build calendar grid: 6 rows of 7 days
  const calStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 })
  const calEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 })

  const weeks: Date[][] = []
  let current = calStart
  while (current <= calEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(current)
      current = addDays(current, 1)
    }
    weeks.push(week)
  }

  // Day name headers
  const dayHeaders = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(calStart, i)
    return format(d, "EEE", { locale: loc })
  })

  function navigateMonth(delta: number) {
    const d = new Date(monthDate)
    d.setMonth(d.getMonth() + delta)
    router.get(
      routes.admin.lessons,
      { view: "month", month: format(d, "yyyy-MM") },
      { preserveState: true }
    )
  }

  function goToWeek(date: Date) {
    const monday = startOfWeek(date, { weekStartsOn: 1 })
    router.get(
      routes.admin.lessons,
      { view: "week", week_start: format(monday, "yyyy-MM-dd") },
      { preserveState: true }
    )
  }

  const hasLessons = Object.keys(monthSummary).length > 0

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-9"
          onClick={() => navigateMonth(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-9"
          onClick={() => navigateMonth(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold capitalize">{monthLabel}</span>
      </div>

      {!hasLessons ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t("calendar.no_lessons_month")}</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-muted/50">
            {dayHeaders.map((dh, i) => (
              <div
                key={i}
                className="text-center text-xs font-medium text-muted-foreground py-2 border-b"
              >
                {dh}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7">
              {week.map((day, dayIdx) => {
                const dateKey = format(day, "yyyy-MM-dd")
                const dayLessons = monthSummary[dateKey] ?? []
                const inMonth = isSameMonth(day, monthDate)
                const isToday = checkIsToday(day)

                return (
                  <DayCell
                    key={dayIdx}
                    day={day}
                    dayLessons={dayLessons}
                    inMonth={inMonth}
                    isToday={isToday}
                    teacherIds={teacherIds}
                    onGoToWeek={() => goToWeek(day)}
                    locale={loc}
                  />
                )
              })}
            </div>
          ))}
        </div>
      )}

      <TeacherLegend teachers={teachers} teacherIds={teacherIds} />
    </div>
  )
}

interface DayCellProps {
  day: Date
  dayLessons: MonthDayLesson[]
  inMonth: boolean
  isToday: boolean
  teacherIds: number[]
  onGoToWeek: () => void
  locale: typeof import("date-fns/locale").es
}

function DayCell({ day, dayLessons, inMonth, isToday, teacherIds, onGoToWeek, locale }: DayCellProps) {
  const { t } = useTranslation()
  const dayNum = format(day, "d")

  const content = (
    <div
      className={cn(
        "min-h-[4.5rem] sm:min-h-[5.5rem] p-1.5 border-b border-r transition-colors",
        inMonth ? "bg-background" : "bg-muted/30",
        isToday && "bg-primary/5",
        dayLessons.length > 0 && inMonth && "cursor-pointer hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "text-xs font-medium mb-1",
          !inMonth && "text-muted-foreground/40",
          isToday && "text-primary font-bold"
        )}
      >
        {isToday ? (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {dayNum}
          </span>
        ) : (
          dayNum
        )}
      </div>

      {dayLessons.length > 0 && inMonth && (
        <div className="flex flex-wrap gap-1">
          {dayLessons.slice(0, MAX_DOTS).map((lesson) => {
            const color = getTeacherColor(lesson.teacherId, teacherIds)
            return (
              <span
                key={lesson.id}
                className={cn("h-2 w-2 rounded-full", color.dot)}
                title={`${lesson.teacherName} → ${lesson.studentName}`}
              />
            )
          })}
          {dayLessons.length > MAX_DOTS && (
            <span className="text-[10px] text-muted-foreground leading-none">
              +{dayLessons.length - MAX_DOTS}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (dayLessons.length === 0 || !inMonth) return content

  return (
    <Popover>
      <PopoverTrigger asChild>{content}</PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center justify-between">
          <span className="text-sm font-semibold">
            {format(day, "EEEE, d MMMM", { locale })}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {dayLessons.length}
          </Badge>
        </div>
        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
          {dayLessons
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
            .map((lesson) => {
              const color = getTeacherColor(lesson.teacherId, teacherIds)
              const time = format(new Date(lesson.scheduledAt), "HH:mm")
              return (
                <div
                  key={lesson.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-xs border",
                    color.bg,
                    color.border,
                    color.text
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full shrink-0", color.dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {time} · {lesson.studentName}
                    </div>
                    <div className="opacity-70 truncate">
                      {lesson.teacherName} · {t("lessons.duration_minutes", { minutes: lesson.durationMinutes })}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px] shrink-0", LESSON_STATUS_COLORS[lesson.status] ?? "")}
                  >
                    {t(`lessons.status.${lesson.status}`)}
                  </Badge>
                </div>
              )
            })}
        </div>
        <div className="px-4 py-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full min-h-[44px] text-xs"
            onClick={onGoToWeek}
          >
            {t("calendar.go_to_week")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
