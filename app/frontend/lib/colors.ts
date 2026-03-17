import type { LessonItem } from "@/types/pages"

// Request statuses
export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  submitted: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  in_review: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  awaiting_reply: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  awaiting_payment: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  payment_confirmed: "bg-green-100 text-green-700 hover:bg-green-100",
  in_progress: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  resolved: "bg-green-100 text-green-700 hover:bg-green-100",
  closed: "bg-gray-100 text-gray-700 hover:bg-gray-100",
}

export const STATUSES = Object.keys(STATUS_COLORS)

// Lesson statuses
export const LESSON_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-50 text-red-600",
}

// User roles
export const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-700",
  coordinator: "bg-blue-100 text-blue-700",
  teacher: "bg-green-100 text-green-700",
  student: "bg-gray-100 text-gray-600",
}

// Teacher color palette for admin calendar views
export interface TeacherColor {
  bg: string
  border: string
  text: string
  dot: string
}

export const TEACHER_COLORS: TeacherColor[] = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", dot: "bg-blue-500" },
  { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-800", dot: "bg-emerald-500" },
  { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-800", dot: "bg-violet-500" },
  { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-800", dot: "bg-amber-500" },
  { bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-800", dot: "bg-rose-500" },
  { bg: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-800", dot: "bg-cyan-500" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800", dot: "bg-orange-500" },
  { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-800", dot: "bg-indigo-500" },
]

export function getTeacherColor(teacherId: number, teacherIds: number[]): TeacherColor {
  const idx = teacherIds.indexOf(teacherId)
  return TEACHER_COLORS[(idx >= 0 ? idx : teacherId) % TEACHER_COLORS.length]
}

// Calendar lesson card color
export function getLessonCardColor(lesson: LessonItem): string {
  if (lesson.status === "completed" || lesson.status === "cancelled") {
    return "bg-gray-100 border-gray-200 text-gray-500"
  }
  if (lesson.meetingLinkReady) {
    return "bg-green-50 border-green-200 text-green-800"
  }
  return "bg-yellow-50 border-yellow-200 text-yellow-800"
}
