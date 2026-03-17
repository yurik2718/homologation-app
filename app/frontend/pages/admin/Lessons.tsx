import { useState, useCallback } from "react"
import { usePage, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { CalendarDays, CalendarRange, List } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AdminWeekGrid } from "@/components/admin/lessons/AdminWeekGrid"
import { AdminMonthView } from "@/components/admin/lessons/AdminMonthView"
import { UserProfileSheet } from "@/components/admin/lessons/UserProfileSheet"
import { routes } from "@/lib/routes"
import { LESSON_STATUS_COLORS } from "@/lib/colors"
import { formatDate } from "@/lib/utils"
import type { SharedProps } from "@/types"
import type { AdminLessonsProps, LessonItem, UserProfile } from "@/types/pages"

export default function AdminLessons() {
  const { t, i18n } = useTranslation()
  const { view, lessons, teachers, students, weekStart, monthStart, monthSummary, userProfiles } =
    usePage<SharedProps & AdminLessonsProps>().props

  const [teacherFilter, setTeacherFilter] = useState("")
  const [studentFilter, setStudentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [weekTeacherFilter, setWeekTeacherFilter] = useState(() => {
    const url = new URL(window.location.href)
    return url.searchParams.get("teacher_id") ?? ""
  })

  // User profile sidebar state
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const openUserProfile = useCallback((userId: number) => {
    const profile = userProfiles?.[userId]
    if (profile) {
      setSelectedUser(profile)
      setSheetOpen(true)
    }
  }, [userProfiles])

  function switchView(newView: string) {
    const params: Record<string, string> = { view: newView }
    router.get(routes.admin.lessons, params, { preserveState: true })
  }

  function applyListFilters() {
    const params: Record<string, string> = { view: "list" }
    if (teacherFilter) params.teacher_id = teacherFilter
    if (studentFilter) params.student_id = studentFilter
    if (statusFilter) params.status = statusFilter
    router.get(routes.admin.lessons, params, { preserveState: true })
  }

  function clearListFilters() {
    setTeacherFilter("")
    setStudentFilter("")
    setStatusFilter("")
    router.get(routes.admin.lessons, { view: "list" }, { preserveState: true })
  }

  function handleWeekTeacherChange(id: string) {
    const effectiveId = id === "all" ? "" : id
    setWeekTeacherFilter(effectiveId)
    const params: Record<string, string> = { view: "week" }
    if (weekStart) params.week_start = weekStart
    if (effectiveId) params.teacher_id = effectiveId
    router.get(routes.admin.lessons, params, { preserveState: true })
  }

  const columns: ColumnDef<LessonItem>[] = [
    {
      accessorKey: "scheduledAt",
      header: t("lessons.date"),
      cell: ({ row }) => formatDate(row.original.scheduledAt, "datetime", i18n.language),
    },
    {
      accessorKey: "teacherName",
      header: t("lessons.teacher"),
      cell: ({ row }) => (
        <ClickableName
          name={row.original.teacherName}
          onClick={() => openUserProfile(row.original.teacherId)}
        />
      ),
    },
    {
      accessorKey: "studentName",
      header: t("lessons.student"),
      cell: ({ row }) => (
        <ClickableName
          name={row.original.studentName}
          onClick={() => openUserProfile(row.original.studentId)}
        />
      ),
    },
    {
      id: "duration",
      header: t("lessons.duration"),
      cell: ({ row }) => t("lessons.duration_minutes", { minutes: row.original.durationMinutes }),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: t("lessons.status_label"),
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="secondary" className={LESSON_STATUS_COLORS[row.original.status] ?? ""}>
          {t(`lessons.status.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: "meetingLink",
      header: t("lessons.meeting_link"),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.meetingLinkReady ? (
          <span className="text-green-600">{t("calendar.link_ready")}</span>
        ) : (
          <span className="text-yellow-600">{t("calendar.link_needed")}</span>
        ),
    },
  ]

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("nav.admin"), href: routes.admin.root },
        { label: t("nav.all_lessons") },
      ]}
    >
      <Main>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{t("nav.all_lessons")}</h1>

            <Tabs value={view} onValueChange={switchView}>
              <TabsList>
                <TabsTrigger value="week" className="gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("calendar.week")}</span>
                </TabsTrigger>
                <TabsTrigger value="month" className="gap-1.5">
                  <CalendarRange className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("calendar.month")}</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("calendar.list")}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {view === "week" && weekStart && (
            <AdminWeekGrid
              lessons={lessons}
              weekStart={weekStart}
              teachers={teachers}
              selectedTeacherId={weekTeacherFilter}
              onTeacherChange={handleWeekTeacherChange}
            />
          )}

          {view === "month" && monthStart && monthSummary && (
            <AdminMonthView
              monthStart={monthStart}
              monthSummary={monthSummary}
              teachers={teachers}
            />
          )}

          {view === "list" && (
            <DataTable
              columns={columns}
              data={lessons}
              renderMobileCard={(lesson) => (
                <LessonMobileCard lesson={lesson} onUserClick={openUserProfile} />
              )}
              toolbarContent={
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end">
                  <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder={t("lessons.teacher")} />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={studentFilter} onValueChange={setStudentFilter}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder={t("lessons.student")} />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder={t("lessons.status_label")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">
                        {t("lessons.status.scheduled")}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t("lessons.status.completed")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("lessons.status.cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button onClick={applyListFilters} size="sm" className="flex-1 min-h-[44px]">
                      {t("common.filter")}
                    </Button>
                    <Button onClick={clearListFilters} variant="ghost" size="sm" className="flex-1 min-h-[44px]">
                      {t("common.clear")}
                    </Button>
                  </div>
                </div>
              }
            />
          )}
        </div>

        <UserProfileSheet
          user={selectedUser}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </Main>
    </AuthenticatedLayout>
  )
}

function ClickableName({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="text-primary hover:underline font-medium text-left py-1 px-0.5 -my-1 min-h-[44px] inline-flex items-center"
    >
      {name}
    </button>
  )
}

function LessonMobileCard({
  lesson,
  onUserClick,
}: {
  lesson: LessonItem
  onUserClick: (userId: number) => void
}) {
  const { t, i18n } = useTranslation()

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-medium">
            {formatDate(lesson.scheduledAt, "datetime", i18n.language)}
          </div>
          <Badge variant="secondary" className={LESSON_STATUS_COLORS[lesson.status] ?? ""}>
            {t(`lessons.status.${lesson.status}`)}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {t("lessons.teacher")}:{" "}
          <ClickableName name={lesson.teacherName} onClick={() => onUserClick(lesson.teacherId)} />
          {" · "}
          {t("lessons.student")}:{" "}
          <ClickableName name={lesson.studentName} onClick={() => onUserClick(lesson.studentId)} />
        </div>
        <div className="text-sm text-muted-foreground">
          {t("lessons.duration_minutes", { minutes: lesson.durationMinutes })} ·{" "}
          {lesson.meetingLinkReady ? (
            <span className="text-green-600">{t("calendar.link_ready")}</span>
          ) : (
            <span className="text-yellow-600">{t("calendar.link_needed")}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
