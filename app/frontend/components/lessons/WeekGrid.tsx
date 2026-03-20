import { Fragment, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { router } from "@inertiajs/react"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { routes } from "@/lib/routes"
import { cn, DATE_LOCALES } from "@/lib/utils"
import { LessonCard } from "./LessonCard"
import type { LessonItem } from "@/types/pages"

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00–20:00

interface WeekGridProps {
  lessons: LessonItem[]
  weekStart: string
  onLessonClick: (lesson: LessonItem) => void
  showTeacherName?: boolean
}

export function WeekGrid({ lessons, weekStart, onLessonClick, showTeacherName }: WeekGridProps) {
  const { t, i18n } = useTranslation()
  const startDate = new Date(weekStart)
  const loc = DATE_LOCALES[i18n.language]
  const todayStr = new Date().toDateString()

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate)
        d.setDate(d.getDate() + i)
        return d
      }),
    [weekStart]
  )

  function navigateWeek(delta: number) {
    const newStart = new Date(startDate)
    newStart.setDate(newStart.getDate() + delta * 7)
    router.get(
      routes.lessons,
      { view: "week", week_start: newStart.toISOString().slice(0, 10) },
      { preserveState: true }
    )
  }

  function goToToday() {
    router.get(routes.lessons, { view: "week" }, { preserveState: true })
  }

  const weekLabel = `${format(days[0], "d MMM", { locale: loc })} – ${format(days[6], "d MMM yyyy", { locale: loc })}`
  const isCurrentWeek = days.some((d) => d.toDateString() === todayStr)

  return (
    <div className="space-y-4">
      {/* Navigation */}
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

      {lessons.length === 0 ? (
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
                style={{ gridTemplateColumns: "4rem repeat(7, 1fr)", minWidth: 800 }}
              >
                {/* Header */}
                <div className="bg-muted/50 border-b p-2" />
                {days.map((d, i) => {
                  const isToday = d.toDateString() === todayStr
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <div
                      key={i}
                      className={cn(
                        "text-center text-xs font-medium py-2.5 border-b border-l",
                        isToday
                          ? "bg-primary/5 text-primary font-semibold"
                          : isWeekend
                            ? "bg-muted/80 text-muted-foreground"
                            : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <div>{format(d, "EEE", { locale: loc })}</div>
                      <div className={cn("text-lg", isToday && "text-primary")}>
                        {isToday ? (
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {format(d, "d")}
                          </span>
                        ) : (
                          format(d, "d")
                        )}
                      </div>
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
                      const dayLessons = lessons.filter((l) => {
                        const d = new Date(l.scheduledAt)
                        return d.toDateString() === dayDate.toDateString() && d.getHours() === hour
                      })
                      const isToday = dayDate.toDateString() === todayStr
                      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6
                      return (
                        <div
                          key={`cell-${hour}-${dayIdx}`}
                          className={cn(
                            "border-b border-l min-h-[3.5rem] p-0.5 space-y-0.5",
                            isToday && "bg-primary/[0.02]",
                            isWeekend && !isToday && "bg-muted/20"
                          )}
                        >
                          {dayLessons.map((l) => (
                            <LessonCard
                              key={l.id}
                              lesson={l}
                              onClick={onLessonClick}
                              showTeacherName={showTeacherName}
                            />
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
              const dayLessons = lessons
                .filter((l) => new Date(l.scheduledAt).toDateString() === dayDate.toDateString())
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              const isToday = dayDate.toDateString() === todayStr

              if (dayLessons.length === 0) return null

              return (
                <div key={dayIdx}>
                  <div
                    className={cn(
                      "text-xs font-medium mb-2 px-1",
                      isToday ? "text-primary font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {format(dayDate, "EEEE, d MMMM", { locale: loc })}
                    {isToday && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {t("calendar.today")}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {dayLessons.map((lesson) => (
                      <div key={lesson.id} className="p-3 border rounded-lg">
                        <LessonCard
                          lesson={lesson}
                          onClick={onLessonClick}
                          showTeacherName={showTeacherName}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-200 inline-block" />
          {t("calendar.link_ready")}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-200 inline-block" />
          {t("calendar.link_needed")}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200 inline-block" />
          {t("calendar.done")}
        </span>
      </div>
    </div>
  )
}
