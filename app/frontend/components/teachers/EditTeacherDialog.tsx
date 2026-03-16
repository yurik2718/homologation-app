import { useState } from "react"
import { useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { routes } from "@/lib/routes"
import { TEACHER_LEVELS } from "@/lib/constants"
import type { TeacherItem } from "@/types/pages"

interface EditTeacherDialogProps {
  teacher: TeacherItem
  trigger: React.ReactNode
}

export function EditTeacherDialog({ teacher, trigger }: EditTeacherDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const { data, setData, patch, processing, errors } = useForm({
    level: teacher.level ?? "junior",
    hourly_rate: teacher.hourlyRate?.toString() ?? "",
    bio: teacher.bio ?? "",
    permanent_meeting_link: teacher.permanentMeetingLink ?? "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(routes.teacher(teacher.id), {
      onSuccess: () => setOpen(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("teachers.edit_profile")} — {teacher.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="level">{t("teachers.level")}</Label>
            <Select value={data.level} onValueChange={(v) => setData("level", v)}>
              <SelectTrigger id="level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEACHER_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && <p className="text-xs text-destructive">{errors.level}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="hourly_rate">{t("teachers.hourly_rate")}</Label>
            <Input
              id="hourly_rate"
              type="number"
              min="0"
              step="0.01"
              value={data.hourly_rate}
              onChange={(e) => setData("hourly_rate", e.target.value)}
            />
            {errors.hourly_rate && <p className="text-xs text-destructive">{errors.hourly_rate}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="bio">{t("teachers.bio")}</Label>
            <Textarea
              id="bio"
              value={data.bio}
              onChange={(e) => setData("bio", e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="permanent_meeting_link">{t("teachers.permanent_link")}</Label>
            <Input
              id="permanent_meeting_link"
              type="url"
              value={data.permanent_meeting_link}
              onChange={(e) => setData("permanent_meeting_link", e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={processing}>
              {t("common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
