import { useTranslation } from "react-i18next"
import { Calendar, ExternalLink, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LESSON_STATUS_COLORS } from "@/lib/colors"
import { formatDate } from "@/lib/utils"
import type { LessonItem } from "@/types/pages"

interface LessonListProps {
  upcoming: LessonItem[]
  past: LessonItem[]
}

function LessonRow({ lesson }: { lesson: LessonItem }) {
  const { t, i18n } = useTranslation()
  const formattedDate = formatDate(lesson.scheduledAt, "date", i18n.language)
  const formattedTime = formatDate(lesson.scheduledAt, "time", i18n.language)

  return (
    <Card>
      <CardContent className="p-4 min-h-[44px]">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{formattedDate} · {formattedTime} · {t("lessons.duration_minutes", { minutes: lesson.durationMinutes })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>{t("lessons.teacher")}: {lesson.teacherName}</span>
            </div>
            {(lesson.status === "completed" || lesson.status === "cancelled") && (
              <Badge variant="secondary" className={`${LESSON_STATUS_COLORS[lesson.status]} text-xs`}>
                {t(`lessons.status.${lesson.status}`)}
              </Badge>
            )}
          </div>

          {lesson.status === "scheduled" && (
            <div>
              {lesson.effectiveMeetingLink ? (
                <Button
                  size="sm"
                  className="min-h-[44px]"
                  onClick={() => window.open(lesson.effectiveMeetingLink!, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  {t("lessons.join_lesson")}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">{t("lessons.link_pending")}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function LessonList({ upcoming, past }: LessonListProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("lessons.upcoming")}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("lessons.no_lessons")}</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((l) => <LessonRow key={l.id} lesson={l} />)}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t("lessons.past")}
          </h2>
          <div className="space-y-3">
            {past.map((l) => <LessonRow key={l.id} lesson={l} />)}
          </div>
        </section>
      )}
    </div>
  )
}
