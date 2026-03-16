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
