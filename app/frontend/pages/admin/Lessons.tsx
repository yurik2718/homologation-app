import { useState } from "react"
import { usePage, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import { LESSON_STATUS_COLORS } from "@/lib/colors"
import { formatDate } from "@/lib/utils"
import type { SharedProps } from "@/types"
import type { AdminLessonsProps, LessonItem } from "@/types/pages"

export default function AdminLessons() {
  const { t, i18n } = useTranslation()
  const { lessons, teachers, students } = usePage<SharedProps & AdminLessonsProps>().props

  const [teacherFilter, setTeacherFilter] = useState("")
  const [studentFilter, setStudentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  function applyFilters() {
    const params: Record<string, string> = {}
    if (teacherFilter) params.teacher_id = teacherFilter
    if (studentFilter) params.student_id = studentFilter
    if (statusFilter) params.status = statusFilter
    router.get(routes.admin.lessons, params, { preserveState: true })
  }

  function clearFilters() {
    setTeacherFilter("")
    setStudentFilter("")
    setStatusFilter("")
    router.get(routes.admin.lessons, {}, { preserveState: true })
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
    },
    {
      accessorKey: "studentName",
      header: t("lessons.student"),
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t("nav.all_lessons")}</h1>
        </div>

        <DataTable
          columns={columns}
          data={lessons}
          renderMobileCard={(lesson) => <LessonCard lesson={lesson} />}
          toolbarContent={
            <div className="flex flex-wrap gap-2 items-end">
              <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                <SelectTrigger className="w-40 min-h-[44px]">
                  <SelectValue placeholder={t("lessons.teacher")} />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger className="w-40 min-h-[44px]">
                  <SelectValue placeholder={t("lessons.student")} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 min-h-[44px]">
                  <SelectValue placeholder={t("lessons.status_label")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">{t("lessons.status.scheduled")}</SelectItem>
                  <SelectItem value="completed">{t("lessons.status.completed")}</SelectItem>
                  <SelectItem value="cancelled">{t("lessons.status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={applyFilters} size="sm" className="min-h-[44px]">{t("common.filter")}</Button>
              <Button onClick={clearFilters} variant="ghost" size="sm" className="min-h-[44px]">{t("common.clear")}</Button>
            </div>
          }
        />
      </div>
      </Main>
    </AuthenticatedLayout>
  )
}

function LessonCard({ lesson }: { lesson: LessonItem }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="border rounded-lg p-4 space-y-2 min-h-[44px]">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium">
          {formatDate(lesson.scheduledAt, "datetime", i18n.language)}
        </div>
        <Badge variant="secondary" className={LESSON_STATUS_COLORS[lesson.status] ?? ""}>
          {t(`lessons.status.${lesson.status}`)}
        </Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        {t("lessons.teacher")}: {lesson.teacherName} · {t("lessons.student")}: {lesson.studentName}
      </div>
      <div className="text-sm text-muted-foreground">
        {t("lessons.duration_minutes", { minutes: lesson.durationMinutes })} ·{" "}
        {lesson.meetingLinkReady ? (
          <span className="text-green-600">{t("calendar.link_ready")}</span>
        ) : (
          <span className="text-yellow-600">{t("calendar.link_needed")}</span>
        )}
      </div>
    </div>
  )
}
