import { useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { routes } from "@/lib/routes"
import { LESSON_DURATIONS } from "@/lib/constants"
import type { LessonItem } from "@/types/pages"

interface LessonDialogProps {
  open: boolean
  onClose: () => void
  lesson?: LessonItem | null
  assignedStudents: Array<{ id: number; name: string }>
}

type LessonFormData = {
  student_id: string
  scheduled_at: string
  duration_minutes: string
  meeting_link: string
  status?: string
  notes?: string
}

export function LessonDialog({ open, onClose, lesson, assignedStudents }: LessonDialogProps) {
  const { t } = useTranslation()
  const isEdit = !!lesson

  const defaultDate = lesson
    ? new Date(lesson.scheduledAt).toISOString().slice(0, 16)
    : ""

  const { data, setData, post, patch, processing, errors } = useForm<LessonFormData>({
    student_id: lesson ? String(lesson.studentId) : "",
    scheduled_at: defaultDate,
    duration_minutes: lesson ? String(lesson.durationMinutes) : "60",
    meeting_link: lesson?.meetingLink ?? "",
    status: lesson?.status ?? "scheduled",
    notes: lesson?.notes ?? "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit && lesson) {
      patch(routes.lesson(lesson.id), {
        onSuccess: onClose,
      })
    } else {
      post(routes.lessons, {
        onSuccess: onClose,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("lessons.edit_lesson") : t("lessons.new_lesson")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div className="space-y-1">
              <Label>{t("lessons.student")}</Label>
              <Select
                value={data.student_id}
                onValueChange={(v) => setData("student_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("lessons.select_student")} />
                </SelectTrigger>
                <SelectContent>
                  {assignedStudents.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.student_id && <p className="text-xs text-destructive">{errors.student_id}</p>}
            </div>
          )}

          <div className="space-y-1">
            <Label>{t("lessons.date")} / {t("lessons.time")}</Label>
            <Input
              type="datetime-local"
              value={data.scheduled_at}
              onChange={(e) => setData("scheduled_at", e.target.value)}
              required
            />
            {errors.scheduled_at && <p className="text-xs text-destructive">{errors.scheduled_at}</p>}
          </div>

          <div className="space-y-1">
            <Label>{t("lessons.duration")}</Label>
            <Select
              value={data.duration_minutes}
              onValueChange={(v) => setData("duration_minutes", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LESSON_DURATIONS.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {t("lessons.duration_minutes", { minutes: m })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{t("lessons.meeting_link")}</Label>
            <Input
              type="url"
              value={data.meeting_link}
              onChange={(e) => setData("meeting_link", e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
            <p className="text-xs text-muted-foreground">{t("lessons.meeting_link_hint")}</p>
          </div>

          {isEdit && (
            <>
              <div className="space-y-1">
                <Label>{t("lessons.status_label")}</Label>
                <Select
                  value={data.status}
                  onValueChange={(v) => setData("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">{t("lessons.status.scheduled")}</SelectItem>
                    <SelectItem value="completed">{t("lessons.status.completed")}</SelectItem>
                    <SelectItem value="cancelled">{t("lessons.status.cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>{t("lessons.notes")}</Label>
                <Textarea
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={processing}>
              {isEdit ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
