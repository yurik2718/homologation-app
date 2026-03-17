import { useState } from "react"
import { usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WeekGrid } from "@/components/lessons/WeekGrid"
import { DayView } from "@/components/lessons/DayView"
import { LessonDialog } from "@/components/lessons/LessonDialog"
import type { SharedProps } from "@/types"
import type { CalendarIndexProps, LessonItem } from "@/types/pages"

export default function CalendarIndex() {
  const { t } = useTranslation()
  const { lessons, weekStart, assignedStudents } = usePage<SharedProps & CalendarIndexProps>().props
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null)

  function openNew() {
    setSelectedLesson(null)
    setDialogOpen(true)
  }

  function openEdit(lesson: LessonItem) {
    setSelectedLesson(lesson)
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setSelectedLesson(null)
  }

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t("nav.calendar") }]}
    >
      <Main>
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{t("calendar.title")}</h1>
            <Button onClick={openNew} className="min-h-[44px]">
              <Plus className="h-4 w-4 mr-1.5" />
              {t("lessons.new_lesson")}
            </Button>
          </div>

          <WeekGrid lessons={lessons} weekStart={weekStart} onLessonClick={openEdit} />
          <DayView lessons={lessons} onLessonClick={openEdit} />

          <LessonDialog
            open={dialogOpen}
            onClose={closeDialog}
            lesson={selectedLesson}
            assignedStudents={assignedStudents}
          />
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
