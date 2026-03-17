import { useState } from "react"
import { usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { LessonDialog } from "@/components/lessons/LessonDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Pencil } from "lucide-react"
import { LESSON_STATUS_COLORS } from "@/lib/colors"
import { formatDate } from "@/lib/utils"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { LessonsShowProps } from "@/types/pages"

export default function LessonsShow() {
  const { t, i18n } = useTranslation()
  const { lesson } = usePage<SharedProps & LessonsShowProps>().props
  const { features } = usePage<SharedProps>().props
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("nav.my_lessons"), href: routes.lessons },
        { label: lesson.studentName },
      ]}
    >
      <Main>
        <div className="max-w-lg space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{t("lessons.title")}</h1>
            {features.canCreateLesson && (
              <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)} className="min-h-[44px]">
                <Pencil className="h-4 w-4 mr-1.5" />
                {t("common.edit")}
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("lessons.student")}</span>
                <span className="font-medium">{lesson.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("lessons.teacher")}</span>
                <span className="font-medium">{lesson.teacherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("lessons.date")}</span>
                <span>{formatDate(lesson.scheduledAt, "datetime", i18n.language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("lessons.duration")}</span>
                <span>{t("lessons.duration_minutes", { minutes: lesson.durationMinutes })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("lessons.status.scheduled")}</span>
                <Badge className={LESSON_STATUS_COLORS[lesson.status] ?? ""} variant="secondary">
                  {t(`lessons.status.${lesson.status}`)}
                </Badge>
              </div>
              {lesson.effectiveMeetingLink && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("lessons.meeting_link")}</span>
                  <Button
                    size="sm"
                    variant="link"
                    className="h-auto p-0 min-h-[44px]"
                    onClick={() => window.open(lesson.effectiveMeetingLink!, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {t("lessons.join_lesson")}
                  </Button>
                </div>
              )}
              {lesson.notes && (
                <div>
                  <span className="text-muted-foreground block mb-1">{t("lessons.notes")}</span>
                  <p className="text-sm">{lesson.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {features.canCreateLesson && (
            <LessonDialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              lesson={lesson}
              assignedStudents={[{ id: lesson.studentId, name: lesson.studentName }]}
            />
          )}
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
