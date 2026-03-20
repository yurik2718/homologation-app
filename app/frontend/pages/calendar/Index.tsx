import { useState } from "react"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Plus } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { WeekGrid } from "@/components/lessons/WeekGrid"
import { MonthView } from "@/components/lessons/MonthView"
import { LessonList } from "@/components/lessons/LessonList"
import { LessonDialog } from "@/components/lessons/LessonDialog"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type { CalendarIndexProps, LessonItem } from "@/types/pages"

export default function CalendarIndex() {
  const { t } = useTranslation()
  const { view, lessons, weekStart, monthStart, monthSummary, upcoming, past, assignedStudents, features } =
    usePage<SharedProps & CalendarIndexProps>().props
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null)

  const isTeacherView = features.canCreateLesson

  function openNew() {
    setSelectedLesson(null)
    setDialogOpen(true)
  }

  function openEdit(lesson: LessonItem) {
    setSelectedLesson(lesson)
    setDialogOpen(true)
  }

  function navigateToLesson(lesson: LessonItem) {
    router.get(routes.lesson(lesson.id))
  }

  const handleLessonClick = isTeacherView ? openEdit : navigateToLesson

  function switchView(newView: string) {
    router.get(routes.lessons, { view: newView }, { preserveState: true })
  }

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t("lessons.title") }]}
    >
      <Main>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("lessons.title")}
            </h1>
            {isTeacherView && (
              <Button onClick={openNew} className="min-h-[44px] w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1.5" />
                {t("lessons.new_lesson")}
              </Button>
            )}
          </div>

          <Tabs value={view} onValueChange={switchView}>
            <TabsList>
              <TabsTrigger value="week">
                {t("calendar.week")}
              </TabsTrigger>
              <TabsTrigger value="month">
                {t("calendar.month")}
              </TabsTrigger>
              <TabsTrigger value="list">
                {t("calendar.list")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="week">
              {weekStart && (
                <WeekGrid
                  lessons={lessons}
                  weekStart={weekStart}
                  onLessonClick={handleLessonClick}
                  showTeacherName={!isTeacherView}
                />
              )}
            </TabsContent>

            <TabsContent value="month">
              {monthStart && monthSummary && (
                <MonthView
                  monthStart={monthStart}
                  monthSummary={monthSummary}
                  showTeacherName={!isTeacherView}
                />
              )}
            </TabsContent>

            <TabsContent value="list">
              {upcoming && past && (
                <LessonList upcoming={upcoming} past={past} />
              )}
            </TabsContent>
          </Tabs>

          {isTeacherView && (
            <LessonDialog
              open={dialogOpen}
              onClose={() => {
                setDialogOpen(false)
                setSelectedLesson(null)
              }}
              lesson={selectedLesson}
              assignedStudents={assignedStudents}
            />
          )}
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
