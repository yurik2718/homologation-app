import { router, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Users, Calendar, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AssignStudentDialog } from "./AssignStudentDialog"
import { EditTeacherDialog } from "./EditTeacherDialog"
import { routes } from "@/lib/routes"
import { getInitials } from "@/lib/utils"
import type { TeacherItem } from "@/types/pages"

interface TeacherCardProps {
  teacher: TeacherItem
  availableStudents: Array<{ id: number; name: string }>
}

export function TeacherCard({ teacher, availableStudents }: TeacherCardProps) {
  const { t } = useTranslation()

  const handleRemoveStudent = (studentId: number) => {
    router.delete(routes.removeStudent(teacher.id), {
      data: { student_id: studentId },
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="text-sm">{getInitials(teacher.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold truncate">{teacher.name}</span>
              {teacher.level && (
                <Badge variant="secondary" className="text-xs">
                  {teacher.level}
                </Badge>
              )}
              {teacher.hourlyRate != null && (
                <span className="text-xs text-muted-foreground">€{teacher.hourlyRate}/h</span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {teacher.studentsCount} {t("teachers.students")}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {teacher.lessonsThisWeek} {t("teachers.lessons_this_week")}
              </span>
            </div>
            {teacher.permanentMeetingLink ? (
              <a
                href={teacher.permanentMeetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{teacher.permanentMeetingLink}</span>
              </a>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">{t("teachers.no_permanent_link")}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {teacher.bio && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{teacher.bio}</p>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {teacher.students.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => handleRemoveStudent(student.id)}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium hover:bg-destructive/10 hover:text-destructive transition-colors"
              title={t("teachers.remove_student")}
            >
              {student.name}
            </button>
          ))}
          <AssignStudentDialog
            teacherId={teacher.id}
            teacherName={teacher.name}
            availableStudents={availableStudents}
            trigger={
              <Button variant="outline" size="sm" className="min-h-[44px] rounded-full text-xs">
                + {t("teachers.assign_student")}
              </Button>
            }
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="min-h-[44px] text-xs" asChild>
            <Link href={`${routes.admin.lessons}?view=week&teacher_id=${teacher.id}`}>{t("teachers.view_calendar")}</Link>
          </Button>
          <EditTeacherDialog
            teacher={teacher}
            trigger={
              <Button variant="outline" size="sm" className="min-h-[44px] text-xs">
                {t("teachers.edit_profile")}
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
