import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { router } from "@inertiajs/react"
import { routes } from "@/lib/routes"
import { formatDate } from "@/lib/utils"
import { LessonCard } from "./LessonCard"
import type { LessonItem } from "@/types/pages"

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8 to 20
const DAYS = 5 // Mon–Fri

interface WeekGridProps {
  lessons: LessonItem[]
  weekStart: string
  onLessonClick: (lesson: LessonItem) => void
}

function getDayLessons(lessons: LessonItem[], dayDate: Date): LessonItem[] {
  return lessons.filter((l) => {
    const d = new Date(l.scheduledAt)
    return d.toDateString() === dayDate.toDateString()
  })
}

export function WeekGrid({ lessons, weekStart, onLessonClick }: WeekGridProps) {
  const { t, i18n } = useTranslation()
  const startDate = new Date(weekStart)

  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return d
  })

  function navigateWeek(delta: number) {
    const newStart = new Date(startDate)
    newStart.setDate(newStart.getDate() + delta * 7)
    router.get(routes.lessons, { week_start: newStart.toISOString().slice(0, 10) }, { preserveState: true })
  }

  function goToToday() {
    router.get(routes.lessons, {}, { preserveState: true })
  }

  const weekLabel = `${formatDate(days[0], "date", i18n.language)} – ${formatDate(days[4], "date", i18n.language)}`

  return (
    <div className="hidden lg:block">
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{weekLabel}</span>
        <Button variant="ghost" size="sm" onClick={goToToday}>
          {t("calendar.today")}
        </Button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: "4rem repeat(5, 1fr)", minWidth: 640 }}>
          {/* Header row */}
          <div />
          {days.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted-foreground pb-2 border-b">
              {formatDate(d, "date", i18n.language)}
            </div>
          ))}

          {/* Time rows */}
          {HOURS.map((hour) => (
            <Fragment key={`row-${hour}`}>
              {/* Time label */}
              <div className="text-right text-xs text-muted-foreground pr-2 pt-1">
                {String(hour).padStart(2, "0")}:00
              </div>

              {/* Day columns */}
              {days.map((dayDate, dayIdx) => {
                const dayLessons = getDayLessons(lessons, dayDate).filter((l) => {
                  const h = new Date(l.scheduledAt).getHours()
                  return h === hour
                })
                return (
                  <div
                    key={`cell-${hour}-${dayIdx}`}
                    className="border-b border-l min-h-[3rem] p-0.5 space-y-0.5 relative"
                  >
                    {dayLessons.map((l) => (
                      <LessonCard key={l.id} lesson={l} onClick={onLessonClick} />
                    ))}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
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
